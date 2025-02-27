"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TimeLine = void 0;
const Time_1 = require("./Time");
const TIME_LINE_REGEX = /^\s*(?<startSign>[+\-]?)(?:(?<startHours>\d+):)?(?<startMinutes>\d+):(?<startSeconds>\d{2})(?:(?<startSeparator>[,.])(?<startMillis>\d+))?\s*(?<separator>-->|,)\s*(?<endSign>[+\-]?)(?:(?<endHours>\d+):)?(?<endMinutes>\d+):(?<endSeconds>\d{2})(?:(?<endSeparator>[,.])(?<endMillis>\d+))?\s*(?<extraData>.*?)\s*$/;
class TimeLine {
    constructor(startTime, endTime, separator = '-->', extraData = '') {
        this.startTime = startTime;
        this.endTime = endTime;
        this.separator = separator;
        this.extraData = extraData;
    }
    static parse(line) {
        var _a;
        const groups = (_a = line === null || line === void 0 ? void 0 : line.match(TIME_LINE_REGEX)) === null || _a === void 0 ? void 0 : _a.groups;
        if (!groups) {
            return null;
        }
        const startValue = Time_1.Time.value(groups.startSign, groups.startHours, groups.startMinutes, groups.startSeconds, groups.startMillis);
        const endValue = Time_1.Time.value(groups.endSign, groups.endHours, groups.endMinutes, groups.endSeconds, groups.endMillis);
        const startTime = new Time_1.Time(startValue, groups.startSeparator, (groups.startMillis || '').length === 2);
        const endTime = new Time_1.Time(endValue, groups.endSeparator, (groups.endMillis || '').length === 2);
        const separator = groups.separator === '-->' ? ` ${groups.separator} ` : groups.separator;
        const extraData = groups.extraData ? ' ' + groups.extraData : '';
        return new TimeLine(startTime, endTime, separator, extraData);
    }
    shift(offset) {
        this.startTime.shift(offset);
        this.endTime.shift(offset);
    }
    applyLinearCorrection(original, updated) {
        this.startTime.applyLinearCorrection(original, updated);
        this.endTime.applyLinearCorrection(original, updated);
    }
    convert(timeSeparator, millisSeparator, shortMillis) {
        this.startTime.convert(millisSeparator, shortMillis);
        this.endTime.convert(millisSeparator, shortMillis);
        this.separator = timeSeparator;
    }
    format() {
        return `${this.startTime.format()}${this.separator}${this.endTime.format()}${this.extraData}`;
    }
}
exports.TimeLine = TimeLine;
//# sourceMappingURL=TimeLine.js.map