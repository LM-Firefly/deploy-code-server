'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
exports.activate = activate;
exports.deactivate = deactivate;
const vscode = require("vscode");
const CustomPatternController_1 = require("./CustomPatternController");
const CustomPatternDecorator_1 = require("./CustomPatternDecorator");
const ProgressIndicator_1 = require("./ProgressIndicator");
const ProgressIndicatorController_1 = require("./ProgressIndicatorController");
const SelectionHelper_1 = require("./SelectionHelper");
const TimePeriodCalculator_1 = require("./TimePeriodCalculator");
const TimePeriodController_1 = require("./TimePeriodController");
const TailController_1 = require("./TailController");
const TimestampParser_1 = require("./TimestampParsers/TimestampParser");
// this method is called when the extension is activated
function activate(context) {
    const selectionHelper = new SelectionHelper_1.SelectionHelper();
    var timestampParser = new TimestampParser_1.TimestampParser();
    // create a new time calculator and controller
    const timeCalculator = new TimePeriodCalculator_1.TimePeriodCalculator(timestampParser);
    const timeController = new TimePeriodController_1.TimePeriodController(timeCalculator, selectionHelper);
    // create log level colorizer and -controller
    const customPatternDecorator = new CustomPatternDecorator_1.CustomPatternDecorator();
    const customPatternController = new CustomPatternController_1.CustomPatternController(customPatternDecorator);
    // create progress indicator and -controller
    const progressIndicator = new ProgressIndicator_1.ProgressIndicator(timeCalculator, selectionHelper, timestampParser);
    const progressIndicatorController = new ProgressIndicatorController_1.ProgressIndicatorController(progressIndicator);
    // tail log files
    const tailController = new TailController_1.TailController();
    // register commands
    context.subscriptions.push(vscode.commands.registerCommand('logFileHighlighter.removeProgressIndicatorDecorations', () => {
        // Remove decorations
        progressIndicatorController.removeDecorations();
    }));
    // Add to a list of disposables which are disposed when this extension is deactivated.
    context.subscriptions.push(timeController, customPatternController, progressIndicatorController, tailController);
}
// this method is called when your extension is deactivated
function deactivate() {
    // Nothing to do here
}
//# sourceMappingURL=extension.js.map