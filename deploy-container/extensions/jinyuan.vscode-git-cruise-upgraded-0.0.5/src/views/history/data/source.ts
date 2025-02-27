import { parse } from "path";
import path from 'path';

import { inject, injectable } from "inversify";
import {
	window,
	commands,
	ExtensionContext,
	workspace,
	EventEmitter,
} from "vscode";

import { debounce } from "lodash";

import { TYPES } from "../../../container/types";
import { GitService } from "../../../git/service";
import { GitGraph } from "../../../git/graph";
import {
	PathCollection,
	resolveChangesCollection,
} from "../../../git/changes/tree";
import { ChangeTreeDataProvider } from "../../changes/ChangeTreeDataProvider";

import type { IBatchedCommits, LogOptions } from "../../../git/types";

import {
	REFRESH_COMMAND,
	RESET_COMMAND,
	SWITCH_BRANCH_COMMAND,
} from "../../../commands/switch";

import {
	FILTER_AUTHOR_COMMAND,
	FILTER_MESSAGE_COMMAND,
} from "../../../commands/filter";

import { INPUT_HASH_COMMAND } from "../../../commands/input";

import { link } from "./link";
import state from "./state";

@injectable()
export class Source {
	private switchSubscriber?: (batchedCommits: IBatchedCommits) => void;

	private commitsEventEmitter = new EventEmitter<{ totalCount: number }>();

	private _onDidViewChanges = new EventEmitter<{ fileTree: PathCollection, commitInfos: any[] }>();
	public readonly onDidViewChanges = this._onDidViewChanges.event;

	private _onDidFileLocate = new EventEmitter<{ filePath: string }>();
	public readonly onDidFileLocate = this._onDidFileLocate.event;

	constructor(
		@inject(TYPES.ExtensionContext) private context: ExtensionContext,
		private git: GitService,
		private graph: GitGraph,
		private ChangeTreeDataProvider: ChangeTreeDataProvider
	) { }

	getSwitchSubscriber() {
		return this.switchSubscriber;
	}

	getCommitsEventEmitter() {
		return this.commitsEventEmitter;
	}

	@link("subscription")
	onCommandExecuted(handler: (param: any) => void) {
		const commandName = 'git-history.history.triggerOnLocate'; // 替换为实际的命令名称

		// 注册命令并绑定处理器
		this.context.subscriptions.push(
			commands.registerCommand(commandName, (hash: string, filePath: string) => {
				console.log('source中triggerOnLocate命令args:', hash, filePath);
				const param = {
					hash: hash,
					filePath: filePath
				};
				//获取args的第一个参数
				handler(param);
			})
		);
	}

	@link("promise")
	getWorkspacePath() {
		return Promise.resolve(workspace.workspaceFolders![0].uri.fsPath);
	}

	@link("promise")
	getDefaultRepository() {
		const repoPath = this.git.getDefaultRepository();
		if (!repoPath) {
			return Promise.resolve();
		}

		return Promise.resolve({
			name: parse(repoPath).base,
			path: repoPath,
		});
	}

	@link("subscription")
	async subscribeSwitcher(
		handler: (batchedCommits: IBatchedCommits) => void
	) {
		this.switchSubscriber = handler;
	}

	@link("promise")
	resetLog() {
		return commands.executeCommand<string>(RESET_COMMAND);
	}

	@link("subscription")
	async switchReference() {
		state.logOptions.ref = await commands.executeCommand<string>(
			SWITCH_BRANCH_COMMAND
		);
	}

	@link("subscription")
	async filterMessage(handler: (batchedCommits: IBatchedCommits) => void) {
		state.logOptions.keyword = await commands.executeCommand<string>(
			FILTER_MESSAGE_COMMAND
		);
		this.getCommits(handler, state.logOptions);
	}

	@link("subscription")
	async filterAuthor(handler: (batchedCommits: IBatchedCommits) => void) {
		state.logOptions.authors = await commands.executeCommand<string[]>(
			FILTER_AUTHOR_COMMAND
		);
		this.getCommits(handler, state.logOptions);
	}

	@link("promise")
	async inputHash() {
		return commands.executeCommand<string>(INPUT_HASH_COMMAND);
	}

