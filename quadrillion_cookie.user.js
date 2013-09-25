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
  $(function() {

    // クッキーを 1 クリック.
    function clickBigCookie() {
      $("#bigCookie").click();
    }

    // 指定時間(ms)毎にクッキーをクリック.
    function clickBigCookieForever(wait) {
      clickBigCookie();
      setTimeout(function(){
        clickBigCookieForever(wait);
      }, wait);
    }

    // ゴールデンクッキーを(あれば)クリック.
    function clickGoldenCookie() {
      if ($("#goldenCookie")[0].style.display != "none") {
        $("#goldenCookie")[0].click();
      }
    }

    // 指定時間(ms)毎にクッキーをクリック.
    function clickGoldenCookieForever(wait) {
      clickGoldenCookie();
      setTimeout(function() { clickGoldenCookieForever(wait); }, wait);
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

    // アップグレードの値段.
    function getUpgradePrice(index) {
      // ババァアポカリプスは厄介なので、とりあえずスルーする...
      // アラートのウィンドウをきちんと消さないと...
      m = decodeURIComponent($("#upgrades").children()[0].onmouseover).match(/One mind/);
      if (m) {
        return null
      }
      m = decodeURIComponent($("#upgrades").children()[0].onmouseover).match(/<span class=\"price\">([0-9,]+)<\/span>/);
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
      // 基本方針： 買えるものの中で、増加 Cps / 値段が一番高いものを選ぶ
      // アップグレードは増加 Cps の計算が大変なので、倍になるものとしちゃう.
      var upgradeCnt = getUpgradeCount();
      var minUpgradePrice = 90000000000;
      var buyUpgradeIndex = 0;
      var maxUpgradeRatio = 0;
      for (var i=0; i<upgradeCnt; ++i) {
        if (minUpgradePrice > getUpgradePrice(i)) {
          minUpgradePrice = getUpgradePrice(i);
        }
        if (getUpgradePrice(i) > curCookie) {
          continue;
        }
        var ratio = curCps / getUpgradePrice(i);
        if (ratio > maxUpgradeRatio) {
          maxUpgradeRatio = ratio;
          buyUpgradeIndex = i;
        }
      }

      var buyProductPrice = 0;
      var buyProductIndex = 0;
      var maxProductRatio = 0;
      for (var i=0; i<10; ++i) {
        if (getProductPrice(i) > curCookie) {
          continue;
        }
        var ratio = getProductCps(i) / getProductPrice(i);
        if (ratio > maxProductRatio) {
          maxProductRatio = ratio;
          buyProductIndex = i;
          buyProductPrice = getProductPrice(i);
        }
      }

      // アップグレードを優遇する.
      // アップグレードの最低価格が、買おうとする建物より安いなら、アップグレードを買う.
      minUpgradePrice /= 2; // アップグレードを優遇する.
      if (buyProductPrice > minUpgradePrice) {
        buyUpgrade(buyUpgradeIndex);
      } else {
        buyProduct(buyProductIndex);
      }
    }

    function think(wait) {
      thinkStep();
      setTimeout(function() { think(wait); }, wait);
    }
    
    clickGoldenCookieForever(100);
    clickBigCookieForever(10);
    think(500);
  })
});

