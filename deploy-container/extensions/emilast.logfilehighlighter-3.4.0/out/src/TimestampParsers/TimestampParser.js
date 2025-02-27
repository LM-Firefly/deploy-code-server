'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
exports.ParsedTimestamp = exports.TimestampMatch = exports.TimestampParser = void 0;
const moment = require("moment");
const TimeFormatParser_1 = require("./TimeFormatParser");
const DanishDateFormatParser_1 = require("./DanishDateFormatParser");
const IsoDateFormatParser_1 = require("./IsoDateFormatParser");
const USDateFormatParser_1 = require("./USDateFormatParser");
const DanishDateTimeFormatParser_1 = require("./DanishDateTimeFormatParser");
const IsoDateTimeFormatParser_1 = require("./IsoDateTimeFormatParser");
const USDateTimeFormatParser_1 = require("./USDateTimeFormatParser");
const LittleEndianDateFormatParser_1 = require("./LittleEndianDateFormatParser");
const LittleEndianDateTimeFormatParser_1 = require("./LittleEndianDateTimeFormatParser");
const IsoSlimDateTimeFormatParser_1 = require("./IsoSlimDateTimeFormatParser");
class TimestampParser {
    constructor() {
        this.parsers = [
            new IsoDateTimeFormatParser_1.IsoDateTimeFormatParser(),
            new IsoSlimDateTimeFormatParser_1.IsoSlimDateTimeFormatParser(),
            new USDateTimeFormatParser_1.USDateTimeFormatParser(),
            new DanishDateTimeFormatParser_1.DanishDateTimeFormatParser(),
            new LittleEndianDateTimeFormatParser_1.LittleEndianDateTimeFormatParser(),
            new IsoDateFormatParser_1.IsoDateFormatParser(),
            new USDateFormatParser_1.USDateFormatParser(),
            new DanishDateFormatParser_1.DanishDateFormatParser(),
            new LittleEndianDateFormatParser_1.LittleEndianDateFormatParser(),
            new TimeFormatParser_1.TimeFormatParser()
        ];
    }
    getTimestampFromText(text) {
        for (const parser of this.parsers) {
            const match = parser.parse(text);
            if (match) {
                return this._createTimestampFromMatch(match);
            }
        }
        return undefined;
    }
    _createTimestampFromMatch(match) {
        var _a;
        // console.log('TimestampParser', match);
        const microsecondsMatch = (_a = match.match.groups) === null || _a === void 0 ? void 0 : _a.microseconds;
        let microseconds = 0;
        if (microsecondsMatch) {
            microseconds = parseInt(microsecondsMatch);
        }
        const matchedString = match.match[0];
        const normalizedTimestamp = match.normalizedTimestamp;
        return {
            original: matchedString,
            matchIndex: match.match.index,
            moment: match.containsDate ? moment(normalizedTimestamp, moment.ISO_8601) : undefined,
            duration: !match.containsDate ? moment.duration(normalizedTimestamp) : undefined,
            microseconds: microseconds
        };
    }
}
exports.TimestampParser = TimestampParser;
/**
 * Represents a match of a timestamp within a log file.
 */
class TimestampMatch {
}
exports.TimestampMatch = TimestampMatch;
class ParsedTimestamp {
}
exports.ParsedTimestamp = ParsedTimestamp;
//# sourceMappingURL=TimestampParser.js.map