	@link("promise")
	async showWarningMessage(message: string) {
		window.showWarningMessage(message);
	}

	@link("subscription")
	async getCommits(
		handler: (batchedCommits: IBatchedCommits) => void,
		options: LogOptions
	) {
		const FIRST_BATCH_SIZE = 300;
		const firstBatchCommits = await this.git.getCommits({
			...options,
			count: FIRST_BATCH_SIZE,
		});

		let _batchNumber = 0;

		this.graph.registerHandler(handler);

		const BATCH_SIZE = 14000;
		if (
			firstBatchCommits &&
			firstBatchCommits.length === FIRST_BATCH_SIZE
		) {
			const totalCount = Number(
				await this.git.getCommitsTotalCount(options)
			);

			this.commitsEventEmitter.fire({ totalCount });

			this.graph.attachGraphAndPost({
				totalCount,
				batchNumber: _batchNumber,
				commits: firstBatchCommits,
				options,
			});

			for (let i = FIRST_BATCH_SIZE; i < totalCount; i = i + BATCH_SIZE) {
				const batchNumber = ++_batchNumber;

				this.git
					.getCommits({
						...options,
						count: BATCH_SIZE,
						skip: i,
					})
					.then((commits = []) =>
						this.graph.attachGraphAndPost({
							totalCount,
							batchNumber,
							commits,
							options,
						})
					);
			}
		} else {
			const totalCount = firstBatchCommits?.length || 0;
			this.commitsEventEmitter.fire({ totalCount });
			this.graph.attachGraphAndPost({
				totalCount,
				batchNumber: _batchNumber,
				commits: firstBatchCommits || [],
				options,
			});
		}
	}

	@link("promise")
	async viewChanges(refs: string[]) {
		const repoPath = state.logOptions.repo || "";
		const commitInfos: any[] = await Promise.all(refs.map(ref => this.git.getCommitInfo(repoPath, ref)));

		const changesCollection = await this.git.getChangesCollection(repoPath, refs);
		// const workspacePath = workspace.workspaceFolders![0].uri.path
		//修改根路径为当前工作区路径
		// const workspacePath = 'e:\\02-Workspace\\01-codes\\extension\\Bookmark';
		const workspaceFolders = workspace.workspaceFolders;
		const workspaceZero = workspaceFolders![0];
		const workspacePath = path.dirname(workspaceZero.uri.path);
		const newFileTree = resolveChangesCollection(
			changesCollection,
			workspacePath
		);
		this.updateTreeView(newFileTree, commitInfos);

		// 发射事件通知更新
		this._onDidViewChanges.fire({ fileTree: newFileTree, commitInfos: commitInfos });
	}

	@link("promise")
	async locateFile(filePath: string) {
		if (filePath) {
			// 发射事件通知更新
			this._onDidFileLocate.fire({ filePath: filePath });
		}
	}

	@link("promise")
	async autoRefreshLog() {
		const DEBOUNCE_INTERVAL = 12000;
		const debouncedRefresh = debounce(
			() => commands.executeCommand<string>(REFRESH_COMMAND),
			DEBOUNCE_INTERVAL,
			{ leading: true }
		);

		if (!state.logOptions.repo) {
			state.logOptions = {
				repo: await this.git.getDefaultRepository(),
			};
		}
		debouncedRefresh();

		setTimeout(
			() =>
				this.git.onDidRepoChange((repository) => {
					const { rootUri } = repository;
					if (rootUri.fsPath === state.logOptions.repo) {
						debouncedRefresh();
					}
				}),
			DEBOUNCE_INTERVAL
		);
	}

	@link("subscription")
	onReposChange(handler: (repos: { name: string; path: string }[]) => void) {
		this.git.onReposChange((repos) => {
			handler(
				repos.map((repoPath) => ({
					name: parse(repoPath).base,
					path: repoPath,
				}))
			);
		});
	}

	private updateTreeView(fileTree: PathCollection, commitInfos: any[]) {
		this.context.globalState.update("changedFileTree", fileTree);
		this.ChangeTreeDataProvider.refresh(commitInfos);
	}
}
