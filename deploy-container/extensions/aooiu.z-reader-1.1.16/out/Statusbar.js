"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.statusbar = void 0;
const vscode_1 = require("vscode");
const ReaderManager_1 = require("./ReaderManager");
class Statusbar {
    constructor() {
        this.statusBar = vscode_1.window.createStatusBarItem(vscode_1.StatusBarAlignment.Right, 100);
        this.updateStatusBar(`z-reader`);
        this.statusBar.show();
        ReaderManager_1.readerManager.on('StatusbarUpdateStatusBar', (arg) => this.updateStatusBar(arg));
    }
    dispose() {
        this.statusBar.dispose();
    }
    updateStatusBar(text) {
        this.statusBar.text = `📘 ` + text;
    }
}
exports.statusbar = new Statusbar();
//# sourceMappingURL=Statusbar.js.map