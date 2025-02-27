'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
exports.IsoDateFormatParser = void 0;
class IsoDateFormatParser {
    constructor() {
        this.pattern = new RegExp('\\d{4}-\\d{2}-\\d{2}(?:T|\\b)');
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
exports.IsoDateFormatParser = IsoDateFormatParser;
//# sourceMappingURL=IsoDateFormatParser.js.map