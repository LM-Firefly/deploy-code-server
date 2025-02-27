import {
	FC,
	useCallback,
	useContext,
	useEffect,
	useMemo,
	useState,
	useRef
} from "react";
import { VSCodeButton } from "@vscode/webview-ui-toolkit/react";
import { useMeasure } from "react-use";

import type { IBatchedCommits } from "../../../../git/types";

import PickableList from "../PickableList";
import { ChannelContext } from "../../data/channel";

import { ICommit, parseCommit } from "../../../../git/commit";

import { useBatchCommits } from "./useBatchCommits";
import { useColumnResize } from "./useColumnResize";

import { HEADERS } from "./constants";

import style from "./index.module.scss";

const CommitsTableInner: FC<{ totalWidth: number }> = ({ totalWidth }) => {
	const channel = useContext(ChannelContext)!;

	const { commits, commitsCount, options, setBatchedCommits } =
		useBatchCommits();

	const commitsRef = useRef<string[]>(commits);

	function diff(sortedRefs: string[]) {
		channel.viewChanges(sortedRefs);
	}

	function diffWithPath(filePath:string) {
		channel.locateFile(filePath);
	}

	const subscribeSwitcher = useCallback(() => {
		channel.subscribeSwitcher((batchedCommits: IBatchedCommits) =>
			setBatchedCommits(batchedCommits)
		);
	}, [channel, setBatchedCommits]);

	const onSelectReference = useCallback(
		() => channel.switchReference(),
		[channel]
	);

	const onFilter = useCallback(
		(prop: string) => {
			switch (prop) {
				case "description":
					channel.filterMessage((batchedCommits: IBatchedCommits) =>
						setBatchedCommits(batchedCommits)
					);
					break;
				case "author":
					channel.filterAuthor((batchedCommits: IBatchedCommits) =>
						setBatchedCommits(batchedCommits)
					);
					break;
			}
		},
		[channel, setBatchedCommits]
	);

	const [locationIndex, setLocationIndex] = useState<number>();
	const [filePath, setFilePath] = useState<string>();
	const onLocate = useCallback(
		async (prop: string) => {
			switch (prop) {
				case "hash":
					const hash = await channel.inputHash();
					if (!hash) {
						return;
					}
					// console.log("commits如下：", commits);
					const index = commits.findIndex((commit) =>
						commit.startsWith(hash || "")
					);

					if (index === -1) {
						channel.showWarningMessage("No commit matched!");
						return;
					}

					setLocationIndex(index);
					// destroy location index after the blink animation finished
					setTimeout(() => {
						setLocationIndex(undefined);
					}, 1500);
					break;
			}
		},
		[channel, commits]
	);

	useEffect(() => {
		commitsRef.current = commits;
	}, [commits]);

	const onLocateByHash = useCallback(
		async (hash: string,filePath:string) => {
			if (!hash) {
				return;
			}
			// console.log("commits如下：",commitsRef.current);
			const index = commitsRef.current.findIndex((commit) =>
				commit.startsWith(hash || "")
			);
			if (index === -1) {
				channel.showWarningMessage("No commit matched!");
				return;
			}
			setLocationIndex(index);
			setFilePath(filePath);

			//重置 locationIndex 和 filePath，否则下次定位会失败
			setTimeout(() => {
				setLocationIndex(undefined);
				setFilePath(undefined);
			}, 1500);
		},
		[channel]
	);

	const handleCommand = useCallback((param: any) => {
		console.log('命令执行，参数:', JSON.stringify(param));
		// onLocate('hash');
		onLocateByHash(param.hash,param.filePath);
		// 在这里执行组件中的其他逻辑
	}, [onLocateByHash]);

	useEffect(() => {
		channel.onCommandExecuted(handleCommand);
		// 可选：清理函数（如果需要取消订阅）
		return () => {
			// 实现取消订阅的逻辑（取决于 message.ts 和 source.ts 的设计）
		};
	}, [channel, handleCommand]);

	// TODO: columns setting
	const headers = useMemo(() => {
		return HEADERS;
	}, []);

	const { columns } = useColumnResize(headers, totalWidth);

	useEffect(() => {
		subscribeSwitcher();

		channel.autoRefreshLog();
	}, [channel, subscribeSwitcher]);

	return (
		<>
			<div className={style["commit-headers"]}>
				{columns.map(
					(
						{
							prop,
							label,
							filterable,
							locatable,
							filterLogOption,
							hasDivider,
							size,
							dragBind,
						},
						index
					) => (
						<div
							key={prop}
							className={style["header-item"]}
							style={{
								width: `${size}px`,
							}}
						>
							{hasDivider && (
								<div
									{...dragBind(index)}
									className={style.divider}
								/>
							)}
							{prop === "graph" ? (
								<VSCodeButton
									className={style["ref-button"]}
									data-button
									appearance="icon"
									title={`Select Branch/Reference · ${options.ref || "All"
										}`}
									aria-label="All"
									onClick={() => onSelectReference()}
								>
									<span className="codicon codicon-git-branch" />
									<span className={style.text}>
										{options.ref || "All"}
									</span>
								</VSCodeButton>
							) : (
								<>
									<span>{label}</span>
									{filterable && (
										<VSCodeButton
											appearance="icon"
											onClick={() => onFilter(prop)}
										>
											<span
												className={`codicon codicon-filter${options[
													filterLogOption as
													| "authors"
													| "keyword"
												]?.length
													? "-filled"
													: ""
													}`}
											/>
										</VSCodeButton>
									)}
									{locatable && (
										<VSCodeButton
											appearance="icon"
											onClick={() => onLocate(prop)}
										>
											<span className="codicon codicon-search" />
										</VSCodeButton>
									)}
								</>
							)}
						</div>
					)
				)}
			</div>
			<div className={style["commits-area"]}>
				<PickableList
					list={commits}
					keyLength={40}
					locationIndex={locationIndex}
					filePath={filePath}
					itemPipe={parseCommit}
					itemRender={(commit: ICommit) => (
						<div className={style.commit}>
							{columns.map(({ prop, size, transformer }) => (
								<span
									style={{
										width: `${size}px`,
									}}
									data-prop={prop}
									key={prop}
								>
									{transformer(commit)}
								</span>
							))}
						</div>
					)}
					size={commitsCount}
					onPick={(ids) => diff(ids)}
					onPickWithPath={(filePath) => diffWithPath(filePath)}
				/>
			</div>
		</>
	);
};

const CommitsTable: FC = () => {
	const [ref, { width }] = useMeasure<HTMLDivElement>();

	return (
		<div ref={ref} className={style.container}>
			<CommitsTableInner totalWidth={width} />
		</div>
	);
};

export default CommitsTable;
