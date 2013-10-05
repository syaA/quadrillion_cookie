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
      try {
        f();
      } catch (e) {
      }
      setTimeout(function(){
        forever(f, wait);
      }, wait);
      
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

    // 建物の利福(アップグレードは考えない.).
    function getProductCps(product) {
      return [0.1, 0.5, 2, 10, 40, 100, 400, 6666, 98765, 999999][product]
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

    // AI.
    function thinkStep() {
      var curCookie = getCurrentCookie();
      var curCps = getCurrentCookiePerSecond();

      // n 秒後の cps を最大化する建物を買う.
      var limit = 60;
      var most_eff = 0;
      var prodCand = 0;
      for (var i=0; i<10; ++i) {
        var eff = 0;
        if (getProductPrice(i) <= curCookie) {
          eff = curCookie - getProductPrice(i) + (curCps + getProductCps(i)) * limit;
        } else {
          eff = (limit - (getProductPrice(i) - curCookie) / curCps) * (curCps + getProductCps(i));
        }
        if (eff > most_eff) {
          eff = most_eff;
          prodCand = i;
        }
      }
      // 一番安いアップグレードを調べておく.
      var upgradeCnt = getUpgradeCount();
      var minUpgradePrice = 900000000000000;
      var upgradeCand = -1;
      for (var i=0; i<upgradeCnt; ++i) {
        if (getUpgradePrice(i) <= minUpgradePrice) {
          minUpgradePrice = getUpgradePrice(i);
          upgradeCand = i;
        }
      }

      console.log("[info] Most effective product [%s], %d", getProductName(prodCand), getProductPrice(prodCand));
      if (upgradeCnt > 0) {
        console.log("[info] Most effective upgrade [%s], %d", getUpgradeName(upgradeCand), minUpgradePrice);
      }
      
      // アップグレードを優遇する.
      // アップグレードの最低価格が、建物の倍より安いならアップグレードを買う.
      var upgradeRatio = 1.5;
      if (minUpgradePrice < (getProductPrice(prodCand) * upgradeRatio)) {
        console.log("[info] Choose upgrade [%s]", getUpgradeName(upgradeCand));
        if (curCookie >= minUpgradePrice) {
          console.log("[info] %d cookies. %d cps", getCurrentCookie(), getCurrentCookiePerSecond());
          console.log("[buy] Upgrade \"%s\"", getUpgradeName(upgradeCand));
          buyUpgrade(upgradeCand);
        }
      } else {
        console.log("[info] Choose product [%s]", getProductName(prodCand));
        if (curCookie >= getProductPrice(prodCand)) {
          console.log("[info] %d cookies. %d cps", getCurrentCookie(), getCurrentCookiePerSecond());
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

