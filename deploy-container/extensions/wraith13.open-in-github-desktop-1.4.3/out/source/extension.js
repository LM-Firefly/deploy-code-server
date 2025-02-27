"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deactivate = exports.activate = exports.openInGithubDesktop = exports.isDocumentOnFileSystem = exports.openExternal = void 0;
const vscode = __importStar(require("vscode"));
const fs = __importStar(require("fs"));
const process = __importStar(require("process"));
const vscel = __importStar(require("@wraith13/vscel"));
const package_json_1 = __importDefault(require("../package.json"));
const package_nls_json_1 = __importDefault(require("../package.nls.json"));
const package_nls_ja_json_1 = __importDefault(require("../package.nls.ja.json"));
const locale = vscel.locale.make(package_nls_json_1.default, { "ja": package_nls_ja_json_1.default });
const isWindows = "win32" === process.platform;
const alignmentObject = Object.freeze({
    "none": undefined,
    "left": vscode.StatusBarAlignment.Left,
    "right": vscode.StatusBarAlignment.Right,
});
const hasError = () => vscode.languages.getDiagnostics().some(f => f[1].some(d => vscode.DiagnosticSeverity.Error === d.severity));
const hasErrorOrWarning = () => vscode.languages.getDiagnostics().some(f => f[1].some(d => vscode.DiagnosticSeverity.Error === d.severity ||
    vscode.DiagnosticSeverity.Warning === d.severity));
const hasUnsavedExistingFiles = () => 0 < vscode.workspace.textDocuments
    .filter(i => i.isDirty && !i.isUntitled).length;
const hasUnsavedFiles = () => 0 < vscode.workspace.textDocuments
    .filter(i => i.isDirty || i.isUntitled).length;
const diagnosticWarningObject = Object.freeze({
    "none": () => __awaiter(void 0, void 0, void 0, function* () { return true; }),
    "error": () => __awaiter(void 0, void 0, void 0, function* () {
        return !hasError() ||
            "Continue" === (yield locale.showWarningMessage({ map: "You have error.", }, "Continue", "Cancel"));
    }),
    "error or warning": () => __awaiter(void 0, void 0, void 0, function* () {
        return !hasErrorOrWarning() ||
            "Continue" === (yield locale.showWarningMessage({ map: "You have error or warning.", }, "Continue", "Cancel"));
    }),
});
const unsavedWarningObject = Object.freeze({
    "none": () => __awaiter(void 0, void 0, void 0, function* () { return true; }),
    "unsaved existing files": () => __awaiter(void 0, void 0, void 0, function* () {
        return !hasUnsavedExistingFiles() ||
            "Continue" === (yield locale.showWarningMessage({ map: "You have unsaved existing files.", }, "Continue", "Cancel"));
    }),
    "unsaved files": () => __awaiter(void 0, void 0, void 0, function* () {
        return !hasUnsavedFiles() ||
            "Continue" === (yield locale.showWarningMessage({ map: "You have unsaved files.", }, "Continue", "Cancel"));
    }),
});
var Config;
(function (Config) {
    Config.root = vscel.config.makeRoot(package_json_1.default);
    Config.traversalSearchGitConfig = Config.root.makeEntry("openInGithubDesktop.traversalSearchGitConfig", "active-workspace");
    Config.traversalSearchGitConfigForCurrentDocument = Config.root.makeEntry("openInGithubDesktop.traversalSearchGitConfigForCurrentDocument", "active-workspace");
    let statusBar;
    (function (statusBar) {
        statusBar.label = Config.root.makeEntry("openInGithubDesktop.statusBar.Label", "root-workspace");
        statusBar.alignment = Config.root.makeMapEntry("openInGithubDesktop.statusBar.Alignment", "root-workspace", alignmentObject);
    })(statusBar = Config.statusBar || (Config.statusBar = {}));
    Config.diagnosticWarning = Config.root.makeMapEntry("openInGithubDesktop.diagnosticWarning", "active-workspace", diagnosticWarningObject);
    Config.unsavedWarning = Config.root.makeMapEntry("openInGithubDesktop.unsavedWarning", "active-workspace", unsavedWarningObject);
})(Config || (Config = {}));
var fx;
(function (fx) {
    fx.exists = (path) => new Promise(resolve => fs.exists(path, exists => resolve(exists)));
    fx.readFile = (path) => new Promise(resolve => fs.readFile(path, (err, data) => resolve({ err, data })));
})(fx || (fx = {}));
const parseGitConifg = (gitConfigSource) => {
    const result = {};
    const sectionRegExp = /^\[(.*)\]\s*$/;
    const keyValueRegExp = /^\s*([^=\s]*)\s*=\s*(.*)\s*$/;
    let section = "";
    gitConfigSource
        .replace(/\r\n/, "\n")
        .replace(/\r/, "\n")
        .split("\n")
        .filter(i => 0 < i.trim().length)
        .forEach(line => {
        if (sectionRegExp.test(line)) {
            section = line.replace(sectionRegExp, "$1");
            result[section] = result[section] || {};
        }
        else if (keyValueRegExp.test(line)) {
            const key = line.replace(keyValueRegExp, "$1");
            const value = line.replace(keyValueRegExp, "$2");
            if (undefined === result[section][key]) // なんらかのパーズエラーにより、本来別の section となるべき後方に出現する値で上書きしてしまわないようにする為のチェック
             {
                result[section][key] = value;
            }
        }
        else {
            console.error(`open-in-github-desktop:parseGitConifg: unknown line format in .git/config: ${line}`);
        }
    });
    return result;
};
const regulateDirPath = (folder) => folder.replace(isWindows ? /\\$/ : /\/$/, "");
const isRootDir = (folder) => isWindows ?
    (/^\w+\:$/.test(regulateDirPath(folder)) ||
        /^\\\\[^\\]+\\[^\\]+$/.test(regulateDirPath(folder))) :
    "" === regulateDirPath(folder);
