"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.store = void 0;
const vscode_1 = require("vscode");
class Store {
    constructor() {
        this.booksPath = '';
        this.extensionPath = '';
        this.globalStorageUri = vscode_1.Uri.file('');
    }
}
const store = new Store();
exports.store = store;
//# sourceMappingURL=store.js.map