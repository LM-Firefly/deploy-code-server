"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TimeWithMicroseconds = void 0;
class TimeWithMicroseconds {
    constructor(time, microseconds) {
        this.time = time;
        this.microseconds = microseconds || 0;
    }
    getTimeAsEpoch() {
        return this.time.valueOf() * 1000 + this.microseconds;
    }
}
exports.TimeWithMicroseconds = TimeWithMicroseconds;
//# sourceMappingURL=TimeWithMicroseconds.js.map