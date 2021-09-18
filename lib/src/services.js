"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MongooseService = void 0;
const mongoose_1 = require("mongoose");
class MongooseService {
    async connect(url) {
        await (0, mongoose_1.connect)(url);
    }
}
exports.MongooseService = MongooseService;
