import { exec } from 'child_process';

import * as vscode from 'vscode';

const line_match_1 = /^\^?(\w+)\s\((.*?)\s+(\d{4}-\d{2}-\d{2}\s\d{2}:\d{2}:\d{2})\s.*?\s(\d+)\)\s/;
const line_match_2 = /^\^?(\w+)\s.*?\((.*?)\s+(\d{4}-\d{2}-\d{2}\s\d{2}:\d{2}:\d{2})\s.*?\s(\d+)\)\s/;
// const line_match_1 = /^\^?(\w+)\s\((.*?)\s+(\d{4}-\d{2}-\d{2})\s.*?\s(\d+)\)\s/;
// const line_match_2 = /^\^?(\w+)\s.*?\((.*?)\s+(\d{4}-\d{2}-\d{2})\s.*?\s(\d+)\)\s/;
const HOVER_MESSAGE_TEMPLATE = `**Hash**: {hash}\n**Time**: {time}\n`;

export function getBlameCommandsDisposable(context: vscode.ExtensionContext) {
    let isBlameActive = false;
    let blameDecorationType: vscode.TextEditorDecorationType | undefined;
    let selectionChangeListener: vscode.Disposable | undefined;

    // 创建行号与 commitHash 的映射
    const lineToCommitHashMap: Map<number, string> = new Map();

    // 定义一个函数来检测当前文件是否在 Git 管理的项目中
    function checkGitRepositoryForActiveEditor() {
        const editor = vscode.window.activeTextEditor;
        if (editor) {
            const workspaceFolder = vscode.workspace.getWorkspaceFolder(editor.document.uri);
            if (workspaceFolder) {
                // 默认启动文件，blameActive都是false
                isBlameActive = false;
                vscode.commands.executeCommand('setContext', 'blameActive', false);

                const workspacePath = workspaceFolder.uri.fsPath;
                // 检查当前文件是否在 Git 管理的项目中
                exec(`git rev-parse --is-inside-work-tree`, { cwd: workspacePath }, (error, stdout) => {
                    if (error || stdout.trim() !== 'true') {
                        vscode.commands.executeCommand('setContext', 'isGitRepository', false);
                    } else {
                        vscode.commands.executeCommand('setContext', 'isGitRepository', true);
                    }
                });
            } else {
                vscode.commands.executeCommand('setContext', 'isGitRepository', false);
            }
        } else {
            vscode.commands.executeCommand('setContext', 'isGitRepository', false);
        }
    }

    // 激活时检查当前活动的文件
    checkGitRepositoryForActiveEditor();

    // 动态设置 isGitRepository 上下文，监听文件切换
    vscode.window.onDidChangeActiveTextEditor(() => {
        checkGitRepositoryForActiveEditor();
    });

    let disposable = vscode.commands.registerCommand('extension.annotateWithGitBlame', () => {
        if (isBlameActive) {
            vscode.window.showWarningMessage('Annotate with Git Blame is already active.');
            return;
        }

        isBlameActive = true;
        vscode.commands.executeCommand('setContext', 'blameActive', true);

        const editor = vscode.window.activeTextEditor;
        if (editor) {
            const filePath = editor.document.fileName;
            const workspaceFolder = vscode.workspace.getWorkspaceFolder(editor.document.uri);

            if (workspaceFolder) {
                const workspacePath = workspaceFolder.uri.fsPath;

                // 检查文件是否在 Git 管理的项目中
                exec(`git rev-parse --is-inside-work-tree`, { cwd: workspacePath }, (error, stdout) => {
                    if (error || stdout.trim() !== 'true') {
                        vscode.window.showErrorMessage('This file is not part of a Git repository.');
                        return;
                    }

                    exec(`git blame ${filePath}`, { cwd: workspacePath }, (error, stdout, stderr) => {
                        if (error) {
                            vscode.window.showErrorMessage(`Error: ${stderr}`);
                            return;
                        }

                        // 处理 git blame 输出
                        const blameInfo = stdout.split('\n');
                        const decorations: vscode.DecorationOptions[] = [];
                        let maxLength = 0;

                        // 计算最长的 blame 信息长度
                        blameInfo.forEach((line) => {
                            let match = line.match(line_match_1);
                            // 检测 Vue 文件中的 `blameInfo` 格式
                            if (!match) {
                                match = line.match(line_match_2);
                            }

                            if (match) {
                                const commitHash = match[1];
                                let author = match[2];
                                // console.log(`Commit hash如下: ${commitHash}`); // 添加日志
                                if (commitHash === '00000000') {
                                    author = 'You';
                                }
                                // console.log(`Author如下: ${author}`); // 添加日志
                                const date = match[3].split(' ')[0];// 将日期格式转换为年/月/日
                                const blameText = `${date} ${author}`;
                                if (blameText.length > maxLength) {
                                    maxLength = blameText.length;
                                }
                            }
                        });

                        blameInfo.forEach((line) => {
                            // console.log(`Blame line如下: ${line}`); // 添加日志
                            let match = line.match(line_match_1);
                            // 检测 Vue 文件中的 `blameInfo` 格式
                            if (!match) {
                                match = line.match(line_match_2);
                            }
                            // console.log(`Match如下: ${match}`); // 添加日志
                            if (match) {
                                const commitHash = match[1];
                                let author = match[2];
                                if (commitHash === '00000000') {
                                    author = 'You';
                                }
                                const date = match[3].split(' ')[0];// 将日期格式转换为年/月/日
                                const lineNumber = parseInt(match[4], 10) - 1;
                                let blameText = `${date} ${author}`;

                                // 补齐长度
                                while (blameText.length < maxLength) {
                                    blameText += ' ';
                                }
                                const time = match[3].split(' ')[1];
                                //填充悬浮窗内容
                                const hoverMessage: string = HOVER_MESSAGE_TEMPLATE
                                    .replace('{hash}', commitHash)
                                    .replace('{time}', time);
                                if (commitHash !== '00000000') {
                                    const color = hashToHslColor(commitHash);
                                    // console.log(`Commit hash如下: ${commitHash}, color如下: ${color}`); // 添加日志
                                    const decoration = {
                                        range: new vscode.Range(lineNumber, 0, lineNumber, 0),
                                        hoverMessage: hoverMessage,
                                        renderOptions: {
                                            before: {
                                                contentText: ` ${blameText}`,
                                                color: 'rgb(0,0,0)', // 字体颜色
                                                backgroundColor: color, // 背景颜色
                                                fontStyle: 'normal',
                                                fontWeight: 'normal',
                                                margin: '0 1em 0 0',
                                                textDecoration: 'none',
                                                borderRadius: '3px 0 0 3px', // 添加圆角
                                                padding: '0 5px', // 添加内边距
                                                width: `${maxLength + 1}ch`, // 设置固定宽度
                                                display: 'inline-block', // 确保为块级元素
                                                cursor: 'block',
                                                borderWidth: '0 2px 0 0',
                                                borderStyle: 'solid',
                                                borderColor: 'rgb(220, 220, 220)',
                                            }
                                        }
                                    };
                                    decorations.push(decoration);
                                    // 存储行号与 commitHash 的对应关系
                                    lineToCommitHashMap.set(lineNumber, commitHash);
                                }
                            }
                        });

                        blameDecorationType = vscode.window.createTextEditorDecorationType({});
                        editor.setDecorations(blameDecorationType, decorations);

                        // 添加点击事件
                        selectionChangeListener = vscode.window.onDidChangeTextEditorSelection((e: vscode.TextEditorSelectionChangeEvent) => {
                            // 获取当前选择的文本范围
                            let selection = e.selections[0];
                            // 获取点击位置的字符
                            let position = selection.active;

                            const selectedLine = selection.start.line;
                            // 获取 commitHash 从映射中
                            const commitHash = lineToCommitHashMap.get(selectedLine);

                            // position.character === 0是为了实现：只能在commit 信息区域时才能跳转~~
                            if (commitHash && position.character === 0) {
                                console.log(`Selected commit hash: ${commitHash}`); // 添加日志
                                console.log(`Selected commit repoPath: ${workspaceFolder.uri.path}`); // 添加日志
                                // 打开 GIT->HISTORY 视图
                                const relativeFilePath = vscode.workspace.asRelativePath(filePath, false);
                                const folderPath = vscode.workspace.workspaceFolders![0].uri.path;
                                const locateFilePath = `${folderPath}/${relativeFilePath}`;
                                vscode.commands.executeCommand('git-history.history.focus').then(() => {
                                    // 调用 index.tsx 中的 diff 方法
                                    const args: string[] = [];
                                    args.push(commitHash);
                                    vscode.commands.executeCommand('git-history.history.triggerOnLocate', commitHash, locateFilePath);
                                }, (err) => {
                                    console.error(`Failed to open GIT->HISTORY view for commit hash: ${commitHash}`, err);
                                    vscode.window.showErrorMessage(`Failed to open GIT->HISTORY view for commit hash: ${commitHash}`);
                                });

                            }
                        });

                        // 监听文件切换，自动清理装饰器和事件
                        vscode.window.onDidChangeActiveTextEditor(() => {
                            if (blameDecorationType) {
                                blameDecorationType.dispose();
                            }
                            if (selectionChangeListener) {
                                selectionChangeListener.dispose();
                            }
                        });
                    });
                });
            }
        }
    });

    // 注册 Clear Annotate 命令
    let clearDisposable = vscode.commands.registerCommand('extension.clearAnnotations', () => {
        if (!isBlameActive) {
            vscode.window.showWarningMessage('No annotations to clear.');
            return;
        }

        isBlameActive = false;
        vscode.commands.executeCommand('setContext', 'blameActive', false);

        const editor = vscode.window.activeTextEditor;
        if (editor) {
            // 创建一个空的 TextEditorDecorationType 来清除所有装饰
            const emptyDecorationType = vscode.window.createTextEditorDecorationType({});
            editor.setDecorations(emptyDecorationType, []);  // 清除所有装饰
        }

        // 清理状态
        if (blameDecorationType) {
            blameDecorationType.dispose();
            blameDecorationType = undefined;
        }
        if (selectionChangeListener) {
            selectionChangeListener.dispose();
            selectionChangeListener = undefined;
        }

        // 清空映射
        lineToCommitHashMap.clear();
    });

    context.subscriptions.push(disposable);
    context.subscriptions.push(clearDisposable);
}

