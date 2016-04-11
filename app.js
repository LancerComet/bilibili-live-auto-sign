/*
 *  Bilibili Live Auto Sign By LancerComet at 16:33, 2016.03.31.
 *  # Carry Your World #
 */

const superAgent = require("superagent");
const fs = require("fs");
const process = require("process");

const appConfig = {
    baseUrl: "http://live.bilibili.com"
};

var interval;

main();

/* Definition goes below. */

// Definition: 程序入口函数. 
function main () {
    readCookieInfo();
}

// Definition: 获取签到状态.
function getSignStatus (cookie, accountName) {
    return new Promise((resolve, reject) => {
        superAgent
            .get(appConfig.baseUrl + "/sign/GetSignInfo")
            .set("Cookie", cookie)
            .end((err, res) => {
                if (err) {
                    throw new Error("账号 \"" + accountName + "\" 获取签到信息失败: " + err);
                }
                var result = JSON.parse(res.text);
                parseInt(result.data.status, 10) === 0 ? resolve() : reject();
            });
    });
}

// Definition: 签到函数.
function signExec (cookie, accountName) {
    superAgent
        .get(appConfig.baseUrl + "/sign/doSign")
        .set("Cookie", cookie)
        .end((err, res) => {
            if (err) {
                throw new Error("账号 \"" + accountName + "\" 签到失败: " + err);
            }
            var result = JSON.parse(res.text);
            if (result.code !== 0) {
                console.log("账号 \"" + accountName + "\" 签到失败: " + result.msg);
                return;
            }
            console.log("账号 \"" + accountName + "\" 签到成功！");
            console.log("已连续签到 " + result.data.hadSignDays + " 天");
            console.log("签到获得：" + result.data.text + "\n");
            alreadySigned(accountName);
        });
}

// Definition: 已经签到.
function alreadySigned (accountName) {
    // 二十四小时后执行.
    console.log("账号 \"" + accountName + "\" 已签到, 将在 24 小时后再次签到.\n");
    clearTimeout(interval);
    interval = setTimeout(main, 1000 * 60 * 60 * 24);
}

// Definition: 获取 Cookie.
function readCookieInfo () {
    // 从运行参数获取制定账号的 Cookie.
    // node app lancercomet.txt
    console.log("\n\n新的一天\n--------")
    const accountList = fs.readdirSync("./cookies/");
    accountList.forEach((value, index, array) => {
        const cookie = fs.readFileSync("./cookies/" + value);
        const accountName = value.substr(0, value.length - 4);
        getSignStatus(cookie, accountName).then(signExec.bind(null, cookie, accountName), alreadySigned.bind(null, accountName));    
    });       
}


