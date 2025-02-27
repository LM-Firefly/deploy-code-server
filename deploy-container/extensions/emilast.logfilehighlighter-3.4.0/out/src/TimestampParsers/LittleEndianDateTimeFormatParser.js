'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
exports.LittleEndianDateTimeFormatParser = void 0;
const RegExpParts_1 = require("./RegExpParts");
/**
 * Example: 02-28-2020 13:54
 */
class LittleEndianDateTimeFormatParser {
    constructor() {
        this.pattern = new RegExp(`(\\d{2})-(\\d{2})-(\\d{4})(${RegExpParts_1.RegExpParts.DateTimeSeparator}(${RegExpParts_1.RegExpParts.Time})${RegExpParts_1.RegExpParts.Microseconds}${RegExpParts_1.RegExpParts.TimeZone})`);
    }
    parse(text) {
        const match = this.pattern.exec(text);
        if (match) {
            const normalized = `${match[3]}-${match[2]}-${match[1]} ${match[6] || ''}`.replace(',', '.').trim();
            return {
                match: match,
                normalizedTimestamp: normalized,
                containsDate: true
            };
        }
        return null;
    }
}
exports.LittleEndianDateTimeFormatParser = LittleEndianDateTimeFormatParser;
//# sourceMappingURL=LittleEndianDateTimeFormatParser.js.map