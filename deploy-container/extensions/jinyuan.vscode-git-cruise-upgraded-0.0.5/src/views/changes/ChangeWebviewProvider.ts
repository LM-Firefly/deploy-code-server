import * as fs from 'fs';
import path from "path";

import { inject, injectable } from "inversify";
import {
    ExtensionContext,
    Uri,
    Webview,
    WebviewView,
    WebviewViewProvider,
    commands,
} from "vscode";

import { TYPES } from "../../container/types";
import { Source } from "../history/data/source";
import { changeWebviewHtmlPath } from '../../common/Constant';
import { PathCollection } from '../../git/changes/tree';
import { compareFileTreeNode } from "../../git/utils";

import { Path } from "./ChangeTreeDataProvider";

@injectable()
export class ChangeWebviewProvider implements WebviewViewProvider {
    constructor(
        @inject(TYPES.ExtensionContext) private context: ExtensionContext,
        private source: Source
    ) {
        // 监听 viewChanges 事件
        this.source.onDidViewChanges(this.onViewChanges, this);
        // 监听 fileLoacte 事件
        this.source.onDidFileLocate(this.locateFile, this);
        // 注册 locateFile 命令
        commands.registerCommand('git-history.history.locateFile', this.locateFile, this);
    }
    private webviewView: WebviewView | undefined;
    resolveWebviewView(
        webviewView: WebviewView
    ) {
        const { extensionUri } = this.context;

        this.source.getCommitsEventEmitter().event(({ totalCount }) => {
            webviewView.description = `${totalCount} commits in total`;
        });

        webviewView.webview.options = {
            enableScripts: true,
            localResourceRoots: [
                Uri.joinPath(extensionUri, "dist"),
                Uri.joinPath(extensionUri, 'icons')
            ],
        };
        webviewView.webview.html = this.generateWebviewContent(
            webviewView.webview
        );
        this.webviewView = webviewView;
        // 监听来自 Webview 的消息
        webviewView.webview.onDidReceiveMessage(
            message => {
                const commandObject = message.command;
                if (commandObject) {
                    const command = commandObject.command;
                    const rawArgs = commandObject.arguments;
                    const args = rawArgs.map((arg: any) => {
                        if (arg && arg.scheme && arg.path) {
                            let uri = Uri.parse(`${arg.scheme}:${arg.path}`);
                            if (arg.query) {
                                uri = uri.with({ query: JSON.stringify(JSON.parse(arg.query)) });
                            }
                            return uri;
                        }
                        return arg;
                    });
                    if (command && args) {
                        commands.executeCommand(command, ...args);
                    }
                    // console.log('command', command);
                }

                const collapseStore = message.collapseStore;
                if (collapseStore) {
                    console.log("collapseStore");
                }
            },
            undefined,
            this.context.subscriptions
        );
    }

    private locateFile({ filePath }: { filePath: string }) {
        const webview = this.webviewView?.webview;
        if (webview) {
            webview.postMessage({ command: "locateFile", filePath });
        }
    }

    private onViewChanges({ fileTree, commitInfos }: { fileTree: PathCollection, commitInfos: any[] }) {
        const webview = this.webviewView?.webview;
        if (webview) {
            const items: Path[] = [];
            if (fileTree) {
                items.push(
                    ...Object.entries(fileTree)
                        .sort(compareFileTreeNode)
                        .map(([name, props]) => new Path(name, props))
                );
            }
            const item = items[0];
            if (item) {
                this.fillChild(item, item.children);
            }
            webview.postMessage({ command: "initTreeItems", item, commitInfos });
        }
    }

    private fillChild(item: Path, fileTree: PathCollection | undefined) {
        const child: Path[] = [];
        if (fileTree) {
            child.push(
                ...Object.entries(fileTree)
                    .sort(compareFileTreeNode)
                    .map(([name, props]) => new Path(name, props))
            );
        }
        item.child = child;
        if (child && child.length > 0) {
            child.forEach((childItem) => {
                this.fillChild(childItem, childItem.children);
            });
        }
    }

    generateWebviewContent(webview: Webview) {
        const { extensionPath } = this.context;
        const scriptPath = Uri.file(
            path.join(extensionPath, "dist", "view.js")
        );
        const scriptUri = webview.asWebviewUri(scriptPath);
        const nonce = this.getNonce();


        const htmlPath = path.join(extensionPath, ...changeWebviewHtmlPath);
        let html = fs.readFileSync(htmlPath, 'utf8');
        html = html.replace('{nonce}', nonce);
        html = html.replace('{scriptUri}', scriptUri.toString());

        // 替换图标路径
        const folderIconPath = webview.asWebviewUri(Uri.file(path.join(extensionPath, "icons", "folder.png")));
        const fileIconPath = webview.asWebviewUri(Uri.file(path.join(extensionPath, "icons", "file.png")));
        const authorIconPath = webview.asWebviewUri(Uri.file(path.join(extensionPath, "icons", "author.png")));
        const branchIconPath = webview.asWebviewUri(Uri.file(path.join(extensionPath, "icons", "branch.png")));
        const messageIconPath = webview.asWebviewUri(Uri.file(path.join(extensionPath, "icons", "message.png")));
        const expandIconPath = webview.asWebviewUri(Uri.file(path.join(extensionPath, "icons", "expand.png")));
        const collapseIconPath = webview.asWebviewUri(Uri.file(path.join(extensionPath, "icons", "collapse.png")));
        html = html.replace('{folderIconPath}', folderIconPath.toString());
        html = html.replace('{fileIconPath}', fileIconPath.toString());
        html = html.replace('{authorIconPath}', authorIconPath.toString());
        html = html.replace('{branchIconPath}', branchIconPath.toString());
        html = html.replace('{messageIconPath}', messageIconPath.toString());
        html = html.replace('{expandIconPath}', expandIconPath.toString());
        html = html.replace('{collapseIconPath}', collapseIconPath.toString());

        return html;
    }

    private getNonce() {
        let text = "";
        const possible =
            "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
        for (let i = 0; i < 32; i++) {
            text += possible.charAt(
                Math.floor(Math.random() * possible.length)
            );
        }
        return text;
    }
}