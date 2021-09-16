"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.defaultList = exports.defaultGet = exports.defaultUpdate = exports.defaultCreate = exports.parseUser = exports.wrapper = exports.hasPermission = exports.isSuperAdmin = exports.database = void 0;
function validationError(err) {
    var fields = {};
    var errors = Object.keys(err.errors);
    var messages = errors.map(function (e) { fields[e] = err.errors[e].properties.message; return fields[e]; });
    throw { statusCode: 422, body: { success: false, message: messages.join(', '), error_fields: fields } };
}
function resolve(path, obj) {
    var properties = Array.isArray(path) ? path : path.split('.');
    return properties.reduce(function (prev, curr, _, __) { return prev && prev[curr]; }, obj);
}
function database() {
    return function (_, __, descriptor) {
        var originalMethod = descriptor.value;
        descriptor.value = function () {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i] = arguments[_i];
            }
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            console.log('Mongo trying');
                            return [4 /*yield*/, this.mongooseService.connect(process.env.MONGO_URI)];
                        case 1:
                            _a.sent();
                            console.log('Mongo connected');
                            return [2 /*return*/, originalMethod.apply(this, args)];
                    }
                });
            });
        };
        return descriptor;
    };
}
exports.database = database;
function isSuperAdmin() {
    return function (_, __, descriptor) {
        var originalMethod = descriptor.value;
        descriptor.value = function (event, context) {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    if (event.requestContext.authorizer.claims.superadmin) {
                        return [2 /*return*/, originalMethod.apply(this, [event, context])];
                    }
                    throw {
                        statusCode: 401,
                        body: { success: false, message: 'unauthorized' }
                    };
                });
            });
        };
        return descriptor;
    };
}
exports.isSuperAdmin = isSuperAdmin;
function hasPermission(permission, field) {
    return function (_, __, descriptor) {
        var originalMethod = descriptor.value;
        descriptor.value = function (event, context) {
            return __awaiter(this, void 0, void 0, function () {
                var user, permissions;
                return __generator(this, function (_a) {
                    user = event.requestContext.authorizer.claims;
                    permissions = user.permissions[resolve(field, event)];
                    if (user.superadmin || (permissions && permissions.find(function (perm) { return perm === permission; }))) {
                        return [2 /*return*/, originalMethod.apply(this, [event, context])];
                    }
                    return [2 /*return*/, {
                            statusCode: 401,
                            body: { success: false, message: 'unauthorized' }
                        }];
                });
            });
        };
        return descriptor;
    };
}
exports.hasPermission = hasPermission;
function wrapper() {
    return function (_, __, descriptor) {
        var originalMethod = descriptor.value;
        descriptor.value = function (event, context) {
            return __awaiter(this, void 0, void 0, function () {
                var result, e_1;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            _a.trys.push([0, 2, , 3]);
                            return [4 /*yield*/, originalMethod.apply(this, [event, context])];
                        case 1:
                            result = _a.sent();
                            return [2 /*return*/, {
                                    statusCode: result.statusCode,
                                    body: JSON.stringify(result.body),
                                    headers: {
                                        'Access-Control-Allow-Origin': '*',
                                        'Access-Control-Allow-Credentials': true
                                    }
                                }];
                        case 2:
                            e_1 = _a.sent();
                            console.log(e_1);
                            return [2 /*return*/, {
                                    statusCode: e_1.statusCode || 500,
                                    body: JSON.stringify(e_1.body || { success: false, message: 'unkown_error' }),
                                    headers: {
                                        'Access-Control-Allow-Origin': '*',
                                        'Access-Control-Allow-Credentials': true
                                    }
                                }];
                        case 3: return [2 /*return*/];
                    }
                });
            });
        };
        return descriptor;
    };
}
exports.wrapper = wrapper;
function parseUser() {
    return function (_, __, descriptor) {
        var originalMethod = descriptor.value;
        descriptor.value = function (event, context) {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    event.requestContext.authorizer.claims = JSON.parse(event.requestContext.authorizer.stringKey);
                    return [2 /*return*/, originalMethod.apply(this, [event, context])];
                });
            });
        };
        return descriptor;
    };
}
exports.parseUser = parseUser;
function defaultCreate(hasFunction) {
    return function (_, __, descriptor) {
        var originalMethod = descriptor.value;
        descriptor.value = function (event, context) {
            return __awaiter(this, void 0, void 0, function () {
                var body, _a, result, e_2;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0:
                            _b.trys.push([0, 5, , 6]);
                            if (!hasFunction) return [3 /*break*/, 2];
                            return [4 /*yield*/, originalMethod.apply(this, [event, context])];
                        case 1:
                            _a = _b.sent();
                            return [3 /*break*/, 3];
                        case 2:
                            _a = JSON.parse(event.body);
                            _b.label = 3;
                        case 3:
                            body = _a;
                            return [4 /*yield*/, this.model.create(body)];
                        case 4:
                            result = _b.sent();
                            return [2 /*return*/, {
                                    statusCode: 201,
                                    body: {
                                        success: true, _id: result._id.toString()
                                    }
                                }];
                        case 5:
                            e_2 = _b.sent();
                            if (e_2.errors) {
                                validationError(e_2);
                            }
                            else if (typeof e_2 === 'object') {
                                throw e_2;
                            }
                            else {
                                throw {};
                            }
                            return [3 /*break*/, 6];
                        case 6: return [2 /*return*/];
                    }
                });
            });
        };
        return descriptor;
    };
}
exports.defaultCreate = defaultCreate;
function defaultUpdate(hasFunction, name) {
    return function (_, __, descriptor) {
        var originalMethod = descriptor.value;
        descriptor.value = function (event, context) {
            return __awaiter(this, void 0, void 0, function () {
                var body, _a, result, e_3;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0:
                            _b.trys.push([0, 5, , 6]);
                            if (!hasFunction) return [3 /*break*/, 2];
                            return [4 /*yield*/, originalMethod.apply(this, [event, context])];
                        case 1:
                            _a = _b.sent();
                            return [3 /*break*/, 3];
                        case 2:
                            _a = JSON.parse(event.body);
                            _b.label = 3;
                        case 3:
                            body = _a;
                            return [4 /*yield*/, this.model.updateOne({ _id: event.pathParameters._id }, {
                                    $set: body
                                })];
                        case 4:
                            result = _b.sent();
                            if (result.ok == 0) {
                                throw {
                                    statusCode: 404,
                                    body: { success: false, message: name + "_not_found" }
                                };
                            }
                            return [2 /*return*/, {
                                    statusCode: 200,
                                    body: {
                                        success: true, _id: event.pathParameters._id
                                    }
                                }];
                        case 5:
                            e_3 = _b.sent();
                            if (e_3.errors) {
                                throw validationError(e_3);
                            }
                            else if (typeof e_3 === 'object') {
                                throw e_3;
                            }
                            else {
                                throw {};
                            }
                            return [3 /*break*/, 6];
                        case 6: return [2 /*return*/];
                    }
                });
            });
        };
        return descriptor;
    };
}
exports.defaultUpdate = defaultUpdate;
function defaultGet(name) {
    return function (_, __, descriptor) {
        var originalMethod = descriptor.value;
        descriptor.value = function (event, context) {
            return __awaiter(this, void 0, void 0, function () {
                var result, body;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, originalMethod.apply(this, [event, context])];
                        case 1:
                            _a.sent();
                            return [4 /*yield*/, this.model.findOne({ _id: event.pathParameters._id }, this.model.publicFields())];
                        case 2:
                            result = _a.sent();
                            if (!result) {
                                throw {
                                    statusCode: 404,
                                    body: { success: false, message: name + "_not_found" }
                                };
                            }
                            body = { success: true };
                            body[name] = result;
                            return [2 /*return*/, {
                                    statusCode: 200,
                                    body: body
                                }];
                    }
                });
            });
        };
        return descriptor;
    };
}
exports.defaultGet = defaultGet;
function defaultList(name) {
    return function (_, __, descriptor) {
        var originalMethod = descriptor.value;
        descriptor.value = function (event, context) {
            return __awaiter(this, void 0, void 0, function () {
                var _a, page, size, docs, count, e_4;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0:
                            _a = event.queryStringParameters, page = _a.page, size = _a.size;
                            _b.label = 1;
                        case 1:
                            _b.trys.push([1, 5, , 6]);
                            return [4 /*yield*/, originalMethod.apply(this, [event, context])];
                        case 2:
                            _b.sent();
                            return [4 /*yield*/, this.model.find({}, this.model.publicFields(), { limit: parseInt(size), skip: page * 10 })];
                        case 3:
                            docs = _b.sent();
                            return [4 /*yield*/, this.model.countDocuments({}, function (err, count) { return new Promise(function (resolve, reject) {
                                    if (err) {
                                        reject(err);
                                    }
                                    resolve(count);
                                }); })];
                        case 4:
                            count = _b.sent();
                            return [2 /*return*/, {
                                    statusCode: 200,
                                    body: { success: true, docs: docs, paginate: { page: parseInt(page), count: count, size: size } }
                                }];
                        case 5:
                            e_4 = _b.sent();
                            throw {
                                statusCode: 404,
                                body: { success: false, message: name + "_not_found" }
                            };
                        case 6: return [2 /*return*/];
                    }
                });
            });
        };
        return descriptor;
    };
}
exports.defaultList = defaultList;
//# sourceMappingURL=decorators.js.map