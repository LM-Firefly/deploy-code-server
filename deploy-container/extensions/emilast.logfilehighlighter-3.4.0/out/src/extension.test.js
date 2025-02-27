"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = require("vscode");
const extension_1 = require("./extension");
describe('tailLogFile', () => {
    let document;
    let activeTextEditor;
    beforeEach(() => {
        document = {
            languageId: 'log',
            lineCount: 10
        };
        activeTextEditor = {
            document: document,
            revealRange: jest.fn()
        };
        vscode.window.activeTextEditor = activeTextEditor;
    });
    afterEach(() => {
        jest.clearAllMocks();
    });
    it('should scroll to the last line of the log file if the document is a log file', () => {
        // Act
        (0, extension_1.tailLogFile)(document);
        // Assert
        expect(activeTextEditor.revealRange).toHaveBeenCalledTimes(1);
        expect(activeTextEditor.revealRange).toHaveBeenCalledWith(new vscode.Range(9, 0, 9, 0), vscode.TextEditorRevealType.InCenter);
    });
    it('should not scroll to the last line of the log file if the document is not a log file', () => {
        // Arrange
        document.languageId = 'plaintext';
        // Act
        (0, extension_1.tailLogFile)(document);
        // Assert
        expect(activeTextEditor.revealRange).not.toHaveBeenCalled();
    });
    it('should not scroll to the last line of the log file if there is no active text editor', () => {
        // Arrange
        vscode.window.activeTextEditor = undefined;
        // Act
        (0, extension_1.tailLogFile)(document);
        // Assert
        expect(activeTextEditor.revealRange).not.toHaveBeenCalled();
    });
});
//# sourceMappingURL=extension.test.js.map