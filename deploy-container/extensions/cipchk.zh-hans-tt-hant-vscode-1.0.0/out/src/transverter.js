"use strict";
/**
 * 来自：https://github.com/mumuy/chinese-transverter
 */
Object.defineProperty(exports, "__esModule", { value: true });
const dict_1 = require("./dict");
function transverter(str, options) {
    options = Object.assign({
        type: 'simplified',
        language: '',
    }, options);
    let source, target, result = '', hash = {};
    if (options.type == 'traditional') {
        source = dict_1.DICT.simplified_chinese;
        target = dict_1.DICT.traditional_chinese;
        for (const i in dict_1.DICT.words) {
            //固定词替换
            str = str.replace(i, dict_1.DICT.words[i]);
        }
        if (options.language === 'zh_TW') {
            //惯用词替换：简->繁
            for (const i in dict_1.DICT.zh_TW) {
                if (str.indexOf(i) > -1) {
                    str = str.replace(new RegExp(i, 'g'), dict_1.DICT.zh_TW[i]);
                }
            }
        }
    }
    else {
        source = dict_1.DICT.traditional_chinese;
        target = dict_1.DICT.simplified_chinese;
        for (const i in dict_1.DICT.words) {
            //固定词替换
            if (str.indexOf(dict_1.DICT.words[i]) > -1) {
                str = str.replace(new RegExp(dict_1.DICT.words[i], 'g'), i);
            }
        }
        for (const i in dict_1.DICT.toSimplified) {
            //单向替换：繁->简
            if (str.indexOf(i) > -1) {
                str = str.replace(new RegExp(i, 'g'), dict_1.DICT.toSimplified[i]);
            }
        }
    }
    for (let i = 0, len = str.length; i < len; i++) {
        let noReplace = false;
        let c = str[i];
        for (let j = 0; j < dict_1.DICT.exception.length; j++) {
            let index = str.indexOf(dict_1.DICT.exception[j]);
            if (i >= index && i < index + dict_1.DICT.exception[j].length - 1) {
                c = dict_1.DICT.exception[j];
                noReplace = true;
                break;
            }
        }
        if (!noReplace) {
            if (hash[c]) {
                c = hash[c];
            }
            else {
                let index = source.indexOf(c);
                if (index > -1) {
                    c = hash[c] = target[index];
                }
            }
        }
        result += c;
        i += c.length - 1;
    }
    if (options.type == 'simplified') {
        if (options.language == 'zh_TW') {
            //惯用词替换：繁->简
            for (let i in dict_1.DICT.zh_TW) {
                if (result.indexOf(dict_1.DICT.zh_TW[i]) > -1) {
                    result = result.replace(new RegExp(dict_1.DICT.zh_TW[i], 'g'), i);
                }
            }
        }
    }
    return result;
}
exports.transverter = transverter;
//# sourceMappingURL=transverter.js.map