"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TREEVIEW_ID = exports.TemplatePath = exports.WebViewMessage = exports.Commands = void 0;
const path = require("path");
var Commands;
(function (Commands) {
    Commands["openReaderWebView"] = "z-reader.local.openReaderWebView";
    Commands["localRefresh"] = "z-reader.command.refresh";
    Commands["openLocalDirectory"] = "z-reader.command.openLocalDirectory";
    Commands["searchOnline"] = "z-reader.command.searchOnline";
    Commands["editTemplateHtml"] = "z-reader.editTemplateHtml";
    Commands["editTemplateCss"] = "z-reader.editTemplateCss";
    Commands["goProgress"] = "z-reader.goProgress";
    Commands["progressUpdate"] = "z-reader.progress:update";
    Commands["setOnlineSite"] = "z-reader.command.setOnlineSite";
    Commands["setEncoding"] = "z-reader.command.setEncoding";
    Commands["setChapterOrder"] = "z-reader.command.setChapterOrder";
    Commands["collectRefresh"] = "z-reader.command.collectList";
    Commands["editCollectList"] = "z-reader.command.editCollectList";
    Commands["collectBook"] = "z-reader.command.collectBook";
    Commands["clearCollect"] = "z-reader.command.clearCollect";
    Commands["cancelCollect"] = "z-reader.command.cancelCollect";
    Commands["lastChapter"] = "z-reader.command.lastChapter";
    Commands["nextChapter"] = "z-reader.command.nextChapter";
})(Commands = exports.Commands || (exports.Commands = {}));
var WebViewMessage;
(function (WebViewMessage) {
    WebViewMessage["editStyle"] = "editStyle";
    WebViewMessage["editHtml"] = "editHtml";
    WebViewMessage["goProgress"] = "goProgress";
    WebViewMessage["progressUpdate"] = "progress:update";
    WebViewMessage["lastChapter"] = "lastChapter";
    WebViewMessage["nextChapter"] = "nextChapter";
})(WebViewMessage = exports.WebViewMessage || (exports.WebViewMessage = {}));
exports.TemplatePath = {
    templateCss: path.join('static', 'template', 'default', 'style.css'),
    templateHtml: path.join('static', 'template', 'default', 'index.html')
};
exports.TREEVIEW_ID = 'z-reader-menu';
//# sourceMappingURL=config.js.map