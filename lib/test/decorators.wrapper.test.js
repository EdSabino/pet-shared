"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
const index_1 = require("../src/index");
describe('@wrapper', () => {
    describe('must return success', () => {
        const successBody = {
            statusCode: 200,
            body: { something: true }
        };
        class Mock {
            test() {
                return successBody;
            }
        }
        __decorate([
            (0, index_1.wrapper)()
        ], Mock.prototype, "test", null);
        const mock = new Mock();
        it('must return formatted answer', async () => {
            expect(await mock.test()).toEqual({
                statusCode: 200,
                body: "{\"something\":true}",
                headers: {
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Credentials': true
                }
            });
        });
    });
    describe('when throws random error', () => {
        class Mock {
            test() {
                throw {};
            }
        }
        __decorate([
            (0, index_1.wrapper)()
        ], Mock.prototype, "test", null);
        const mock = new Mock();
        it('must return formatted answer', async () => {
            expect(await mock.test()).toEqual({
                statusCode: 500,
                body: "{\"success\":false,\"message\":\"unkown_error\"}",
                headers: {
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Credentials': true
                }
            });
        });
    });
    describe('when throws error with status code', () => {
        class Mock {
            test() {
                throw {
                    statusCode: 404
                };
            }
        }
        __decorate([
            (0, index_1.wrapper)()
        ], Mock.prototype, "test", null);
        const mock = new Mock();
        it('must return formatted answer', async () => {
            expect(await mock.test()).toEqual({
                statusCode: 404,
                body: "{\"success\":false,\"message\":\"unkown_error\"}",
                headers: {
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Credentials': true
                }
            });
        });
    });
    describe('when throws error with body', () => {
        class Mock {
            test() {
                throw {
                    body: { success: false, message: 'error' }
                };
            }
        }
        __decorate([
            (0, index_1.wrapper)()
        ], Mock.prototype, "test", null);
        const mock = new Mock();
        it('must return formatted answer', async () => {
            expect(await mock.test()).toEqual({
                statusCode: 500,
                body: "{\"success\":false,\"message\":\"error\"}",
                headers: {
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Credentials': true
                }
            });
        });
    });
});
