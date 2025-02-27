'use strict';
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
exports.deactivate = exports.activate = void 0;
const vscode = require("vscode");
const https = require("https");
const languages = require("./languages.json");
const url_1 = require("url");
const Frame_1 = require("./model/Frame");
const TimeLine_1 = require("./model/TimeLine");
const Time_1 = require("./model/Time");
const sequenceRegex = /^([+\-]?)(\d+)(?=\s|$)/;
const timeMappingRegex = /^\d{2}:\d{2}:\d{2}[,.]\d{3} -> \d{2}:\d{2}:\d{2}[,.]\d{3}$/;
function shift() {
    return __awaiter(this, void 0, void 0, function* () {
        const textEditor = vscode.window.activeTextEditor;
        if (typeof textEditor === 'undefined') {
            return false;
        }
        const inputBox = {
            placeHolder: 'Time shift',
            prompt: 'Enter the desired time shift. Use negative value if subtitles are late.',
            value: '00:00:00,000',
            valueSelection: [6, 8],
            validateInput: (value) => __awaiter(this, void 0, void 0, function* () { return Time_1.TIME_REGEX.test(value) ? null : 'Time has to be in format ±00:00:00,000.'; })
        };
        const value = yield vscode.window.showInputBox(inputBox);
        if (typeof value === 'undefined') {
            return false;
        }
        const offset = Time_1.Time.parse(value).value;
        const workspaceEdit = new vscode.WorkspaceEdit();
        const documentUri = textEditor.document.uri;
        const selections = !textEditor.selection.isEmpty
            ? textEditor.selections
            : [new vscode.Selection(textEditor.document.positionAt(0), textEditor.document.lineAt(textEditor.document.lineCount - 1).range.end)];
        for (const selection of selections) {
            for (let lineIndex = selection.start.line; lineIndex <= selection.end.line; ++lineIndex) {
                const line = textEditor.document.lineAt(lineIndex);
                if (!line.isEmptyOrWhitespace) {
                    const timeLine = TimeLine_1.TimeLine.parse(line.text);
                    if (timeLine) {
                        timeLine.shift(offset);
                        workspaceEdit.replace(documentUri, line.range, timeLine.format());
                    }
                    else if (Time_1.TIME_TAG_REGEX.test(line.text)) {
                        workspaceEdit.replace(documentUri, line.range, line.text.replace(Time_1.TIME_TAG_REGEX, (_match, text) => {
                            const time = Time_1.Time.parse(text);
                            time.shift(offset);
                            return `<${time.format()}>`;
                        }));
                    }
                }
            }
        }
        yield vscode.workspace.applyEdit(workspaceEdit);
        return true;
    });
}
function renumber() {
    return __awaiter(this, void 0, void 0, function* () {
        const textEditor = vscode.window.activeTextEditor;
        if (typeof textEditor === 'undefined') {
            return false;
        }
        const inputBox = {
            placeHolder: 'Sequence start index',
            prompt: 'Enter the start index to renumber the sequence.',
            value: '1',
            valueSelection: [0, 1],
            validateInput: (value) => __awaiter(this, void 0, void 0, function* () { return sequenceRegex.test(value) ? null : 'Offset has to be a number.'; })
        };
        const value = yield vscode.window.showInputBox(inputBox);
        if (typeof value === 'undefined') {
            return false;
        }
        let offset = Number(value);
        const workspaceEdit = new vscode.WorkspaceEdit();
        const documentUri = textEditor.document.uri;
        const selections = !textEditor.selection.isEmpty
            ? textEditor.selections
            : [new vscode.Selection(textEditor.document.positionAt(0), textEditor.document.lineAt(textEditor.document.lineCount - 1).range.end)];
        for (const selection of selections) {
            for (let lineIndex = selection.start.line; lineIndex <= selection.end.line; ++lineIndex) {
                if (isEmptyLine(textEditor.document, lineIndex - 1) && isSequenceLine(textEditor.document, lineIndex)) {
                    const line = textEditor.document.lineAt(lineIndex);
                    workspaceEdit.replace(documentUri, line.range, String(offset) + line.text.replace(sequenceRegex, ''));
                    ++offset;
                }
            }
        }
        yield vscode.workspace.applyEdit(workspaceEdit);
        return true;
    });
}
function reorderBySequence() {
    return __awaiter(this, void 0, void 0, function* () {
        return yield reorder(Frame_1.Frame.compareSequence);
    });
}
function reorderByTimestamp() {
    return __awaiter(this, void 0, void 0, function* () {
        return yield reorder(Frame_1.Frame.compareTimestamp);
    });
}
function reorder(comparer) {
    return __awaiter(this, void 0, void 0, function* () {
        const textEditor = vscode.window.activeTextEditor;
        if (typeof textEditor === 'undefined') {
            return false;
        }
        const workspaceEdit = new vscode.WorkspaceEdit();
        const textDocument = textEditor.document;
        const documentUri = textDocument.uri;
        const selections = !textEditor.selection.isEmpty
            ? textEditor.selections
            : [new vscode.Selection(textDocument.positionAt(0), textDocument.lineAt(textDocument.lineCount - 1).range.end)];
        for (const selection of selections) {
            const frames = [];
            let frame = null;
            for (let lineIndex = selection.start.line; lineIndex <= selection.end.line; ++lineIndex) {
                const line = textDocument.lineAt(lineIndex);
                const previousLineIsEmpty = isEmptyLine(textDocument, lineIndex - 1);
                let timeLine = null;
                if (previousLineIsEmpty && isSequenceLine(textDocument, lineIndex)) {
                    frame = {
                        lineIndex,
                        sequence: Number.parseInt(line.text, 10),
                        timeLine,
                        lines: [line]
                    };
                    frames.push(frame);
                }
                else if (previousLineIsEmpty && (timeLine = TimeLine_1.TimeLine.parse(line.text))) {
                    frame = {
                        lineIndex,
                        sequence: Number.NEGATIVE_INFINITY,
                        timeLine,
                        lines: [line]
                    };
                    frames.push(frame);
                }
                else {
                    if (!frame) {
                        frame = {
                            lineIndex,
                            sequence: Number.NEGATIVE_INFINITY,
                            timeLine,
                            lines: []
                        };
                        frames.push(frame);
                    }
                    if (!frame.timeLine) {
                        frame.timeLine = TimeLine_1.TimeLine.parse(line.text);
                    }
                    frame.lines.push(line);
                }
            }
            frames.sort(comparer);
            const lines = frames.reduce((acc, frame) => { acc.push(...frame.lines.map(line => line.text + '\n')); return acc; }, []);
            workspaceEdit.replace(documentUri, selection, lines.join('').replace(/\n$/, ''));
        }
        yield vscode.workspace.applyEdit(workspaceEdit);
        return true;
    });
}
function isEmptyLine(textDocument, lineIndex) {
    return lineIndex < 0 || textDocument.lineAt(lineIndex).isEmptyOrWhitespace;
}
function isSequenceLine(textDocument, lineIndex) {
    return sequenceRegex.test(textDocument.lineAt(lineIndex).text);
}
function findFirstTime(textDocument, lineNumbers) {
    for (const lineNumber of lineNumbers) {
        const line = textDocument.lineAt(lineNumber);
        const timeLine = TimeLine_1.TimeLine.parse(line.text);
        if (timeLine) {
            timeLine.startTime.normalize();
            return timeLine.startTime;
        }
    }
    return Time_1.Time.parse('');
}
function linearCorrection() {
    return __awaiter(this, void 0, void 0, function* () {
        const textEditor = vscode.window.activeTextEditor;
        if (typeof textEditor === 'undefined') {
            return false;
        }
        const keys = Array.from(Array(textEditor.document.lineCount).keys());
        const firstTime = findFirstTime(textEditor.document, keys).format();
        const secondTime = findFirstTime(textEditor.document, keys.reverse()).format();
        const firstInputBox = {
            placeHolder: 'Time #1',
            prompt: 'Enter first time for subtitle that appears early in the video in format old time -> correct time.',
            value: `${firstTime} -> ${firstTime}`,
            valueSelection: [16, 28],
            validateInput: (value) => __awaiter(this, void 0, void 0, function* () { return timeMappingRegex.test(value) ? null : 'Time has to be in format 00:00:00,000 -> 00:00:00,000.'; })
        };
        const secondInputBox = Object.assign(Object.assign({}, firstInputBox), { placeHolder: 'Time #2', prompt: 'Enter second time for subtitle that appears late in the video in format old time -> correct time.', value: `${secondTime} -> ${secondTime}` });
        const firstValue = yield vscode.window.showInputBox(firstInputBox);
        if (typeof firstValue === 'undefined') {
            return false;
        }
        const secondValue = yield vscode.window.showInputBox(secondInputBox);
        if (typeof secondValue === 'undefined') {
            return false;
        }
        const firstMapping = firstValue.split(' -> ').map(Time_1.Time.parse);
        const secondMapping = secondValue.split(' -> ').map(Time_1.Time.parse);
        const originalTimeLine = new TimeLine_1.TimeLine(firstMapping[0], secondMapping[0]);
        const updatedTimeLine = new TimeLine_1.TimeLine(firstMapping[1], secondMapping[1]);
        const workspaceEdit = new vscode.WorkspaceEdit();
        const documentUri = textEditor.document.uri;
        const selections = !textEditor.selection.isEmpty
            ? textEditor.selections
            : [new vscode.Selection(textEditor.document.positionAt(0), textEditor.document.lineAt(textEditor.document.lineCount - 1).range.end)];
        for (const selection of selections) {
            for (let lineIndex = selection.start.line; lineIndex <= selection.end.line; ++lineIndex) {
                const line = textEditor.document.lineAt(lineIndex);
                const timeLine = TimeLine_1.TimeLine.parse(line.text);
                if (timeLine) {
                    timeLine.applyLinearCorrection(originalTimeLine, updatedTimeLine);
                    workspaceEdit.replace(documentUri, line.range, timeLine.format());
                }
                else if (Time_1.TIME_TAG_REGEX.test(line.text)) {
                    workspaceEdit.replace(documentUri, line.range, line.text.replace(Time_1.TIME_TAG_REGEX, (_match, text) => {
                        const time = Time_1.Time.parse(text);
                        time.applyLinearCorrection(originalTimeLine, updatedTimeLine);
                        return `<${time.format()}>`;
                    }));
                }
            }
        }
        yield vscode.workspace.applyEdit(workspaceEdit);
        return true;
    });
}
function convertTimeFormat() {
    return __awaiter(this, void 0, void 0, function* () {
        const textEditor = vscode.window.activeTextEditor;
        if (typeof textEditor === 'undefined') {
            return false;
        }
        const subtitleTypes = {
            ['SubRip Text']: {
                name: 'SubRip Text',
                extensions: ['srt'],
                timeSeparator: ' --> ',
                millisSeparator: ',',
                shortMillis: false,
            },
            ['Web Video Text Tracks']: {
                name: 'Web Video Text Tracks',
                extensions: ['vtt'],
                timeSeparator: ' --> ',
                millisSeparator: '.',
                shortMillis: false,
            },
            ['SubViewer']: {
                name: 'SubViewer',
                extensions: ['sbv', 'sub'],
                timeSeparator: ',',
                millisSeparator: '.',
                shortMillis: true,
            },
        };
        const items = Object.values(subtitleTypes)
            .map(({ name, extensions }) => ({ label: name, detail: extensions.join(', ') }));
        const quickPickOpts = {
            placeHolder: 'Type',
            matchOnDetail: true
        };
        const value = yield vscode.window.showQuickPick(items, quickPickOpts);
        if (typeof value === 'undefined') {
            return false;
        }
        const subtitleType = subtitleTypes[value.label];
        const workspaceEdit = new vscode.WorkspaceEdit();
        const documentUri = textEditor.document.uri;
        const selections = !textEditor.selection.isEmpty
            ? textEditor.selections
            : [new vscode.Selection(textEditor.document.positionAt(0), textEditor.document.lineAt(textEditor.document.lineCount - 1).range.end)];
        for (const selection of selections) {
            for (let lineIndex = selection.start.line; lineIndex <= selection.end.line; ++lineIndex) {
                const line = textEditor.document.lineAt(lineIndex);
                if (!line.isEmptyOrWhitespace) {
                    const timeLine = TimeLine_1.TimeLine.parse(line.text);
                    if (timeLine) {
                        timeLine.convert(subtitleType.timeSeparator, subtitleType.millisSeparator, subtitleType.shortMillis);
                        workspaceEdit.replace(documentUri, line.range, timeLine.format());
                    }
                }
            }
        }
        yield vscode.workspace.applyEdit(workspaceEdit);
        return true;
    });
}
function translate() {
    return __awaiter(this, void 0, void 0, function* () {
        const textEditor = vscode.window.activeTextEditor;
        if (typeof textEditor === 'undefined') {
            return false;
        }
        const languagesByCode = languages;
        const items = Object.keys(languagesByCode)
            .map(code => ({
            label: `${languagesByCode[code]}`,
            detail: code
        }));
        const quickPickOpts = {
            placeHolder: 'Language',
            matchOnDetail: true
        };
        const value = yield vscode.window.showQuickPick(items, quickPickOpts);
        if (typeof value === 'undefined') {
            return false;
        }
        const language = value.detail;
        const workspaceEdit = new vscode.WorkspaceEdit();
        const documentUri = textEditor.document.uri;
        const selections = !textEditor.selection.isEmpty
            ? textEditor.selections
            : [new vscode.Selection(textEditor.document.positionAt(0), textEditor.document.lineAt(textEditor.document.lineCount - 1).range.end)];
        const originalLines = [];
        const lineIndexes = [];
        for (const selection of selections) {
            for (let lineIndex = selection.start.line; lineIndex <= selection.end.line; ++lineIndex) {
                const line = textEditor.document.lineAt(lineIndex);
                if (!line.isEmptyOrWhitespace && !TimeLine_1.TimeLine.parse(line.text) && !isSequenceLine(textEditor.document, lineIndex)) {
                    originalLines.push(line.text);
                    lineIndexes.push(lineIndex);
                }
            }
        }
        const translatedLines = yield translateLines(language, originalLines);
        while (true) {
            const lineIndex = lineIndexes.shift();
            const translatedLine = translatedLines.shift();
            if (lineIndex === undefined || translatedLine === undefined) {
                break;
            }
            const line = textEditor.document.lineAt(lineIndex);
            workspaceEdit.replace(documentUri, line.range, translatedLine);
        }
        yield vscode.workspace.applyEdit(workspaceEdit);
        return true;
    });
}
function translateText(language, text) {
    return __awaiter(this, void 0, void 0, function* () {
        const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${encodeURIComponent(language)}&dt=t&q=${encodeURIComponent(text)}`;
        const json = JSON.parse(yield httpGet(url));
        return json[0].map((x) => x[0]).join('');
    });
}
function translateLines(language, originalLines) {
    return __awaiter(this, void 0, void 0, function* () {
        const result = [];
        const lines = [];
        let length = 0;
        for (const originalLine of originalLines) {
            const originalLineLength = encodeURIComponent(originalLine).length;
            if (length + originalLineLength + 1 > 8000) {
                const translatedText = yield translateText(language, lines.join('\n'));
                Array.prototype.push.apply(result, translatedText.split('\n'));
                lines.length = 0;
                length = 0;
            }
            lines.push(originalLine);
            length += originalLineLength + 1;
        }
        const translatedText = yield translateText(language, lines.join('\n'));
        Array.prototype.push.apply(result, translatedText.split('\n'));
        return result.map(x => x.replace(/(<)(\/?)\s*([bi])\s*(>)/gi, '$1$2$3$4'));
    });
}
function httpGet(url) {
    return __awaiter(this, void 0, void 0, function* () {
        return new Promise((resolve, reject) => {
            const uri = new url_1.URL(url);
            const opts = {
                hostname: uri.hostname,
                port: uri.port || 443,
                path: uri.pathname + uri.search,
                headers: {
                    // eslint-disable-next-line @typescript-eslint/naming-convention
                    'User-Agent': 'Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/49.0.2623.110 Safari/537.36'
                }
            };
            https.get(opts, res => {
                if (res.statusCode !== 200) {
                    reject(new Error(``));
                }
                let body = '';
                res.setEncoding('utf8');
                res.on('data', d => body += d);
                res.on('end', () => resolve(body));
            });
        });
    });
}
function activate(context) {
    context.subscriptions.push(vscode.commands.registerCommand('subtitles.shift', shift));
    context.subscriptions.push(vscode.commands.registerCommand('subtitles.renumber', renumber));
    context.subscriptions.push(vscode.commands.registerCommand('subtitles.reorderBySequence', reorderBySequence));
    context.subscriptions.push(vscode.commands.registerCommand('subtitles.reorderByTimestamp', reorderByTimestamp));
    context.subscriptions.push(vscode.commands.registerCommand('subtitles.linearCorrection', linearCorrection));
    context.subscriptions.push(vscode.commands.registerCommand('subtitles.convertTimeFormat', convertTimeFormat));
    context.subscriptions.push(vscode.commands.registerCommand('subtitles.translate', translate));
}
exports.activate = activate;
function deactivate() {
}
exports.deactivate = deactivate;
//# sourceMappingURL=extension.js.map