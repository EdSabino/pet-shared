"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
const index_1 = require("../src/index");
describe('@hasPermission', () => {
    class Mock {
        constructor() {
            this.callback = jest.fn();
        }
        async test(event) {
            this.callback();
        }
    }
    __decorate([
        (0, index_1.hasPermission)('permission', 'pathParameters.establishment_id')
    ], Mock.prototype, "test", null);
    describe('when does not have permission', () => {
        const mock = new Mock();
        const result = { statusCode: 401, body: { success: false, message: 'unauthorized' } };
        const event = {
            pathParameters: {
                establishment_id: 'est'
            },
            requestContext: {
                authorizer: {
                    claims: {
                        superadmin: false,
                        permissions: {}
                    }
                }
            }
        };
        it('must return 401', async () => {
            await expect(async () => mock.test(event)).rejects.toEqual(result);
        });
        it('must not call callback', () => {
            mock.test(event).catch(() => {
                expect(mock.callback.mock.calls.length).toBe(0);
            });
        });
    });
    describe('when is superadmin', () => {
        const mock = new Mock();
        const validEvent = {
            pathParameters: {
                establishment_id: 'est'
            },
            requestContext: {
                authorizer: {
                    claims: {
                        superadmin: true,
                        permissions: {}
                    }
                }
            }
        };
        it('must call callback', () => {
            mock.test(validEvent).then(() => {
                expect(mock.callback.mock.calls.length).toBe(1);
            });
        });
    });
    describe('when hasPermission', () => {
        const mock = new Mock();
        const validEvent = {
            pathParameters: {
                establishment_id: 'est'
            },
            requestContext: {
                authorizer: {
                    claims: {
                        superadmin: false,
                        permissions: {
                            est: ['permission']
                        }
                    }
                }
            }
        };
        it('must call callback', () => {
            mock.test(validEvent).then(() => {
                expect(mock.callback.mock.calls.length).toBe(1);
            });
        });
    });
});
