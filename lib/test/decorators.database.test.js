"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
const index_1 = require("../src/index");
describe('@database', () => {
    const mockConnect = jest.fn(x => x);
    class Mock {
        constructor() {
            this.mongooseService = {
                connect: mockConnect
            };
        }
        test() { }
    }
    __decorate([
        (0, index_1.database)()
    ], Mock.prototype, "test", null);
    describe('must be called', () => {
        beforeEach(() => {
            const mock = new Mock();
            mock.test();
        });
        it('once', () => {
            expect(mockConnect.mock.calls.length).toBe(1);
        });
    });
});
