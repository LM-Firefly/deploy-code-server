import {
	TreeDataProvider,
	TreeItem,
	ThemeIcon,
	ExtensionContext,
	TreeItemCollapsibleState,
	Uri,
	EventEmitter,
	Command,
} from "vscode";
import * as vscode from "vscode";
import { inject, injectable } from "inversify";

import { TYPES } from "../../container/types";
import { compareFileTreeNode, getDiffUriPair } from "../../git/utils";
import { EXTENSION_SCHEME } from "../../constants";
import {
	FileNode,
	FolderNode,
	PathCollection,
	PathType,
} from "../../git/changes/tree";
import { commitInfoCollapsibleState } from "../../common/Constant";

@injectable()
export class ChangeTreeDataProvider implements TreeDataProvider<TreeItem> {
	private globalCommitInfos: any[] = [];
	private _onDidChangeTreeData = new EventEmitter<void>();
	readonly onDidChangeTreeData = this._onDidChangeTreeData.event;

	constructor(
		@inject(TYPES.ExtensionContext) private context: ExtensionContext
	) { }

	getTreeItem(element: Path) {
		return element;
	}

	getChildren(element?: TreeItem): Promise<TreeItem[]> {
		const items: TreeItem[] = [];

		if (!element) { // 根节点
			if (this.globalCommitInfos && this.globalCommitInfos.length > 0) {
				let textItems: TextItem[] = [];
				this.globalCommitInfos.forEach((commitInfo) => {
					const headerItem = new HeaderItem(commitInfo.hash.substring(0, 6),this);
					// 插入 HeaderItem 作为commit信息
					//把commitInfo.date 转换为 yyyy-MM-dd HH:mm:ss 格式
					const date = new Date(commitInfo.date);
					const dateStr = date.toLocaleString('zh-CN', {
						year: 'numeric',
						month: '2-digit',
						day: '2-digit',
						hour: '2-digit',
						minute: '2-digit',
						second: '2-digit',
						hour12: false
					}).replace(/\//g, '-');
					const authorStr = `${commitInfo.authorName} <${commitInfo.authorEmail}> on ${dateStr}`;
					const messageStr = commitInfo.message;
					let branchStr: string = '';
					if (commitInfo.branches && commitInfo.branches.length > 0) {
						branchStr = commitInfo.branches.join(',');
					}
					textItems.push(new TextItem(authorStr, { wrap: true, iconPath: 'account' }));
					textItems.push(new TextItem(messageStr, { wrap: true, iconPath: 'edit' }));
					textItems.push(new TextItem(branchStr, { wrap: true, iconPath: 'git-branch' }));
					headerItem.children = textItems;
					items.push(headerItem);
					//清空textItems
					textItems = [];
				});
			}

			// 获取原有的变化文件树数据
			const data = this.context.globalState.get<PathCollection>("changedFileTree");
			if (data) {
				items.push(
					...Object.entries(data)
						.sort(compareFileTreeNode)
						.map(([name, props]) => new Path(name, props))
				);
			}
		} else if (!(element instanceof HeaderItem)) {
			// 获取其他子节点
			items.push(
				...Object.entries((element as Path).children as PathCollection)
					.sort(compareFileTreeNode)
					.map(([name, props]) => new Path(name, props))
			);
		} else if (element instanceof HeaderItem) {
			const textList = element.children;
			if (textList && textList.length > 0) {
				textList.forEach((textItem) => {
					items.push(textItem);
				});
			}
		}

		return Promise.resolve(items);
	}

	refresh(commitInfos: any[]) {
		this.globalCommitInfos = commitInfos;
		this._onDidChangeTreeData.fire();
	}

	getCollapsibleState(key:string): vscode.TreeItemCollapsibleState {
		const state = this.context.workspaceState.get<vscode.TreeItemCollapsibleState>(key);
		return state !== undefined ? state : vscode.TreeItemCollapsibleState.Expanded;
	}
	
	setCollapsibleState(key:string,state: vscode.TreeItemCollapsibleState): void {
		this.context.workspaceState.update(key, state);
	}
}

export class HeaderItem extends TreeItem {
	children?: TextItem[] = [];
	contextValue = 'header';
	iconPath = new ThemeIcon('comment'); // 可选：设置图标
	command = undefined;   // 无命令
	collapsibleState = this.provider.getCollapsibleState(commitInfoCollapsibleState); // 默认展开   
	constructor(public label: string,private provider: ChangeTreeDataProvider) {
		super(label);
	}
}

export class TextItem extends TreeItem {
	constructor(public text: string, public options?: { wrap?: boolean, iconPath?: string }) {
		super(text);
		if (options?.iconPath) {
			this.iconPath = new ThemeIcon(options.iconPath);
		}
	}
}

export class Path extends TreeItem {
	child: Path[] = [];
	children?: PathCollection = (this.props as FolderNode).children;
	iconPath = ThemeIcon[this.props.type];
	resourceUri = this.getResourceUri();
	collapsibleState = this.getCollapsibleState();
	readonly command?: Command = this.getCommand();

	constructor(public label: string, public props: FolderNode | FileNode) {
		super(label);
	}

	private getResourceUri() {
		if (this.props.type === PathType.FILE) {
			const { uri } = this.props;
			if (uri instanceof Uri) {
				return uri.with({
					scheme: EXTENSION_SCHEME,
					query: JSON.stringify({ status: this.props.status }),
				});
			} else {
				console.log("Resource非uri如下：", uri);
			}
		}

		if (this.props.type === PathType.FOLDER) {
			return Uri.file(this.label);
		}
	}

	private getCollapsibleState() {
		const { type } = this.props;
		const STATE_MAP = {
			[PathType.FOLDER]: TreeItemCollapsibleState.Expanded,
			[PathType.FILE]: TreeItemCollapsibleState.None,
		};

		return STATE_MAP[type];
	}

	private getCommand() {
		if (this.props.type === PathType.FILE) {
			const { uri } = this.props;
			if (uri instanceof Uri) {
				return {
					title: "diff",
					command: "vscode.diff",
					arguments: getDiffUriPair(this.props),
				};
			} else {
				console.log("command非uri如下：", uri);
			}
		}
	}
}
