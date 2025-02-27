"use strict";
/**
 * CML generator commands
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
exports.generatePlantUML = generatePlantUML;
exports.generateSketchMinerDiagrams = generateSketchMinerDiagrams;
exports.generateMDSL = generateMDSL;
exports.generateGenericTextFile = generateGenericTextFile;
exports.generateContextMap = generateContextMap;
const vscode_1 = require("vscode");
const editor = require("../editors/cml-editor");
const fs = require("fs");
function generatePlantUML() {
    return generate('cml.generate.puml', 'The PlantUML diagrams have been generated into the src-gen folder.');
}
function generateSketchMinerDiagrams() {
    return generate('cml.generate.sketchminer', 'The Sketch Miner diagrams have been generated into the src-gen folder.');
}
function generateMDSL() {
    return generate('cml.generate.mdsl', 'The MDSL contracts have been generated into the src-gen folder.');
}
function generateGenericTextFile() {
    return () => __awaiter(this, void 0, void 0, function* () {
        const fileOptions = {
            canSelectMany: false,
            openLabel: 'Choose Freemarker template',
            filters: {
                'Freemarker templates': ['ftl']
            }
        };
        const inputBoxOptions = {
            value: 'output.txt',
            prompt: 'Please enter a name for the file that shall be generated.',
            validateInput: (value) => {
                if (!value || 0 === value.length)
                    return 'Please enter a non-empty string as filename.';
                return '';
            }
        };
        const uriSelection = yield vscode_1.window.showOpenDialog(fileOptions);
        const outputFileName = yield vscode_1.window.showInputBox(inputBoxOptions);
        if (uriSelection && uriSelection[0]) {
            const templateUri = uriSelection[0].toString();
            const generateFunction = generate('cml.generate.generic.text.file', 'The file has been generated into the src-gen folder.', { templateUri, outputFileName });
            generateFunction();
        }
    });
}
function generateContextMap() {
    return () => __awaiter(this, void 0, void 0, function* () {
        const currentDocument = vscode_1.window.activeTextEditor.document;
        const configuration = vscode_1.workspace.getConfiguration('', currentDocument.uri);
        var selection = [{ label: "png", picked: true }, { label: "svg", picked: true }, { label: "dot", picked: true }];
        const selectedFormats = (yield vscode_1.window.showQuickPick(selection, { canPickMany: true })).map(item => item.label);
        const params = {
            formats: selectedFormats,
            fixWidth: configuration.get('generation.contextMapGenerator.fixImageWidth'),
            fixHeight: configuration.get('generation.contextMapGenerator.fixImageHeight'),
            width: configuration.get('generation.contextMapGenerator.imageWidth'),
            height: configuration.get('generation.contextMapGenerator.imageHeight'),
            generateLabels: configuration.get('generation.contextMapGenerator.generateLabels'),
            labelSpacingFactor: configuration.get('generation.contextMapGenerator.labelSpacingFactor'),
            clusterTeams: configuration.get('generation.contextMapGenerator.clusterTeams')
        };
        if (selectedFormats && params) {
            const generateFunction = generate('cml.generate.contextmap', 'The files have been generated into the src-gen folder.', params);
            yield generateFunction();
            // preview png if it was generated
            var inputFileName = currentDocument.uri.toString().substring(currentDocument.uri.toString().lastIndexOf("/") + 1, currentDocument.uri.toString().length - 4);
            var pngUri = vscode_1.Uri.file(vscode_1.workspace.rootPath + "/src-gen/" + inputFileName + "_ContextMap.png");
            if (fs.existsSync(pngUri.fsPath))
                yield vscode_1.commands.executeCommand('vscode.open', pngUri, { viewColumn: vscode_1.ViewColumn.Two });
        }
    });
}
function generate(command, successMessage, ...additionalParameters) {
    return () => __awaiter(this, void 0, void 0, function* () {
        if (editor.isNotCMLEditor())
            return;
        if (editor.documentHasURI()) {
            console.log(`Send command ${command} to CML language server.`);
            const returnVal = yield vscode_1.commands.executeCommand(command, vscode_1.window.activeTextEditor.document.uri.toString(), additionalParameters);
            if (returnVal.startsWith('Error occurred:')) {
                vscode_1.window.showErrorMessage(returnVal);
            }
            else {
                vscode_1.window.showInformationMessage(successMessage);
            }
        }
    });
}
