"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.body = exports.action = exports.defaultList = exports.defaultGet = exports.defaultUpdate = exports.defaultCreate = exports.parseUser = exports.wrapper = exports.hasPermission = exports.isSuperAdmin = exports.database = exports.inject = void 0;
const class_transformer_1 = require("class-transformer");
const class_validator_1 = require("class-validator");
function validationError(err) {
    const fields = {};
    const errors = Object.keys(err.errors);
    const messages = errors.map((e) => { fields[e] = err.errors[e].properties.message; return fields[e]; });
    throw { statusCode: 422, body: { success: false, message: messages.join(', '), error_fields: fields } };
}
function resolve(path, obj) {
    var properties = Array.isArray(path) ? path : path.split('.');
    return properties.reduce((prev, curr, _, __) => prev && prev[curr], obj);
}
function inject(injects) {
    return (constructor) => {
        const services = {};
        Object.keys(injects.services).forEach(key => {
            services[key] = new injects.services[key]();
        });
        constructor.prototype.services = services;
        constructor.prototype.model = injects.model;
    };
}
exports.inject = inject;
function database() {
    return (_, __, descriptor) => {
        const originalMethod = descriptor.value;
        descriptor.value = async function (...args) {
            console.log('Mongo trying');
            await this.mongooseService.connect(process.env.MONGO_URI);
            console.log('Mongo connected');
            return originalMethod.apply(this, args);
        };
        return descriptor;
    };
}
exports.database = database;
function isSuperAdmin() {
    return (_, __, descriptor) => {
        const originalMethod = descriptor.value;
        descriptor.value = async function (event, context, extraArgs) {
            if (event.requestContext.authorizer.claims.superadmin) {
                return originalMethod.apply(this, [event, context, extraArgs]);
            }
            throw {
                statusCode: 401,
                body: { success: false, message: 'unauthorized' }
            };
        };
        return descriptor;
    };
}
exports.isSuperAdmin = isSuperAdmin;
function hasPermission(permission, field) {
    return (_, __, descriptor) => {
        const originalMethod = descriptor.value;
        descriptor.value = async function (event, context, extraArgs) {
            const user = event.requestContext.authorizer.claims;
            const permissions = user.permissions[resolve(field, event)];
            if (user.superadmin || (permissions && permissions.find((perm) => perm === permission))) {
                return originalMethod.apply(this, [event, context, extraArgs]);
            }
            throw {
                statusCode: 401,
                body: { success: false, message: 'unauthorized' }
            };
        };
        return descriptor;
    };
}
exports.hasPermission = hasPermission;
function wrapper() {
    return (_, __, descriptor) => {
        const originalMethod = descriptor.value;
        descriptor.value = async function (event, context, extraArgs) {
            try {
                const result = await originalMethod.apply(this, [event, context, extraArgs]);
                return {
                    statusCode: result.statusCode,
                    body: JSON.stringify(result.body),
                    headers: {
                        'Access-Control-Allow-Origin': '*',
                        'Access-Control-Allow-Credentials': true
                    }
                };
            }
            catch (e) {
                return {
                    statusCode: e.statusCode || 500,
                    body: JSON.stringify(e.body || { success: false, message: 'unkown_error' }),
                    headers: {
                        'Access-Control-Allow-Origin': '*',
                        'Access-Control-Allow-Credentials': true
                    }
                };
            }
        };
        return descriptor;
    };
}
exports.wrapper = wrapper;
function parseUser() {
    return (_, __, descriptor) => {
        const originalMethod = descriptor.value;
        descriptor.value = async function (event, context, extraArgs) {
            event.requestContext.authorizer.claims = JSON.parse(event.requestContext.authorizer.stringKey);
            return originalMethod.apply(this, [event, context, extraArgs]);
        };
        return descriptor;
    };
}
exports.parseUser = parseUser;
function defaultCreate(hasFunction) {
    return (_, __, descriptor) => {
        const originalMethod = descriptor.value;
        descriptor.value = async function (event, context, extraArgs) {
            try {
                const body = hasFunction ? await originalMethod.apply(this, [event, context, extraArgs]) : JSON.parse(event.body);
                const result = await this.model.create(body);
                return {
                    statusCode: 201,
                    body: {
                        success: true, _id: result._id.toString()
                    }
                };
            }
            catch (e) {
                if (e.errors) {
                    validationError(e);
                }
                else if (typeof e === 'object') {
                    throw e;
                }
                else {
                    throw {};
                }
            }
        };
        return descriptor;
    };
}
exports.defaultCreate = defaultCreate;
function defaultUpdate(hasFunction, name) {
    return (_, __, descriptor) => {
        const originalMethod = descriptor.value;
        descriptor.value = async function (event, context, extraArgs) {
            try {
                const body = hasFunction ? await originalMethod.apply(this, [event, context, extraArgs]) : JSON.parse(event.body);
                const result = await this.model.updateOne({ _id: event.pathParameters._id }, {
                    $set: body
                });
                if (result.ok == 0) {
                    throw {
                        statusCode: 404,
                        body: { success: false, message: `${name}_not_found` }
                    };
                }
                return {
                    statusCode: 200,
                    body: {
                        success: true, _id: event.pathParameters._id
                    }
                };
            }
            catch (e) {
                if (e.errors) {
                    throw validationError(e);
                }
                else if (typeof e === 'object') {
                    throw e;
                }
                else {
                    throw {};
                }
            }
        };
        return descriptor;
    };
}
exports.defaultUpdate = defaultUpdate;
function defaultGet(name) {
    return (_, __, descriptor) => {
        const originalMethod = descriptor.value;
        descriptor.value = async function (event, context, extraArgs) {
            await originalMethod.apply(this, [event, context, extraArgs]);
            const result = await this.model.findOne({ _id: event.pathParameters._id }, this.model.publicFields());
            if (!result) {
                throw {
                    statusCode: 404,
                    body: { success: false, message: `${name}_not_found` }
                };
            }
            const body = { success: true, [name]: result };
            return {
                statusCode: 200,
                body
            };
        };
        return descriptor;
    };
}
exports.defaultGet = defaultGet;
function defaultList(name) {
    return (_, __, descriptor) => {
        const originalMethod = descriptor.value;
        descriptor.value = async function (event, context, extraArgs) {
            const { queryStringParameters: { page, size } } = event;
            try {
                await originalMethod.apply(this, [event, context, extraArgs]);
                const docs = await this.model.find({}, this.model.publicFields(), { limit: parseInt(size), skip: page * 10 });
                const count = await this.model.countDocuments({}, (err, count) => new Promise((resolve, reject) => {
                    if (err) {
                        reject(err);
                    }
                    resolve(count);
                }));
                return {
                    statusCode: 200,
                    body: { success: true, docs, paginate: { page: parseInt(page), count, size } }
                };
            }
            catch (e) {
                throw {
                    statusCode: 404,
                    body: { success: false, message: `${name}_not_found` }
                };
            }
        };
        return descriptor;
    };
}
exports.defaultList = defaultList;
function action() {
    return (_, __, descriptor) => {
        const originalMethod = descriptor.value;
        descriptor.value = async function (event, context, extraArgs) {
            try {
                return {
                    statusCode: 200,
                    body: Object.assign(Object.assign({}, await originalMethod.apply(this, [event, context, extraArgs])), { success: true })
                };
            }
            catch (e) {
                if (e.errors) {
                    validationError(e);
                }
                else if (typeof e === 'object') {
                    throw e;
                }
                else {
                    throw {};
                }
            }
        };
        return descriptor;
    };
}
exports.action = action;
function body(type) {
    return (_, __, descriptor) => {
        const originalMethod = descriptor.value;
        descriptor.value = async function (event, context, extraArgs) {
            try {
                extraArgs.body = (0, class_transformer_1.plainToClass)(type, JSON.parse(event.body));
                await (0, class_validator_1.validateOrReject)(extraArgs.body);
            }
            catch (e) {
                const errors = [];
                e.forEach((err) => {
                    errors.push({
                        field: err.property,
                        failures: Object.keys(err.constraints || {})
                    });
                });
                throw {
                    statusCode: 400,
                    body: {
                        success: false,
                        errors
                    }
                };
            }
            return originalMethod.apply(this, [event, context, extraArgs]);
        };
        return descriptor;
    };
}
exports.body = body;
