import { ReactNode, useEffect, useRef, useState } from "react";
import { useDrag } from "@use-gesture/react";
import { sortedIndex } from "lodash";
import classNames from "classnames";

import { useVirtual } from "react-virtual";

import { checkScrollBarVisible } from "../../utils/element";

import { useIsKeyPressed } from "./event";

import style from "./index.module.scss";

type Id = string;

interface Props<T> {
	list: string[];
	keyLength: number;
	locationIndex?: number;
	filePath?: string;
	itemPipe: (item: string) => T;
	itemRender: (o: T) => ReactNode;
	size?: number;
	onPick?: (ids: Id[]) => void;
	onPickWithPath?: (path: string) => void;
}

const INDEX_PLACEHOLDER = -1;
const SCROLL_BAR_WIDTH = 10;

const PickableList = <T extends Record<string, any>>(
	props: Props<T> & { children?: ReactNode }
) => {
	const {
		list,
		keyLength,
		locationIndex,
		filePath,
		itemPipe,
		itemRender,
		size,
		onPick,
		onPickWithPath
	} = props;
	const scrollContainerRef = useRef<HTMLDivElement>(null);
	const dragContainerRef = useRef<HTMLDivElement>(null);

	const { virtualItems, totalSize, scrollToIndex } = useVirtual({
		size: size ?? list.length,
		parentRef: scrollContainerRef,
		overscan: 10,
	});

	const [pickedItems, setPickedItems] = useState<Record<Id, number>>({});
	const [containerRect, setContainerRect] = useState<DOMRect | undefined>();
	const [itemYs, setItemYs] = useState<number[]>([]);
	const [dragStartIndex, setDragStartIndex] =
		useState<number>(INDEX_PLACEHOLDER);
	const { checkKeyIsPressed } = useIsKeyPressed();

	useEffect(() => {
		if (typeof locationIndex !== "number") {
			return;
		}

		// 滚动到指定的行并居中显示
		scrollToIndex(locationIndex || 0, { align: "center" });

		// 获取要选中的项的 ID
		const id = list[locationIndex].slice(0, keyLength);

		// 先清空所有选中项，再添加当前项为选中状态
		// setPickedItems((prevPickedItems) => ({
		// 	...prevPickedItems,
		// 	[id]: locationIndex,
		// }));
		setPickedItems({
			[id]: locationIndex,
		});
		console.log("locationIndex如下：",locationIndex);
		onPick && onPick([id]);
	}, [scrollToIndex, locationIndex, list, keyLength, onPick]);

	useEffect(() => {
		if (typeof filePath !== "string") {
			return;
		}
		let finalFilePath = filePath;
		if(!finalFilePath){
			finalFilePath = "";
		}
		console.log("finalFilePath如下：",finalFilePath);
		onPickWithPath && onPickWithPath(finalFilePath);
	}, [filePath,onPickWithPath]);

	const dragBind = useDrag(({ type, xy, target }) => {
		const [x, y] = xy;

		const existedItems =
			checkKeyIsPressed("Meta") || checkKeyIsPressed("Control")
				? pickedItems
				: {};
		const firstItemIndex = virtualItems[0].index;
		if (type === "pointerdown") {
			const scrollContainerEl = scrollContainerRef.current!;

			const isPointerOnButton = !!(target as HTMLElement).closest(
				"[data-button]"
			);
			if (isPointerOnButton) {
				return;
			}

			const isPointerOnScrollBar =
				scrollContainerEl.getBoundingClientRect().width - x <=
				SCROLL_BAR_WIDTH;
			if (
				checkScrollBarVisible(scrollContainerEl) &&
				isPointerOnScrollBar
			) {
				return;
			}

			const realTimeContainerRect =
				dragContainerRef.current?.getBoundingClientRect();
			const realTimeItemYs = Array.from(
				dragContainerRef.current?.children || []
			).map((element) => element.getBoundingClientRect().y);

			const dragStartIndex =
				firstItemIndex + sortedIndex(realTimeItemYs, y) - 1;
			setContainerRect(realTimeContainerRect);
			setItemYs(realTimeItemYs);
			setDragStartIndex(dragStartIndex);

			const id = list![dragStartIndex].slice(0, keyLength);
			setPickedItems({
				...existedItems,
				[id]: dragStartIndex,
			});
			return;
		}

		if (type === "pointerup") {
			if (dragStartIndex === INDEX_PLACEHOLDER) {
				return;
			}

			setDragStartIndex(INDEX_PLACEHOLDER);
			onPick &&
				onPick(
					Object.keys(pickedItems!).sort(
						(id1, id2) => pickedItems[id1] - pickedItems[id2]
					)
				);
			return;
		}

		if (
			containerRect &&
			x > containerRect.x &&
			x < containerRect.x + containerRect.width &&
			y > containerRect.y &&
			y < containerRect.y + containerRect.height
		) {
			if (dragStartIndex === INDEX_PLACEHOLDER) {
				return;
			}

			const currentIndex = firstItemIndex + sortedIndex(itemYs, y) - 1;
			const currentItems = { ...existedItems };
			for (
				let index = Math.min(dragStartIndex, currentIndex);
				index <= Math.max(dragStartIndex, currentIndex);
				index++
			) {
				const id = list![index].slice(0, keyLength);
				if (!Object.prototype.hasOwnProperty.call(currentItems, id)) {
					currentItems[id] = index;
				}
			}

			setPickedItems(currentItems);
		}
	});

	return (
		<div
			{...dragBind()}
			ref={scrollContainerRef}
			style={{ overflow: "auto" }}
			className={style.container}
		>
			<div
				ref={dragContainerRef}
				style={{
					height: `${totalSize}px`,
					width: "100%",
					position: "relative",
				}}
			>
				{virtualItems.map((virtualRow) => (
					<div
						key={virtualRow.index}
						ref={virtualRow.measureRef}
						className={classNames(style.item, {
							[style.picked]:
								list[virtualRow.index] &&
								Object.prototype.hasOwnProperty.call(
									pickedItems,
									list[virtualRow.index].slice(0, keyLength)
								),
							[style.located]: virtualRow.index === locationIndex,
						})}
						style={{
							position: "absolute",
							top: 0,
							left: 0,
							width: "100%",
							height: "22px",
							transform: `translateY(${virtualRow.start}px)`,
						}}
					>
						{list[virtualRow.index] &&
							itemRender(itemPipe(list[virtualRow.index]))}
					</div>
				))}
			</div>
		</div>
	);
};

export default PickableList;
