'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
exports.IsoSlimDateTimeFormatParser = void 0;
const RegExpParts_1 = require("./RegExpParts");
class IsoSlimDateTimeFormatParser {
    constructor() {
        this.pattern = new RegExp(`(\\d{4}-\\d{2}-\\d{2})${RegExpParts_1.RegExpParts.DateTimeSeparator}(${RegExpParts_1.RegExpParts.TimeSlim})${RegExpParts_1.RegExpParts.Microseconds}${RegExpParts_1.RegExpParts.TimeZoneSlim}`);
    }
    parse(text) {
        const match = this.pattern.exec(text);
        if (match) {
            const timezone = `${match[9] || ''}${match[10] ? match[10] + ':' + match[11] : ''}`;
            const normalized = `${match[1]} ${match[4]}:${match[5]}:${match[6] || '00'}${timezone}`.replace(',', '.').trim();
            return {
                match: match,
                normalizedTimestamp: normalized,
                containsDate: true
            };
        }
        return null;
    }
}
exports.IsoSlimDateTimeFormatParser = IsoSlimDateTimeFormatParser;
//# sourceMappingURL=IsoSlimDateTimeFormatParser.js.map