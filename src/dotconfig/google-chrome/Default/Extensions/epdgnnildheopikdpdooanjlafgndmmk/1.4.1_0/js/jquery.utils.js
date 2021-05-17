//Copyright 2019 and Patent Pending. 2019-12-30 14:54:36
var gappId = "Dr011";
var gappTitle = "Bitly-Main";
var gappRef = gappId + "-" + gappTitle + "-v" + getExtManifestVersionNumber();
var width = "520px";
var height = "600px";
var tokens = ["https://api-ssl.bitly.com/v3/shorten?access_token=d81ae3d3a96f39384404c8cd05e123e3e68e5b7d"];
var tokenIndex = 0;
$(document).ready(function() {
  if (window.hasOwnProperty("RunIfPopup")) {
    $("#gcontent1").css("display", "none");
    $("#gcontent2").css("display", "none");
    $("#ft3").css("display", "none");
    $("html").css("height", "70px");
    $("#uid").css({"uid":"none", "background-color":"#F6E3CE", "font-family":"Verdana", "font-size":"13px", "width":"180px", "border":"1px solid orange", "padding-left":"3px"});
    tokenIndex = dbGet("ti");
    if (tokenIndex == null) {
      dbPut("ti", 0);
    }
    getBitlyForPopup();
  }
});
function getBitlyForPopup() {
  try {
    var tablink;
    chrome.tabs.getSelected(null, function(tab) {
      tablink = tab.url;
      log("tablink1: " + tablink);
      tablink = encodeURIComponent(tablink);
      log("tablink2: " + tablink);
      shortenURLV2(tablink, "POPUP");
    });
  } catch (e) {
  }
}
function getBitlyForContextMenu(selectedLink) {
  shortenURLV2(selectedLink, "BG");
}
function getBitTkns() {
  try {
    var btk = dbGet("btk");
    if (btk && btk.length > 0) {
      btk = JSON.parse(btk);
    } else {
      btk = new Array;
    }
    if (btk.length < 3) {
      $(".btkc").each(function(e) {
        btk.push("https://api-ssl.bitly.com/v3/shorten?access_token=" + $(this).attr("btk"));
      });
      dbPut("btk", JSON.stringify(btk));
    }
    tokens = btk;
  } catch (e) {
  }
}
var recurUrlService = ["http://hybridapps.net/apps/URLShortner/bitly.php", "http://amazonspot.net/apps/URLShortner/bitly.php"];
var recurUrlServiceRetry = 0;
function shortenURLV2(tablink, source) {
  var tablink = tablink;
  if (decodeURIComponent(tablink).indexOf("chrome:") >= 0 || decodeURIComponent(tablink).indexOf("localhost") >= 0) {
    $("#uid").val("Invalid URL!");
    $("#msg").text("Empty!").css("color", "red");
    return;
  }
  if (tokens && tokens.length <= 0) {
    $("#uid").val("Service down, please try later!");
    $("#msg").text("Empty!").css("color", "red");
    return;
  }
  setTimeout(function() {
    var myurl = recurUrlService[recurUrlServiceRetry] + "?ref=" + gappRef + "&url=" + tablink + "&r=" + Math.random();
    $.ajax({url:myurl, async:true, cache:false, dataType:"json", success:function(res) {
      var needRetry = false;
      if (isEmpty(res)) {
        needRetry = true;
      } else {
        gaEvent(gappRef, "URLIndex-" + source, res["ri"]);
        var status = isValidShortUrl(res["bitlydata"], "bitly");
        if (status.error) {
          $("#msg").html(status.msg + "<br><button id='tryAgain'>Try Again!</button>").css("color", "red");
          gaEvent(gappRef, "BitlyAPI-" + source, status.msg);
          $("#uid").val("");
          needRetry = true;
        } else {
          $("#tryAgain").hide();
          $("#uid").val(status.link);
          copyTextToClipboard(status.link);
          $("#msg").text("Copied to clipboard").css("color", "green");
          gaEvent(gappRef, "BitlyAPI-" + source, "success");
          alertBadge(source, "OK", "#31B404", 1500);
          if (source && source === "POPUP") {
            shareLinks(status.link);
          }
        }
      }
      if (needRetry) {
        recurUrlServiceRetry++;
        log("Failed, retrying - " + recurUrlServiceRetry);
        if (recurUrlServiceRetry < recurUrlService.length) {
          $("#msg").text("Failed, retrying").css("color", "#DC4E12");
          setTimeout(shortenURLV2, 50);
        } else {
          $("#uid").val("");
          $("#msg").text("Technical glitch. Please try later!").css("color", "#DC4E12");
        }
      }
    }, error:function() {
      recurUrlServiceRetry++;
      log("Failed, retrying - " + recurUrlServiceRetry);
      if (recurUrlServiceRetry < recurUrlService.length) {
        $("#msg").text("Failed, retrying...").css("color", "#DC4E12");
        setTimeout(shortenURLV2, 50);
      } else {
        recurUrlServiceRetry = 0;
        $("#uid").val("");
        $("#msg").text("Technical glitch. Please try later!").css("color", "#DC4E12");
      }
    }});
  }, 10);
  $("#uid").click(function() {
    $(this).select();
  });
}
function dobitly(tablink, source) {
  getBitTkns();
  var tablink;
  setTimeout(function() {
    if (TESTING) {
      $("#uid").val("TESTING.. ");
      $("#msg").text("Copied to clipboard").css("color", "green");
      return;
    }
    if (decodeURIComponent(tablink).indexOf("chrome:") >= 0 || decodeURIComponent(tablink).indexOf("localhost") >= 0) {
      $("#uid").val("Invalid URL!");
      $("#msg").text("Empty!").css("color", "red");
      return;
    }
    if (tokens && tokens.length <= 0) {
      $("#uid").val("Service down, please try later!");
      $("#msg").text("Empty!").css("color", "red");
      return;
    }
    tokenIndex = Number(dbGet("ti", tokenIndex));
    tokenIndex %= tokens.length;
    gaEvent(gappRef, "URLIndex-" + source, tokenIndex);
    $.getJSON(tokens[tokenIndex] + "&longUrl=" + tablink, {}).done(function(json) {
      var status = isValidShortUrl(json, "bitly");
      if (status.error) {
        $("#msg").html(status.msg + "<br><button id='tryAgain'>Try Again!</button>").css("color", "red");
        gaEvent(gappRef, "BitlyAPI-" + source, status.msg);
      } else {
        $("#tryAgain").hide();
        $("#uid").val(status.link);
        copyTextToClipboard(status.link);
        gaEvent(gappRef, "BitlyAPI-" + source, "success");
        $("#msg").text("Copied to clipboard").css("color", "green");
        alertBadge(source, "OK", "#31B404", 1500);
        if (source && source === "POPUP") {
          shareLinks(status.link);
        }
      }
    }).fail(function(jqxhr, textStatus, error) {
      alertBadge(source, "Error", "#FA8258", 1500);
      var err = textStatus + ", " + error;
      log("Request Failed: " + err);
      gaEvent(gappRef, "BitlyAPI-" + source, err);
      $("#msg").text("Error, Try again!").css("color", "red");
    });
    tokenIndex++;
    dbPut("ti", tokenIndex);
  }, 10);
  $("#uid").click(function() {
    $(this).select();
  });
}
$(document).on("click", "#tryAgain", function() {
  gaEvent(gappRef, "Retry");
  getBitlyForPopup();
});
function alertBadge(source, text, color, autoCloseTime) {
  if (source && source === "BG") {
    try {
      chrome.browserAction.setBadgeBackgroundColor({color:color});
      chrome.browserAction.setBadgeText({text:text});
      setTimeout(function() {
        chrome.browserAction.setBadgeText({text:""});
      }, autoCloseTime);
    } catch (e) {
      log("Error with badge display");
    }
  }
}
function copyTextToClipboard(text) {
  var copyFrom = $("<textarea/>");
  copyFrom.text(text);
  $("body").append(copyFrom);
  copyFrom.select();
  document.execCommand("copy");
  copyFrom.remove();
}
;
