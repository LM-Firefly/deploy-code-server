import { ExtensionContext, TreeView, window } from "vscode";
import vscode from "vscode";
import { inject, injectable } from "inversify";

import { TYPES } from "../../container/types";

import { EXTENSION_SCHEME } from "../../constants";

import { commitInfoCollapsibleState } from "../../common/Constant";

import { ChangeTreeDataProvider, HeaderItem } from "./ChangeTreeDataProvider";



@injectable()
export class ChangeTreeView {
	private changesViewer: TreeView<any>;

	constructor(
		@inject(TYPES.ExtensionContext) private context: ExtensionContext,
		private changeTreeDataProvider: ChangeTreeDataProvider
	) {
		this.changesViewer = window.createTreeView(
			`${EXTENSION_SCHEME}.changes`,
			{
				treeDataProvider: this.changeTreeDataProvider,
			}
		);

		/* 以下是实现 commitInfo 展开状态的记忆功能，即上次是收起的，下次打开还是收起，直至再次手动展开 */
		this.changesViewer.onDidCollapseElement(e => {
			if (e.element instanceof HeaderItem) {
				changeTreeDataProvider.setCollapsibleState(commitInfoCollapsibleState, vscode.TreeItemCollapsibleState.Collapsed);
			}
		});

		this.changesViewer.onDidExpandElement(e => {
			if (e.element instanceof HeaderItem) {
				changeTreeDataProvider.setCollapsibleState(commitInfoCollapsibleState, vscode.TreeItemCollapsibleState.Expanded);
			}
		});
	}
}
