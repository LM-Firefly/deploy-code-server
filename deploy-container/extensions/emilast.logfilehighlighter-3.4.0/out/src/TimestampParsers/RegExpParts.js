'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
exports.RegExpParts = void 0;
class RegExpParts {
}
exports.RegExpParts = RegExpParts;
/** Separator between date and time parts, either 'T' or a space */
RegExpParts.DateTimeSeparator = '((?:T|\\b) ?)';
/** Time pattern in format HH:MM:SS[.mmm] */
RegExpParts.Time = '\\d{2}:\\d{2}(?::\\d{2}(?:[.,]\\d{3})?)?';
/** Time pattern in format HHMMSS[.mmm] */
RegExpParts.TimeSlim = '(\\d{2})(\\d{2})(?:(\\d{2}(?:[.,]\\d{3})?))?';
/** Pattern for microseconds (3 digits optionally followed by one more digit)
 * NB: The 4th digit is outside the grouping and is therefore ignored since microseconds are only accurate to 6 digits.
 */
RegExpParts.Microseconds = '(?<microseconds>\\d{3})?\\d?';
/** Optional timezone pattern (Z or ±HH:MM) */
RegExpParts.TimeZone = '(?:Z| ?[+-]\\d{2}:\\d{2})?\\b';
/** Optional timezone pattern (Z or ±HHMM) */
RegExpParts.TimeZoneSlim = '(?:(Z)|([+-])(\\d{2})(\\d{2}))?\\b';
//# sourceMappingURL=RegExpParts.js.map