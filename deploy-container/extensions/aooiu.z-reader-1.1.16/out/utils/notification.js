"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.showWarningMessage = exports.showNotification = exports.Notification = void 0;
const vscode_1 = require("vscode");
class Notification {
    constructor(title) {
        this.isStop = false;
        this.options = {
            location: vscode_1.ProgressLocation.Notification,
            title: 'loding...'
        };
        if (title) {
            this.options.title = title;
        }
        this.start();
    }
    start() {
        return __awaiter(this, void 0, void 0, function* () {
            this.isStop = false;
            vscode_1.window.withProgress(this.options, () => __awaiter(this, void 0, void 0, function* () {
                yield new Promise((resolve) => {
                    setInterval(() => {
                        if (this.isStop) {
                            resolve(1);
                        }
                    }, 500);
                });
            }));
        });
    }
    stop() {
        this.isStop = true;
    }
}
exports.Notification = Notification;
function showNotification(tip, timer) {
    const notification = new Notification(tip);
    if (timer) {
        setTimeout(() => {
            notification.stop();
        }, timer);
    }
}
exports.showNotification = showNotification;
function showWarningMessage(tip) {
    vscode_1.window.showWarningMessage(tip);
}
exports.showWarningMessage = showWarningMessage;
//# sourceMappingURL=notification.js.map