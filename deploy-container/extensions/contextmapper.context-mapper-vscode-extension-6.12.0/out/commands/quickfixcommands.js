"use strict";
/**
 * CML quickfix commands
 */
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
exports.splitStoryByVerb = splitStoryByVerb;
exports.openFlowInSketchMiner = openFlowInSketchMiner;
exports.openCoordinationInSketchMiner = openCoordinationInSketchMiner;
const vscode = require("vscode");
const vscode_1 = require("vscode");
const editor = require("../editors/cml-editor");
const input = require("./userinput");
function splitStoryByVerb() {
    return (...args) => __awaiter(this, void 0, void 0, function* () {
        const storyName = args[1];
        const firstVerb = yield input.askForVerb("Please enter a verb for the splitted story (such as 'create', 'search', 'update', etc.).", "");
        if (firstVerb !== undefined) {
            var verbList = [firstVerb];
            var nextVerb = yield input.askForVerb("Please enter a verb for the splitted story (such as 'create', 'search', 'update', etc.).", "");
            while (nextVerb !== undefined) {
                verbList.push(nextVerb);
                nextVerb = yield input.askForVerb("Please enter a verb for the splitted story (such as 'create', 'search', 'update', etc.).", "");
            }
            console.log("call with: " + verbList);
            const transformFunction = transform('cml.quickfix.command.splitStoryByVerb', storyName, verbList);
            transformFunction();
        }
    });
}
function openFlowInSketchMiner() {
    return (...args) => __awaiter(this, void 0, void 0, function* () {
        vscode.env.openExternal(vscode.Uri.parse(args[0]));
    });
}
function openCoordinationInSketchMiner() {
    return (...args) => __awaiter(this, void 0, void 0, function* () {
        vscode.env.openExternal(vscode.Uri.parse(args[0]));
    });
}
function transform(command, ...additionalParameters) {
    return () => __awaiter(this, void 0, void 0, function* () {
        if (editor.isNotCMLEditor())
            return;
        if (editor.documentHasURI()) {
            console.log(`Send command ${command} to CML language server.`);
            const returnVal = yield vscode_1.commands.executeCommand(command, vscode_1.window.activeTextEditor.document.uri.toString(), additionalParameters);
            if (returnVal.startsWith('Error occurred:')) {
                vscode_1.window.showErrorMessage(returnVal);
            }
        }
    });
}
