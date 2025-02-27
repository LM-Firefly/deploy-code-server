"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Time = exports.TIME_TAG_REGEX = exports.TIME_REGEX = void 0;
exports.TIME_REGEX = /^\s*(?<sign>[+\-]?)(?:(?<hours>\d+):)?(?<minutes>\d+):(?<seconds>\d{2})(?:(?<separator>[,.])(?<millis>\d+))?\s*$/;
exports.TIME_TAG_REGEX = /\<((?<sign>[+\-]?)(?:(?<hours>\d+):)?(?<minutes>\d+):(?<seconds>\d{2})(?:(?<separator>[,.])(?<millis>\d+))?)\>/g;
class Time {
    constructor(value, separator, shortMillis) {
        this.value = value;
        this.separator = separator;
        this.shortMillis = shortMillis;
    }
    shift(offset) {
        this.value += offset;
    }
    applyLinearCorrection(original, updated) {
        const factor = (updated.endTime.value - updated.startTime.value)
            / (original.endTime.value - original.startTime.value);
        this.value = (this.value - original.startTime.value) * factor + updated.startTime.value;
    }
    convert(separator, shortMillis) {
        this.separator = separator;
        this.shortMillis = shortMillis;
    }
    normalize() {
        this.separator = ',';
        this.shortMillis = false;
    }
    static value(sign, hours, minutes, seconds, millis) {
        return (sign === '-' ? -1 : 1) * (Number(hours || 0) * 60 * 60
            + Number(minutes || 0) * 60
            + Number(seconds || 0)
            + Number((millis || '').substr(0, 3)) / Time.pow10(String(millis || '').length));
    }
    static parse(text) {
        var _a;
        const groups = ((_a = text === null || text === void 0 ? void 0 : text.match(exports.TIME_REGEX)) === null || _a === void 0 ? void 0 : _a.groups) || {};
        const value = Time.value(groups.sign, groups.hours, groups.minutes, groups.seconds, groups.millis);
        const separator = groups.separator || ',';
        const shortMillis = (groups.millis || '').length === 2;
        return new Time(value, separator, shortMillis);
    }
    format() {
        let value = Math.abs(this.value);
        const hours = Math.floor(value / (60 * 60));
        value -= hours * 60 * 60;
        const minutes = Math.floor(value / 60);
        value -= minutes * 60;
        const seconds = Math.floor(value);
        value -= seconds;
        const millis = Math.round(value * (this.shortMillis ? 100 : 1000));
        return (this.value < 0 ? '-' : '')
            + Time.pad2(hours)
            + ':'
            + Time.pad2(minutes)
            + ':'
            + Time.pad2(seconds)
            + this.separator
            + (this.shortMillis ? Time.pad2(millis) : Time.pad3(millis));
    }
    static pow10(value) {
        switch (value) {
            case 0: return 1;
            case 1: return 10;
            case 2: return 100;
            default:
            case 3: return 1000;
        }
    }
    static pad2(value) {
        return value < 10 ? '0' + String(value) : String(value);
    }
    static pad3(value) {
        if (value < 10) {
            return '00' + String(value);
        }
        else if (value < 100) {
            return '0' + String(value);
        }
        else {
            return String(value);
        }
    }
}
exports.Time = Time;
//# sourceMappingURL=Time.js.map