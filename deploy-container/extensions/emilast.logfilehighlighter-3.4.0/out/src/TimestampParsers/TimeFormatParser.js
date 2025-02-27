'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
exports.TimeFormatParser = void 0;
class TimeFormatParser {
    constructor() {
        this.pattern = new RegExp('\\d{2}:\\d{2}(?::\\d{2}(?:[.,]\\d{3}(?<microseconds>\\d{3})?)?)?(?:Z| ?[+-]\\d{2}:\\d{2})?\\b');
    }
    parse(text) {
        const match = this.pattern.exec(text);
        if (match) {
            return {
                match: match,
                normalizedTimestamp: match[0].replace(',', '.'),
                containsDate: false
            };
        }
        return null;
    }
}
exports.TimeFormatParser = TimeFormatParser;
//# sourceMappingURL=TimeFormatParser.js.map