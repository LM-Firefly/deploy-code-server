"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setConfig = exports.getConfig = exports.getConfigFile = exports.set = exports.get = void 0;
const fs = require("fs");
const util_1 = require("util");
const vscode_1 = require("vscode");
const store_1 = require("./store");
function get(path, key) {
    const ConfPath = path + '.config.json';
    const isExists = fs.existsSync(ConfPath);
    let setting;
    if (isExists) {
        setting = JSON.parse(fs.readFileSync(ConfPath, 'utf-8'));
    }
    else {
        return false;
    }
    return setting[key];
}
exports.get = get;
function set(path, key, value) {
    const newPath = path + '.config.json';
    const isExists = fs.existsSync(newPath);
    let setting;
    if (isExists) {
        setting = JSON.parse(fs.readFileSync(newPath, 'utf-8'));
    }
    else {
        setting = {};
    }
    setting[key] = value.toString();
    fs.writeFileSync(newPath, JSON.stringify(setting));
}
exports.set = set;
/* utf.js - UTF-8 <=> UTF-16 convertion
 *
 * Copyright (C) 1999 Masanao Izumo <iz@onicos.co.jp>
 * Version: 1.0
 * LastModified: Dec 25 1999
 * This library is free.  You can redistribute it and/or modify it.
 */
function Utf8ArrayToStr(array) {
    let out, i, c;
    let char2, char3;
    out = "";
    const len = array.length;
    i = 0;
    while (i < len) {
        c = array[i++];
        switch (c >> 4) {
            case 0:
            case 1:
            case 2:
            case 3:
            case 4:
            case 5:
            case 6:
            case 7:
                // 0xxxxxxx
                out += String.fromCharCode(c);
                break;
            case 12:
            case 13:
                // 110x xxxx   10xx xxxx
                char2 = array[i++];
                out += String.fromCharCode(((c & 0x1F) << 6) | (char2 & 0x3F));
                break;
            case 14:
                // 1110 xxxx  10xx xxxx  10xx xxxx
                char2 = array[i++];
                char3 = array[i++];
                out += String.fromCharCode(((c & 0x0F) << 12) |
                    ((char2 & 0x3F) << 6) |
                    ((char3 & 0x3F) << 0));
                break;
        }
    }
    return out;
}
function getConfigFile(path) {
    return vscode_1.Uri.joinPath(store_1.store.globalStorageUri, path + '.config.json');
}
exports.getConfigFile = getConfigFile;
function getConfig(path, defaultVal = false) {
    return new Promise((resolve, reject) => {
        vscode_1.workspace.fs.readFile(vscode_1.Uri.joinPath(store_1.store.globalStorageUri, path + '.config.json')).then((data) => {
            const dataString = Utf8ArrayToStr(data);
            try {
                const json = JSON.parse(dataString);
                resolve(json);
            }
            catch (error) {
                resolve(defaultVal);
            }
        }, () => {
            resolve(defaultVal);
        });
    });
}
exports.getConfig = getConfig;
function setConfig(path, value) {
    return new Promise((resolve, reject) => {
        const encoder = new util_1.TextEncoder();
        vscode_1.workspace.fs.writeFile(vscode_1.Uri.joinPath(store_1.store.globalStorageUri, path + '.config.json'), encoder.encode(JSON.stringify(value))).then(() => {
            resolve(true);
        }, () => {
            resolve(false);
        });
    });
}
exports.setConfig = setConfig;
//# sourceMappingURL=config.js.map