const getParentDir = (folder) => regulateDirPath(folder).replace(isWindows ? /\\[^\\]*$/ : /\/[^\/]*$/, "");
const searchGitConfig = (folder, traversalSearch) => __awaiter(void 0, void 0, void 0, function* () {
    const gitConfigPath = `${folder}/.git/config`;
    if (yield fx.exists(gitConfigPath)) {
        return gitConfigPath;
    }
    if (!isRootDir(folder) && traversalSearch) {
        return yield searchGitConfig(getParentDir(folder), traversalSearch);
    }
    return null;
});
exports.openExternal = (uri) => vscode.env.openExternal(vscode.Uri.parse(uri));
exports.isDocumentOnFileSystem = (document) => "file" === document.uri.scheme;
exports.openInGithubDesktop = () => __awaiter(void 0, void 0, void 0, function* () {
    const activeTextEditor = vscode.window.activeTextEditor;
    const searchForDocument = activeTextEditor && exports.isDocumentOnFileSystem(activeTextEditor.document) && Config.traversalSearchGitConfigForCurrentDocument.get("default-scope");
    const gitConfigPath = ((activeTextEditor && searchForDocument) ? yield searchGitConfig(getParentDir(activeTextEditor.document.fileName), true) : null) ||
        (vscode.workspace.rootPath ? yield searchGitConfig(vscode.workspace.rootPath, Config.traversalSearchGitConfig.get("default-scope")) : null);
    if (null === gitConfigPath) {
        if (searchForDocument || vscode.workspace.rootPath) {
            yield locale.showErrorMessage({ map: "openInGithubDesktop.notFoundGitConfig", });
        }
        else {
            yield locale.showErrorMessage({ map: "openInGithubDesktop.notOpenFolderInThisWindow", });
        }
    }
    else {
        const { err, data } = yield fx.readFile(gitConfigPath);
        if (err || !data) {
            yield locale.showErrorMessage({ map: "openInGithubDesktop.canNotReadGitConfig", });
        }
        else {
            const gitConfigSource = data.toString();
            const gitConfig = parseGitConifg(gitConfigSource);
            const repositoryUrl = (gitConfig["remote \"origin\""] || {})["url"];
            if (!repositoryUrl) {
                yield locale.showErrorMessage({ map: "openInGithubDesktop.notFoundRemoteOriginUrlInGitConfig", });
            }
            else if ((yield Config.diagnosticWarning.get("default-scope")()) &&
                (yield Config.unsavedWarning.get("default-scope")())) {
                yield exports.openExternal(`x-github-client://openRepo/${repositoryUrl}`);
            }
        }
    }
});
exports.activate = (context) => {
    context.subscriptions.push(vscode.commands.registerCommand('openInGithubDesktop', exports.openInGithubDesktop));
    const alignment = Config.statusBar.alignment.get("default-scope");
    if (alignment) {
        context.subscriptions.push(vscel.statusbar.createItem({
            alignment,
            text: Config.statusBar.label.get("default-scope"),
            command: `openInGithubDesktop`,
            tooltip: locale.map("openInGithubDesktop.title"),
            withShow: true,
        }));
    }
    // context.subscriptions.push
    // (
    //     vscode.workspace.onDidChangeConfiguration
    //     (
    //         async (event) =>
    //         {
    //             if
    //             (
    //                 event.affectsConfiguration("openInGithubDesktop")
    //             )
    //             {
    //                 Config.root.entries.forEach(i => i.clear());
    //             }
    //         }
    //     )
    // );
};
exports.deactivate = () => { };
//# sourceMappingURL=extension.js.map