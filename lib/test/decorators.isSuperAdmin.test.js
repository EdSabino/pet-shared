"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
const index_1 = require("../src/index");
describe('@isSuperAdmin', () => {
    class Mock {
        constructor() {
            this.callback = jest.fn();
        }
        async test(event) {
            this.callback();
        }
    }
    __decorate([
        (0, index_1.isSuperAdmin)()
    ], Mock.prototype, "test", null);
    describe('when not superadmin', () => {
        const mock = new Mock();
        const result = { statusCode: 401, body: { success: false, message: 'unauthorized' } };
        const event = {
            requestContext: {
                authorizer: {
                    claims: {
                        superadmin: false
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
        const event = {
            requestContext: {
                authorizer: {
                    claims: {
                        superadmin: true
                    }
                }
            }
        };
        it('must call callback', () => {
            mock.test(event).then(() => {
                expect(mock.callback.mock.calls.length).toBe(1);
            });
        });
    });
});
