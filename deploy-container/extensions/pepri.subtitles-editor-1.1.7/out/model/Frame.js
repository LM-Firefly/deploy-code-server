"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Frame = void 0;
var Frame;
(function (Frame) {
    function compareSequence(a, b) {
        return a.sequence !== b.sequence ? a.sequence - b.sequence : a.lineIndex - b.lineIndex;
    }
    Frame.compareSequence = compareSequence;
    function compareTimestamp(a, b) {
        if (a.timeLine !== null || b.timeLine !== null) {
            if (a.timeLine === null) {
                return -1;
            }
            if (b.timeLine === null) {
                return 1;
            }
            if (a.timeLine.startTime !== b.timeLine.startTime) {
                return a.timeLine.startTime.value - b.timeLine.startTime.value;
            }
            if (a.timeLine.endTime !== b.timeLine.endTime) {
                return a.timeLine.endTime.value - b.timeLine.endTime.value;
            }
        }
        return compareSequence(a, b);
    }
    Frame.compareTimestamp = compareTimestamp;
})(Frame = exports.Frame || (exports.Frame = {}));
//# sourceMappingURL=Frame.js.map