"use strict";
/* user input helpers */
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
exports.askForName = askForName;
exports.askForVerb = askForVerb;
exports.askForStringSelection = askForStringSelection;
exports.askForMultipleStringSelection = askForMultipleStringSelection;
const vscode_1 = require("vscode");
function askForName(prompt, initialValue) {
    return __awaiter(this, void 0, void 0, function* () {
        const inputBoxOptions = {
            value: initialValue,
            prompt: prompt,
            validateInput: (value) => {
                var regex = new RegExp('^[a-zA-Z_][a-zA-Z0-9_]*$');
                if (!value || !regex.test(value))
                    return 'Please enter a valid name. Allowed characters are: a-z, A-Z, 0-9, _';
                return '';
            }
        };
        return yield vscode_1.window.showInputBox(inputBoxOptions);
    });
}
function askForVerb(prompt, initialValue) {
    return __awaiter(this, void 0, void 0, function* () {
        const inputBoxOptions = {
            value: initialValue,
            prompt: prompt,
            validateInput: (value) => {
                var regex = new RegExp('^[a-z][a-zA-Z]*$');
                if (!value || !regex.test(value))
                    return 'Please enter a valid verb. Allowed characters are: a-z, A-Z';
                return '';
            }
        };
        return yield vscode_1.window.showInputBox(inputBoxOptions);
    });
}
function askForStringSelection(prompt, values) {
    return __awaiter(this, void 0, void 0, function* () {
        return yield vscode_1.window.showQuickPick(values, { placeHolder: prompt });
    });
}
function askForMultipleStringSelection(prompt, values) {
    return __awaiter(this, void 0, void 0, function* () {
        return yield vscode_1.window.showQuickPick(values, { canPickMany: true, placeHolder: prompt });
    });
}
