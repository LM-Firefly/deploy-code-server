"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const got_1 = require("got");
const tough = require("tough-cookie");
const hpagent_1 = require("hpagent");
const workspaceConfiguration_1 = require("./workspaceConfiguration");
const notification_1 = require("../utils/notification");
class Requset {
    constructor() {
        this.cookieJar = new tough.CookieJar();
        // this.setAgent('http://127.0.0.1:8888');
        this.reLoadCookie();
    }
    setAgent(proxy) {
        this.agent = {
            http: new hpagent_1.HttpProxyAgent({
                proxy
            }),
            https: new hpagent_1.HttpsProxyAgent({
                proxy
            })
        };
    }
    reLoadCookie() {
        this.cookieJar.removeAllCookiesSync();
        const cookies = workspaceConfiguration_1.default().get('cookies', []);
        if (typeof cookies === 'object') {
            cookies.forEach((cookie) => {
                cookie.cookie
                    .split(';')
                    .map((e) => tough.Cookie.parse(e))
                    .forEach((e) => {
                    e && this.cookieJar.setCookieSync(e, cookie.url);
                });
            });
        }
    }
    send(options) {
        return __awaiter(this, void 0, void 0, function* () {
            const requestOptions = typeof options === 'string'
                ? {
                    url: options
                }
                : options;
            const res = yield got_1.default(Object.assign(Object.assign({}, requestOptions), { cookieJar: this.cookieJar, agent: this.agent })).catch((e) => {
                notification_1.showWarningMessage('网络错误: ' + e.message);
                throw e;
            });
            return res;
        });
    }
}
exports.default = new Requset();
//# sourceMappingURL=request.js.map