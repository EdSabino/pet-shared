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
var validationError = require('./validation_error').validationError;
function parseUser(func) {
    var _this = this;
    return function (args) { return __awaiter(_this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            args.requestContext.authorizer.claims = JSON.parse(args.requestContext.authorizer.stringKey);
            return [2 /*return*/, func(args)];
        });
    }); };
}
function database(func, mongoose) {
    var _this = this;
    return function (args) { return __awaiter(_this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    console.log('Mongo trying');
                    return [4 /*yield*/, mongoose.connect(process.env.MONGO_URI)];
                case 1:
                    _a.sent();
                    console.log('Mongo connected');
                    return [2 /*return*/, func(args)];
            }
        });
    }); };
}
function handler(UseCase, success, failure) {
    var _this = this;
    return function (event) { return __awaiter(_this, void 0, void 0, function () {
        var res, err_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, UseCase.execute(event)];
                case 1:
                    res = _a.sent();
                    return [2 /*return*/, {
                            statusCode: success,
                            body: JSON.stringify(res),
                            headers: {
                                'Access-Control-Allow-Origin': '*',
                                'Access-Control-Allow-Credentials': true
                            }
                        }];
                case 2:
                    err_1 = _a.sent();
                    return [2 /*return*/, {
                            statusCode: failure,
                            body: JSON.stringify(err_1),
                            headers: {
                                'Access-Control-Allow-Origin': '*',
                                'Access-Control-Allow-Credentials': true
                            }
                        }];
                case 3: return [2 /*return*/];
            }
        });
    }); };
}
function isSuperAdmin(func) {
    var _this = this;
    return function (event) { return __awaiter(_this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    console.log(event.requestContext.authorizer);
                    if (!event.requestContext.authorizer.claims.superadmin) return [3 /*break*/, 2];
                    return [4 /*yield*/, func(event)];
                case 1: return [2 /*return*/, _a.sent()];
                case 2: return [2 /*return*/, {
                        statusCode: 401,
                        body: JSON.stringify({ success: false, message: 'unauthorized' })
                    }];
            }
        });
    }); };
}
function hasPermission(func, permission, field) {
    var _this = this;
    return function (event) { return __awaiter(_this, void 0, void 0, function () {
        var user, permissions;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    user = event.requestContext.authorizer.claims;
                    permissions = user.permissions[resolve(field, event)];
                    if (!(user.superadmin || (permissions && permissions.find(function (perm) { return perm === permission; })))) return [3 /*break*/, 2];
                    return [4 /*yield*/, func(event)];
                case 1: return [2 /*return*/, _a.sent()];
                case 2: return [2 /*return*/, {
                        statusCode: 401,
                        body: JSON.stringify({ success: false, message: 'unauthorized' })
                    }];
            }
        });
    }); };
}
var returnBody = function (body) { return body; };
function defaultCreate(Model, prepare) {
    var _this = this;
    if (prepare === void 0) { prepare = returnBody; }
    return {
        execute: function (_a) {
            var body = _a.body, requestContext = _a.requestContext;
            return __awaiter(_this, void 0, void 0, function () {
                var result, _b, _c, e_1;
                return __generator(this, function (_d) {
                    switch (_d.label) {
                        case 0:
                            _d.trys.push([0, 3, , 4]);
                            _c = (_b = Model).create;
                            return [4 /*yield*/, prepare(JSON.parse(body), requestContext)];
                        case 1: return [4 /*yield*/, _c.apply(_b, [_d.sent()])];
                        case 2:
                            result = _d.sent();
                            return [2 /*return*/, { success: true, _id: result._id.toString() }];
                        case 3:
                            e_1 = _d.sent();
                            if (e_1.errors) {
                                throw validationError(e_1);
                            }
                            else if (typeof e_1 === 'object') {
                                throw e_1;
                            }
                            else {
                                throw { success: false, message: 'unknown_error' };
                            }
                            return [3 /*break*/, 4];
                        case 4: return [2 /*return*/];
                    }
                });
            });
        }
    };
}
function defaultUpdate(Model, name, prepare) {
    var _this = this;
    if (prepare === void 0) { prepare = returnBody; }
    return {
        execute: function (_a) {
            var body = _a.body, pathParameters = _a.pathParameters;
            return __awaiter(_this, void 0, void 0, function () {
                var result, e_2;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0:
                            _b.trys.push([0, 2, , 3]);
                            return [4 /*yield*/, Model.updateOne({ _id: pathParameters._id }, {
                                    $set: prepare(JSON.parse(body), pathParameters)
                                })];
                        case 1:
                            result = _b.sent();
                            if (result.ok == 0) {
                                throw { success: false, message: name + "_not_found" };
                            }
                            return [2 /*return*/, { success: true, _id: pathParameters._id }];
                        case 2:
                            e_2 = _b.sent();
                            console.log(e_2);
                            if (e_2.errors) {
                                throw validationError(e_2);
                            }
                            else {
                                throw { success: false, message: 'unknown_error' };
                            }
                            return [3 /*break*/, 3];
                        case 3: return [2 /*return*/];
                    }
                });
            });
        }
    };
}
function defaultList(Model, name) {
    var _this = this;
    return {
        execute: function (_a) {
            var _b = _a.queryStringParameters, page = _b.page, size = _b.size;
            return __awaiter(_this, void 0, void 0, function () {
                var docs, count, e_3;
                return __generator(this, function (_c) {
                    switch (_c.label) {
                        case 0:
                            _c.trys.push([0, 3, , 4]);
                            return [4 /*yield*/, Model.find({}, Model.publicFields(), { limit: parseInt(size), skip: page * 10 })];
                        case 1:
                            docs = _c.sent();
                            return [4 /*yield*/, Model.countDocuments({}, function (err, count) { return new Promise(function (resolve, reject) {
                                    if (err) {
                                        reject(err);
                                    }
                                    resolve(count);
                                }); })];
                        case 2:
                            count = _c.sent();
                            return [2 /*return*/, { success: true, docs: docs, paginate: { page: parseInt(page), count: count, size: size } }];
                        case 3:
                            e_3 = _c.sent();
                            console.log(e_3);
                            throw { success: false, message: name + "_not_found" };
                        case 4: return [2 /*return*/];
                    }
                });
            });
        }
    };
}
function defaultGet(Model, name) {
    var _this = this;
    return {
        execute: function (_a) {
            var pathParameters = _a.pathParameters;
            return __awaiter(_this, void 0, void 0, function () {
                var result, base;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0: return [4 /*yield*/, Model.findOne({ _id: pathParameters._id }, Model.publicFields())];
                        case 1:
                            result = _b.sent();
                            if (!result) {
                                throw { success: false, message: name + "_not_found" };
                            }
                            base = { success: true };
                            base[name] = result;
                            return [2 /*return*/, base];
                    }
                });
            });
        }
    };
}
function resolve(path, obj) {
    var properties = Array.isArray(path) ? path : path.split('.');
    return properties.reduce(function (prev, curr) { return prev && prev[curr]; }, obj);
}
module.exports = {
    database: database,
    handler: handler,
    isSuperAdmin: isSuperAdmin,
    hasPermission: hasPermission,
    defaultCreate: defaultCreate,
    defaultUpdate: defaultUpdate,
    defaultList: defaultList,
    defaultGet: defaultGet,
    parseUser: parseUser
};
//# sourceMappingURL=decorators.js.map