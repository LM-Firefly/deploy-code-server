'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
exports.activate = activate;
exports.deactivate = deactivate;
const path = require("path");
const os = require("os");
const vscode_jsonrpc_1 = require("vscode-jsonrpc");
const vscode_1 = require("vscode");
const node_1 = require("vscode-languageclient/node");
const generators = require("./commands/generators");
const transformations = require("./commands/transformations");
const quickfixCommands = require("./commands/quickfixcommands");
let lc;
function activate(context) {
    let launcher = os.platform() === 'win32' ? 'context-mapper-lsp.bat' : 'context-mapper-lsp';
    let script = context.asAbsolutePath(path.join('lsp', 'bin', launcher));
    let serverOptions = {
        run: { command: script, options: { shell: true } },
        debug: { command: script, args: ['-log'], options: { env: createDebugEnv(), shell: true } }
    };
    let clientOptions = {
        documentSelector: ['cml', 'scl'],
        synchronize: {
            fileEvents: vscode_1.workspace.createFileSystemWatcher('**/*.*')
        }
    };
    // Create the language client and start the client.
    let lc = new node_1.LanguageClient('CML Language Server', serverOptions, clientOptions);
    // Register generator commands
    context.subscriptions.push(
    // CML
    vscode_1.commands.registerCommand("cml.generate.puml.proxy", generators.generatePlantUML()), vscode_1.commands.registerCommand("cml.generate.sketchminer.proxy", generators.generateSketchMinerDiagrams()), vscode_1.commands.registerCommand("cml.generate.mdsl.proxy", generators.generateMDSL()), vscode_1.commands.registerCommand("cml.generate.generic.text.file.proxy", generators.generateGenericTextFile()), vscode_1.commands.registerCommand("cml.generate.contextmap.proxy", generators.generateContextMap()));
    // Register transformation commands
    context.subscriptions.push(vscode_1.commands.registerCommand("cml.ar.deriveSubdomainFromURs.proxy", transformations.deriveSubdomainFromUserRequirements()), vscode_1.commands.registerCommand("cml.ar.deriveBoundedContextFromSDs.proxy", transformations.deriveBoundedContextFromSubdomains()), vscode_1.commands.registerCommand("cml.ar.deriveFrontendBackendSystemsFromFeatureBC.proxy", transformations.deriveFrontendAndBackendSystemFromFeatureBC()), vscode_1.commands.registerCommand("cml.ar.splitSystemContextIntoSubsystems.proxy", transformations.splitSystemContextIntoSubsystems()), vscode_1.commands.registerCommand("cml.ar.extractAggregatesByVolatility.proxy", transformations.extractAggregatesByVolatility()), vscode_1.commands.registerCommand("cml.ar.extractAggregatesByCohesion.proxy", transformations.extractAggregatesByCohesion()), vscode_1.commands.registerCommand("cml.ar.mergeAggregates.proxy", transformations.mergeAggregates()), vscode_1.commands.registerCommand("cml.ar.mergeBoundedContexts.proxy", transformations.mergeBoundedContexts()), vscode_1.commands.registerCommand("cml.ar.suspendPartnership.proxy", transformations.suspendPartnership()), vscode_1.commands.registerCommand("cml.ar.createValueForStakeholder.proxy", transformations.executeGenericCommandWithSingleStringArg("cml.ar.createValueForStakeholder")), vscode_1.commands.registerCommand("cml.ar.addEthicalValueAssessment.proxy", transformations.executeGenericCommandWithSingleStringArg("cml.ar.addEthicalValueAssessment")), vscode_1.commands.registerCommand("cml.ar.wrapValueInCluster.proxy", transformations.executeGenericCommandWithSingleStringArg("cml.ar.wrapValueInCluster")), vscode_1.commands.registerCommand("cml.ar.createStakeholderForUserStoryRole.proxy", transformations.executeGenericCommandWithSingleStringArg("cml.ar.createStakeholderForUserStoryRole")), vscode_1.commands.registerCommand("cml.ar.createValueRegisterForBoundedContext.proxy", transformations.executeGenericCommandWithSingleStringArg("cml.ar.createValueRegisterForBoundedContext")));
    // Register quickfix commands
    context.subscriptions.push(vscode_1.commands.registerCommand("cml.quickfix.command.splitStoryByVerb.proxy", quickfixCommands.splitStoryByVerb()), vscode_1.commands.registerCommand("cml.flow.open.sketch.miner", quickfixCommands.openFlowInSketchMiner()), vscode_1.commands.registerCommand("cml.coordination.open.sketch.miner", quickfixCommands.openCoordinationInSketchMiner()));
    lc.setTrace(vscode_jsonrpc_1.Trace.Verbose);
    lc.start();
}
function deactivate() {
    return lc.stop();
}
function createDebugEnv() {
    return Object.assign({
        JAVA_OPTS: "-Xdebug -Xrunjdwp:server=y,transport=dt_socket,address=8000,suspend=n,quiet=y"
    }, process.env);
}