function hashToHslColor(commitHash: string): string {
    // 计算哈希值的简单哈希函数
    let hash = 0;
    for (let i = 0; i < commitHash.length; i++) {
        hash = commitHash.charCodeAt(i) + ((hash << 5) - hash);
        hash = hash & hash; // 转换为32位整数
    }

    // 使用黄金角步长确保色相均匀分布
    const step = 137.5; // 黄金角约为137.5度
    const hue = (Math.abs(hash) * step) % 360;
    const saturation = 70; // 饱和度固定为70%
    const lightness = 50;   // 亮度固定为50%
    const alpha = 0.5;      // 将透明度提高到0.5

    return `hsla(${hue.toFixed(2)}, ${saturation}%, ${lightness}%, ${alpha})`;
}

// function hashToColor(commitHash: string): string {
//     // 简单的哈希函数，将字符串转为数值
//     let hash = 0;
//     for (let i = 0; i < commitHash.length; i++) {
//         hash = commitHash.charCodeAt(i) + ((hash << 5) - hash);
//         hash = hash & hash; // Convert to 32bit integer
//     }

//     // 生成 RGB 颜色
//     let r = (Math.abs(hash) >> 16) & 0xFF;
//     let g = (Math.abs(hash) >> 8) & 0xFF;
//     let b = Math.abs(hash) & 0xFF;
//     //透明度，数字越小，透明度越高
//     const a = 0.2;

//     return `rgba(${r}, ${g}, ${b}, ${a})`;
// }

export function deactivate() { }
