'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
exports.DanishDateFormatParser = void 0;
/**
 * Example: 28.02.2020
 */
class DanishDateFormatParser {
    constructor() {
        this.pattern = new RegExp('(\\d{2})\\.(\\d{2})\\.(\\d{4})(?:T|\\b)');
    }
    parse(text) {
        const match = this.pattern.exec(text);
        if (match) {
            const normalized = `${match[3]}-${match[2]}-${match[1]}`;
            return {
                match: match,
                normalizedTimestamp: normalized,
                containsDate: true
            };
        }
        return null;
    }
}
exports.DanishDateFormatParser = DanishDateFormatParser;
//# sourceMappingURL=DanishDateFormatParser.js.map