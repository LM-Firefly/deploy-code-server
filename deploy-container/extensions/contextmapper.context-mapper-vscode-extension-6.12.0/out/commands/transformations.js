"use strict";
/**
 * CML OOAD transformation & refactoring commands
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
exports.deriveSubdomainFromUserRequirements = deriveSubdomainFromUserRequirements;
exports.deriveBoundedContextFromSubdomains = deriveBoundedContextFromSubdomains;
exports.deriveFrontendAndBackendSystemFromFeatureBC = deriveFrontendAndBackendSystemFromFeatureBC;
exports.splitSystemContextIntoSubsystems = splitSystemContextIntoSubsystems;
exports.extractAggregatesByVolatility = extractAggregatesByVolatility;
exports.extractAggregatesByCohesion = extractAggregatesByCohesion;
exports.mergeAggregates = mergeAggregates;
exports.mergeBoundedContexts = mergeBoundedContexts;
exports.suspendPartnership = suspendPartnership;
exports.executeGenericCommandWithSingleStringArg = executeGenericCommandWithSingleStringArg;
const vscode_1 = require("vscode");
const editor = require("../editors/cml-editor");
const input = require("./userinput");
function deriveSubdomainFromUserRequirements() {
    return (...args) => __awaiter(this, void 0, void 0, function* () {
        var i;
        var userRequirements = [];
        for (i = 1; i < args.length; i++) {
            userRequirements.push(args[i]);
        }
        const domainName = yield input.askForName("Please provide a name for the domain.", "NewDomain");
        if (!domainName)
            return;
        const subDomainName = yield input.askForName("Please provide a name for the Subdomain.", "NewSubDomain");
        if (!subDomainName)
            return;
        const transformFunction = transform('cml.ar.deriveSubdomainFromURs', domainName, subDomainName, userRequirements);
        transformFunction();
    });
}
function deriveBoundedContextFromSubdomains() {
    return (...args) => __awaiter(this, void 0, void 0, function* () {
        var i;
        var subdomains = [];
        for (i = 1; i < args.length; i++) {
            subdomains.push(args[i]);
        }
        const boundedContextName = yield input.askForName("Please provide a name for the new Bounded Context.", "NewBoundedContext");
        if (!boundedContextName)
            return;
        const transformFunction = transform('cml.ar.deriveBoundedContextFromSDs', boundedContextName, subdomains);
        transformFunction();
    });
}
function deriveFrontendAndBackendSystemFromFeatureBC() {
    return (...args) => __awaiter(this, void 0, void 0, function* () {
        const integrationType = yield input.askForStringSelection("Please choose how the new systems shall integrate.", ["CONFORMIST", "ACL"]);
        if (!integrationType)
            return;
        const featureBoundedContextName = args[1];
        const transformFunction = transform('cml.ar.deriveFrontendBackendSystemsFromFeatureBC', featureBoundedContextName, integrationType);
        transformFunction();
    });
}
function splitSystemContextIntoSubsystems() {
    return (...args) => __awaiter(this, void 0, void 0, function* () {
        const existingSystemName = args[1];
        const name4ExistingContext = yield input.askForName("Please provide a name for the existing system.", existingSystemName);
        if (!name4ExistingContext)
            return;
        const name4NewContext = yield input.askForName("Please provide a name for the new system that shall be extracted.", "NewSubSystem");
        if (!name4NewContext)
            return;
        const transformFunction = transform('cml.ar.splitSystemContextIntoSubsystems', existingSystemName, name4ExistingContext, name4NewContext);
        transformFunction();
    });
}
function extractAggregatesByVolatility() {
    return (...args) => __awaiter(this, void 0, void 0, function* () {
        const boundedContextName = args[1];
        const volatilityToExtract = yield input.askForStringSelection("Please choose with which volatility value the Aggregates shall be extracted.", ["NORMAL", "OFTEN", "RARELY"]);
        if (!volatilityToExtract)
            return;
        const transformFunction = transform('cml.ar.extractAggregatesByVolatility', boundedContextName, volatilityToExtract);
        transformFunction();
    });
}
function extractAggregatesByCohesion() {
    return (...args) => __awaiter(this, void 0, void 0, function* () {
        const boundedContextName = args[1];
        var i;
        var aggregates = [];
        for (i = 2; i < args.length; i++) {
            aggregates.push(args[i]);
        }
        const selectedAggregates = yield input.askForMultipleStringSelection("Please select the Aggregates that shall be extracted.", aggregates);
        if (!selectedAggregates || selectedAggregates.length == 0)
            return;
        const newBoundedContextName = yield input.askForName("Please define how the new Bounded Context shall be named.", "NewBoundedContext");
        if (!newBoundedContextName)
            return;
        const transformFunction = transform('cml.ar.extractAggregatesByCohesion', boundedContextName, newBoundedContextName, selectedAggregates);
        transformFunction();
    });
}
function mergeAggregates() {
    return (...args) => __awaiter(this, void 0, void 0, function* () {
        const firstAggregateName = args[1];
        var i;
        var aggregates2Select = [];
        for (i = 2; i < args.length; i++) {
            aggregates2Select.push(args[i]);
        }
        const selectedAggregate = yield input.askForStringSelection("Please select a second Aggregate with which you want to merge.", aggregates2Select);
        if (!selectedAggregate)
            return;
        const transformFunction = transform('cml.ar.mergeAggregates', firstAggregateName, selectedAggregate);
        transformFunction();
    });
}
function mergeBoundedContexts() {
    return (...args) => __awaiter(this, void 0, void 0, function* () {
        const firstBoundedContext = args[1];
        var i;
        var boundedContexts2Select = [];
        for (i = 2; i < args.length; i++) {
            boundedContexts2Select.push(args[i]);
        }
        const selectecBoundedContext = yield input.askForStringSelection("Please select a second Bounded Context with which you want to merge.", boundedContexts2Select);
        if (!selectecBoundedContext)
            return;
        const transformFunction = transform('cml.ar.mergeBoundedContexts', firstBoundedContext, selectecBoundedContext);
        transformFunction();
    });
}
function suspendPartnership() {
    return (...args) => __awaiter(this, void 0, void 0, function* () {
        const boundedContext1 = args[1];
        const boundedContext2 = args[2];
        // unfortunately mode A (MERGE) does currently not work because of the following Xtext bug: https://github.com/eclipse/xtext-core/issues/1494
        const modeB = "Extract a new Bounded Context.";
        const modeC = "Replace the Partnership with an upstream-downstream relationship.";
        const modeBCode = "EXTRACT_NEW_BOUNDED_CONTEXT";
        const modeCCode = "REPLACE_RELATIONSHIP_WITH_UPSTREAM_DOWNSTREAM";
        const selectedMode = yield input.askForStringSelection("Please choose the strategy with which you want to suspend the partnership.", [modeB, modeC]);
        if (!selectedMode)
            return;
        const mode = selectedMode === modeB ? modeBCode : modeCCode;
        var transformFunction;
        if (mode === modeBCode) {
            console.log("chose mode B");
            transformFunction = transform('cml.ar.suspendPartnership', boundedContext1, boundedContext2, mode);
        }
        else if (mode === modeCCode) {
            console.log("chose mode C");
            const upstreamContext = yield input.askForStringSelection("Please choose which Bounded Context shall become Upstream in the Upstream-Downstream relationship.", [boundedContext1, boundedContext2]);
            transformFunction = transform('cml.ar.suspendPartnership', boundedContext1, boundedContext2, mode, upstreamContext);
        }
        if (transformFunction != null)
            transformFunction();
    });
}
function executeGenericCommandWithSingleStringArg(command) {
    return (...args) => __awaiter(this, void 0, void 0, function* () {
        const singleInputId = args[1];
        const transformFunction = transform(command, singleInputId);
        transformFunction();
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
