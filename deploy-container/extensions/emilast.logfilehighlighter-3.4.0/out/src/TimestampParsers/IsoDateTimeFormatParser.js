'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
exports.IsoDateTimeFormatParser = void 0;
const RegExpParts_1 = require("./RegExpParts");
class IsoDateTimeFormatParser {
    constructor() {
        this.pattern = new RegExp(`\\d{4}-\\d{2}-\\d{2}${RegExpParts_1.RegExpParts.DateTimeSeparator}(${RegExpParts_1.RegExpParts.Time})${RegExpParts_1.RegExpParts.Microseconds}${RegExpParts_1.RegExpParts.TimeZone}`);
    }
    parse(text) {
        const match = this.pattern.exec(text);
        if (match) {
            return {
                match: match,
                normalizedTimestamp: match[0],
                containsDate: true
            };
        }
        return null;
    }
}
exports.IsoDateTimeFormatParser = IsoDateTimeFormatParser;
//# sourceMappingURL=IsoDateTimeFormatParser.js.map