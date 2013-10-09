// ==UserScript==
// @name         AutoCookieClicker
// @namespace    cookieclicker
// @include      http://orteil.dashnet.org/cookieclicker/
// @author       syaA
// @description  bake quadrillion cookie
// ==/UserScript==

(function (callback) {
  var script = document.createElement("script");
  script.setAttribute("src", "//code.jquery.com/jquery-2.0.0.min.js");
  script.addEventListener('load', function() {
    var script = document.createElement("script");
    script.textContent = "(" + callback.toString() + ")(jQuery.noConflict(true));";
    document.body.appendChild(script);
  }, false);
  document.body.appendChild(script);
})(function ($) {
  $(window).load(function(){

    // 無限に繰り返す.
    function forever(f, wait) {
      setTimeout(function(){
        f();
        forever(f, wait);
      }, wait);
      
    }

    // confirm 上書き ^^;
    window.confirm = function() {
      return true;
    }

    // Reset
    function reset() {
      if (!$("div a.option.warning:contains(Reset)").length) {
        // メニューを出す.
        $("#prefsButton")[0].click();
      }
      $("div a.option.warning:contains(Reset)")[0].click();
    }

    // Statics を見る.
    function viewStatistics() {
      if (!$("div.section:contains(Statistics)").length) {
        $("#statsButton")[0].click();
      }
    }

    // クッキーを 1 クリック.
    function clickBigCookie() {
      $("#bigCookie").click();
    }

    // ゴールデンクッキーを(あれば)クリック.
    function clickGoldenCookie() {
      if ($("#goldenCookie")[0].style.display != "none") {
        $("#goldenCookie")[0].click();
      }
    }

    // 建物を買う.
    // 0 Cursor
    // 1 Grandma
    // 2 Farm
    // 3 Factory
    // 4 Mine
    // 5 Shimpment
    // 6 Alchemy lab
    // 7 Portal
    // 8 Time machine
    // 9 Antimatter condenser
    function buyProduct(product) {
      $("#product"+product)[0].click();
    }

    // 建物の名前..
    function getProductName(product) {
      return ["Cursor", "Grandma", "Farm", "Factory", "Mine", "Shipment", "Alchemy lab", "Portal", "Time machine", "Antimatter condenser"][product];
    }

    // 建物の値段.
    function getProductPrice(product) {
      return Number($("#product" + product + " .content .price")[0].textContent.replace(/,/g, ""));
    }

    // 建物毎の生産量.
    function getProductCpsTotal(product) {
      var base = $("#rowInfoContent" + product);
      if (base.length) {
        var m = base[0].textContent.match(/([0-9,.]+) cookies per second/);
        if (m) {
          return Number(m[1].replace(/,/g, ""));
        } 
      }
      return 0;
    }

    // 建物の数.
    function getProductNum(product) {
      var base = $("#product" + product + " .content .owned");
      if (base.length) {
        return Number(base[0].textContent.replace(/,/g, ""));
      } else {
        return 0;
      }
    }

    // 建物の利福(アップグレードは考えない.).
    function getProductCps(product) {
      var total = getProductCpsTotal(product);
      if (total == 0) {
        // 一個目はデフォルト.
        return [0.1, 0.5, 2, 10, 40, 100, 400, 6666, 98765, 999999][product];
      }
      var num = getProductNum(product);
      return total / num
    }
    
    // アップグレードの数.
    function getUpgradeCount() {
      return $("#upgrades").children().length;
    }

    // アップグレードの名前
    function getUpgradeName(index) {
      m = decodeURIComponent($("#upgrades").children()[index].onmouseover).match(/<div class=\"name\">([^<]+)<\/div>/);
      if (m) {
        return m[1];
      } else {
        return "";
      }
    }

    // アップグレードの値段.
    function getUpgradePrice(index) {
      // ババァアポカリプスは厄介なので、とりあえずスルーする...
      // アラートのウィンドウをきちんと消さないと...
      m = decodeURIComponent($("#upgrades").children()[index].onmouseover).match(/One mind/);
      if (m) {
        return 9000000000000000;
      }
      m = decodeURIComponent($("#upgrades").children()[index].onmouseover).match(/<span class=\"price\">([0-9,]+)<\/span>/);
      if (m) {
        return Number(m[1].replace(/,/g, ""));
      } else {
        return 0;
      }
    }

    // アップグレードの利福.
    function getUpgradeCpsProduct(product, msg) {
      if (msg.match(/twice/)) {
        return getProductCpsTotal(product);
      }
      var m = msg.match(/<b>\+([0-9.,]+)<\/b> base CpS/);
      if (m) {
        return Number(m[1].replace(/,/g, "")) * getProductNum(product);
      }
      return 0;
    }
    function getUpgradeCps(index) {
      // メッセージを適当に解釈する.
      var base = decodeURIComponent($("#upgrades").children()[index].onmouseover).match(/<div class="description">(.+)<\/div>/);
      if (!base) {
        return 0;
      }
      var msg = base[1];
      if (msg.match(/^The mouse and cursors/)) {
        if (msg.match(/twice/)) {
          return getProductCpsTotal(0);
        }
        var cursorNum = getProductNum(0);
        var m = msg.match(/<b>\+([0-9.]+)<\/b> cookies for each non-cursor object owned/);
        if (m) {
          var nonCursorObjectNum = 0;
          for (var i=1; i<10; ++i) {
            nonCursorObjectNum += getProductNum(i);
          }
          return Number(m[1]) * cursorNum * nonCursorObjectNum;
        }
      } else if (msg.match(/^Clicking/)) {
        return getCurrentCookiePerSecond() * 0.1;
      } else if (msg.match(/^The mouse gains/)) {
        return 10 + getUpgradeCpsProduct(0, msg);
      } else if (msg.match(/^The mouse/)) {
        return getUpgradeCpsProduct(0, msg);
      } else if (msg.match(/^Grandmas/)) {
        return getUpgradeCpsProduct(1, msg);
      } else if (msg.match(/^Farms/)) {
        return getUpgradeCpsProduct(2, msg);
      } else if (msg.match(/^Factories/)) {
        return getUpgradeCpsProduct(3, msg);
      } else if (msg.match(/^Mines/)) {
        return getUpgradeCpsProduct(4, msg);
      } else if (msg.match(/^Shipments/)) {
        return getUpgradeCpsProduct(5, msg);
      } else if (msg.match(/^Alchemy labs/)) {
        return getUpgradeCpsProduct(6, msg);
      } else if (msg.match(/^Portals/)) {
        return getUpgradeCpsProduct(7, msg);
      } else if (msg.match(/^Time machines/)) {
        return getUpgradeCpsProduct(8, msg);
      } else if (msg.match(/^Antimatter condensers/)) {
        return getUpgradeCpsProduct(9, msg);
      } else if (msg.match(/^Golden cookies* /)) {
        // ゴールデンクッキー.
        // ベース 10 分に一個くらい出る気がする...
        // ここでは確実に得られる x7 の分のみ計算する.
        var ratio = 0;
        if (msg.match(/Oh hey/)) {
          // 一個目
          ratio =  6 * 77 / 600 - 6 * 77 / 1200;
        } else if (msg.match(/What joy!/)) {
          // 二個目
          ratio =  6 * 77 / 300 - 6 * 77 / 600;
        } else if (msg.match(/all night/)) {
          // 三個目
          ratio =  6 * 152 / 300 - 6 * 77 / 300;
        }
        return getCurrentCookiePerSecond() * ratio;
      } else if (msg.match(/^Grandma-operated/)) {
        // ババァ4倍
        return getProductCpsTotal(1) * 3;
      } else if (msg.match(/^\[Research\]/)) {
        // 未対応.
        return 0;
      } else if (msg.match(/^You gain/)) {
        // ミルク系は CPS が 1.5 倍になるとする.
        return getCurrentCookiePerSecond() * 0.5;
      } else if (msg.match(/^Cookie production multiplier/)) {
        var m = msg.match(/\+([0-9]+)%/);
        if (m) {
          return getBaseCPS() * Number(m[1]) / 100;
        }
      }
      
      console.log("[error] Can't parse upgrade message (%s).", msg)
      return 0;
    }

    // 取得済みのアップグレード数
    function getUpgradeEnabledCount() {
      $("div.listing > div.crate.upgrade.enabled").length
    }

    // アップグレードを取得しているかどうか?
    function hasUpgrade(name) {
      viewStatistics();
      var result = false;
      $("div.listing > div.crate.upgrade.enabled").each(function(index) {
        if (decodeURIComponent(this.onmouseover).match(name)) {
          result = true;
          return false;
        }
      });
      return result;
    }

    // アップグレード購入.
    function buyUpgrade(index) {
      $("#upgrades").children()[index].click()
    }

    // 現在の所持クッキー数.
    function getCurrentCookie() {
      m = $("#cookies")[0].textContent.match(/([0-9,]+)\s*cookies\s*per\s*second\s*:\s*([0-9.,]+)/);
      if (m) {
        return Number(m[1].replace(/,/g, ""));
      } else {
        return 0;
      }
    }

    // 現在の所持クッキー数.
    function getCurrentCookiePerSecond() {
      m = $("#cookies")[0].textContent.match(/([0-9,]+)\s*cookies\s*per\s*second\s*:\s*([0-9.,]+)/);
      if (m) {
        return parseFloat(m[2].replace(/,/g, ""));
      } else {
        return 0;
      }
    }

    // 現在の基本CPS.
    function getBaseCPS() {
      var baseCps = 0;
      for (var i=0; i<10; ++i) {
        baseCps += getProductCpsTotal(i);
      }
      return baseCps;
    }

    // 現在のゲームでの総クッキー数.
    function getBakedCookie() {
      viewStatistics();
      return Number($("div.listing:contains(baked (this game)) > div.price.plain")[0].textContent.replace(/,/g, ""));
    }
    
    // AI.
    function thinkStep() {
      var curCookie = getCurrentCookie();
      var curCps = getCurrentCookiePerSecond();
      console.log("[info] %d cookies. %.1f cps", curCookie, curCps);

      // 5000兆オーバーでリセットしてみる.
      if (getBakedCookie() > 5000000000000000) {
        console.log("[info] Reset!!!");
        reset();
      }

      // n 秒後の cookie 数を最大化する建物かアップグレードを買う.
      var limit = 300; // ^^;
      var mostEff = 9007199254740992;
      var isUpgrade = false;
      // 建物.
      var prodCand = 0;
      for (var i=0; i<10; ++i) {
        var eff = 0;
        if (getProductPrice(i) <= curCookie) {
          eff = getProductPrice(i) / getProductCps(i);
//          console.log("a:product(%d), %d", i, eff)
        } else {
          eff = getProductPrice(i) / getProductCps(i) + (getProductPrice(i) - curCookie) / curCps;
//          console.log("b:product(%d), %d", i, eff)
        }
        if (mostEff > eff) {
          mostEff = eff;
          prodCand = i;
        }
      }
      // アップグレード.
      var upgradeCnt = getUpgradeCount();
      var upgradeCand = -1;
      for (var i=0; i<upgradeCnt; ++i) {
        var eff = 0;
        if (getUpgradePrice(i) <= curCookie) {
          eff = getUpgradePrice(i) / getUpgradeCps(i);
//          console.log("a:upgrade(%d), %d", i, eff)
        } else {
          eff = getUpgradePrice(i) / getUpgradeCps(i) + (getUpgradePrice(i) - curCookie) / curCps;
//          console.log("b:upgrade(%d), %d", i, eff)
        }
        if (mostEff > eff) {
          mostEff = eff;
          upgradeCand = i;
          isUpgrade = true;
        }
      }

      // 貯蓄に回るかどうか.
      var ratio0 = 0; // cps * 12,000 だけ溜めた時に、一割クッキーで得られる 推定 cps
      var ratio1 = 0; // cps * 84,000 だけ溜めた時の、x7 倍中に一割クッキーで得られる 推定 cps
      if (hasUpgrade(/Get lucky/)) {
        // ゴールデンクッキーのアップグレード 3 つ目まで取れている.
        ratio0 = 4;
        ratio1 = 2170.56;
      } else if (hasUpgrade(/Serendipity/)) {
        // ゴールデンクッキーのアップグレード 2 つ目まで取れている.
        ratio0 = 4;
        ratio1 = 560.56;
      } else if (hasUpgrade(/Lucky day/)) {
        // ゴールデンクッキーのアップグレード 1 つ目まで取れている.
        ratio0 = 2;
        ratio1 = 140.14;
      } else {
        // ゴールデンクッキーのアップグレード なし.
        ratio0 = 1;
        ratio1 = 35.035;
      }
      // 貯蓄の効果を計算して比較.
      var isSave = false;
      var limit = 0;
      if (12000 * curCps <= curCookie) {
        isSave = true;
        console.log("a:saving(%d), %d", 12000, eff);
        limit = 12000 * curCps;
      } else {
        var eff = 12000 / ratio1 + 12000 - curCookie / curCps;
        console.log("b:saving(%d), %d", 12000, eff);
        if (mostEff > eff) {
          limit = 12000 * curCps;
          isSave = true;
        }
      }
      if (84000 * curCps <= curCookie) {
        isSave = true;
        console.log("a:saving(%d), %d", 84000, eff);
        limit = 84000 * curCps;
      } else {
        var eff = 84000 / ratio1 + 84000 - curCookie / curCps;
        console.log("b:saving(%d), %d", 84000, eff);
        if (mostEff > eff) {
          limit = 84000 * curCps;
          isSave = true;
        }
      }

      // 貯蓄する?
      if (isSave) {
        // 購入によって制限を下回るようなら保留する.
        console.log("[info] now saving...(%d)", limit);
        if (isUpgrade) {
          if ((curCookie - getUpgradePrice(upgradeCand)) < limit) {
            console.log("[info] Choose upgrade [%s](%d cookies, %d cps)",
                        getUpgradeName(upgradeCand), getUpgradePrice(upgradeCand), getUpgradeCps(upgradeCand));
            return;
          }
        } else {
          if ((curCookie - getProductPrice(prodCand)) < limit) {
            console.log("[info] Choose product [%s](%d cookies, %d cps)",
                        getProductName(prodCand), getProductPrice(prodCand), getProductCps(prodCand));
            return;
          }
        }
      }

      if (isUpgrade) {
        console.log("[info] Choose upgrade [%s](%d cookies, %d cps)",
                    getUpgradeName(upgradeCand), getUpgradePrice(upgradeCand), getUpgradeCps(upgradeCand));
        if (curCookie >= getUpgradePrice(upgradeCand)) {
          console.log("[buy] Upgrade \"%s\"", getUpgradeName(upgradeCand));
          buyUpgrade(upgradeCand);
        }
      } else {
        console.log("[info] Choose product [%s](%d cookies, %d cps)",
                    getProductName(prodCand), getProductPrice(prodCand), getProductCps(prodCand));
        if (curCookie >= getProductPrice(prodCand)) {
          console.log("[buy] Product \"%s\"", getProductName(prodCand));
          buyProduct(prodCand);
        }
      }
    }

    forever(clickBigCookie, 100);
    forever(clickGoldenCookie, 100);
    forever(thinkStep, 3000);
  })
});

