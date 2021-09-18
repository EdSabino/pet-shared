"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
const index_1 = require("../src/index");
describe('@defaultGet', () => {
    describe('when success', () => {
        class Mock {
            constructor() {
                this.model = {
                    findOne: jest.fn(x => ({ result: true })),
                    publicFields: jest.fn(() => 'name')
                };
            }
            async test(event) { }
        }
        __decorate([
            (0, index_1.defaultGet)('test')
        ], Mock.prototype, "test", null);
        const mock = new Mock();
        const event = {
            pathParameters: {
                _id: '1234'
            },
        };
        it('must return value formatted', async () => {
            expect(await mock.test(event)).toStrictEqual({
                statusCode: 200,
                body: {
                    success: true,
                    test: { result: true }
                }
            });
        });
        it('must have called updateOne', async () => {
            await mock.test(event);
            expect(mock.model.findOne.mock.calls.length).toBe(2);
            expect(mock.model.publicFields.mock.calls.length).toBe(2);
        });
    });
    describe('when is not founded', () => {
        class Mock {
            constructor() {
                this.model = {
                    findOne: jest.fn(x => null),
                    publicFields: jest.fn(() => 'name')
                };
            }
            async test(event) { }
        }
        __decorate([
            (0, index_1.defaultGet)('test')
        ], Mock.prototype, "test", null);
        const mock = new Mock();
        const event = {
            pathParameters: {
                _id: '1234'
            },
        };
        it('must throws not found error', async () => {
            await expect(async () => mock.test(event)).rejects.toEqual({
                statusCode: 404,
                body: { success: false, message: `test_not_found` }
            });
            expect(mock.model.findOne.mock.calls.length).toBe(1);
            expect(mock.model.publicFields.mock.calls.length).toBe(1);
        });
    });
});
