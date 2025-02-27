import { window } from "vscode";
import { injectable } from "inversify";

import { GitStatusFileDecorationProvider } from "./views/changes/GitStatusFileDecorationProvider";
import { EXTENSION_SCHEME } from "./constants";
import { HistoryWebviewViewProvider } from "./views/history/HistoryViewProvider";
import { getCommandDisposables } from "./commands";
import { ChangeWebviewProvider } from "./views/changes/ChangeWebviewProvider";

@injectable()
export class DisposableController {
	constructor(
		private webviewProvider: HistoryWebviewViewProvider,
		private changeWebviewProvider: ChangeWebviewProvider,
		private GitStatusFileDecorationProvider: GitStatusFileDecorationProvider
	) { }

	createDisposables() {
		return [
			...getCommandDisposables(),
			window.registerWebviewViewProvider(
				`${EXTENSION_SCHEME}.history`,
				this.webviewProvider,
				{ webviewOptions: { retainContextWhenHidden: true } }
			),
			window.registerFileDecorationProvider(
				this.GitStatusFileDecorationProvider
			),

			window.registerWebviewViewProvider(
				`${EXTENSION_SCHEME}.changes`,
				this.changeWebviewProvider,
				{ webviewOptions: { retainContextWhenHidden: true } }
			),
		];
	}
}
