"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
const index_1 = require("../src/index");
describe('@defaultList', () => {
    describe('when success', () => {
        class Mock {
            constructor() {
                this.model = {
                    find: jest.fn(() => [{ result: true }]),
                    countDocuments: jest.fn(() => 12),
                    publicFields: jest.fn(() => 'name')
                };
            }
            async test(event) { }
        }
        __decorate([
            (0, index_1.defaultList)('test')
        ], Mock.prototype, "test", null);
        const mock = new Mock();
        const event = {
            queryStringParameters: {
                page: 1,
                size: 10
            }
        };
        it('must return value formatted', async () => {
            expect(await mock.test(event)).toStrictEqual({
                statusCode: 200,
                body: {
                    success: true,
                    docs: [{ result: true }],
                    paginate: {
                        page: 1,
                        count: 12,
                        size: 10
                    }
                }
            });
            expect(mock.model.find.mock.calls.length).toBe(1);
            expect(mock.model.countDocuments.mock.calls.length).toBe(1);
            expect(mock.model.publicFields.mock.calls.length).toBe(1);
        });
    });
    describe('when throws error', () => {
        class Mock {
            constructor(error) {
                this.error = error;
                this.model = {
                    find: jest.fn(x => x),
                    countDocuments: jest.fn(() => 0),
                    publicFields: jest.fn(() => 'name')
                };
            }
            async test(event) {
                throw this.error;
            }
        }
        __decorate([
            (0, index_1.defaultList)('test')
        ], Mock.prototype, "test", null);
        const mock = new Mock('');
        const event = {
            queryStringParameters: {
                page: 1,
                size: 10
            }
        };
        it('must throws empty error', async () => {
            await expect(async () => mock.test(event)).rejects.toEqual({
                statusCode: 404,
                body: { success: false, message: `test_not_found` }
            });
            expect(mock.model.find.mock.calls.length).toBe(0);
            expect(mock.model.countDocuments.mock.calls.length).toBe(0);
            expect(mock.model.publicFields.mock.calls.length).toBe(0);
        });
    });
});
