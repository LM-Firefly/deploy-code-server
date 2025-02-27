'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
exports.USDateFormatParser = void 0;
/**
 * Example: 02/28/2020
 */
class USDateFormatParser {
    constructor() {
        this.pattern = new RegExp('(\\d{2})/(\\d{2})/(\\d{4})(?:T|\\b)');
    }
    parse(text) {
        const match = this.pattern.exec(text);
        if (match) {
            const normalized = `${match[3]}-${match[1]}-${match[2]}`;
            return {
                match: match,
                normalizedTimestamp: normalized,
                containsDate: true
            };
        }
        return null;
    }
}
exports.USDateFormatParser = USDateFormatParser;
//# sourceMappingURL=USDateFormatParser.js.map