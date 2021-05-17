//Copyright 2019 and Patent Pending. 2019-12-30 14:54:36
var recurRulesMsgURLs = ["https://dsnetx.web.app/apps/ext/msg/msg.json", "https://dsnet.bitbucket.io/apps/ext/msg/msg.json"];
var anyMsgSent = false;
var msgTimeStart = 7, msgTimeEnd = 22;
$(document).ready(function() {
  checkAppMessages();
});
var recurRulesMsgRetry = 0;
function checkAppMessages() {
  var msgs;
  log("Loading messages...");
  var myurl = recurRulesMsgURLs[recurRulesMsgRetry] + "?ref=" + gappRef + "&r=" + Math.random();
  $.ajax({url:myurl, async:true, cache:false, dataType:"json", success:function(res) {
    gaEvent(gappRef, "Notif", "Loaded");
    msgs = res;
    if (isEmpty(msgs)) {
      recurRulesMsgRetry++;
      log("Failed, retrying - " + recurRulesMsgRetry);
      if (recurRulesMsgRetry < recurRulesMsgURLs.length) {
        setTimeout(checkAppMessages, 100);
      }
    } else {
      recurRulesMsgRetry = 0;
      processMessages(msgs);
    }
  }, error:function() {
    recurRulesMsgRetry++;
    log("Failed, retrying - " + recurRulesMsgRetry);
    if (recurRulesMsgRetry < recurRulesMsgURLs.length) {
      setTimeout(checkAppMessages, 100);
    } else {
      recurRulesMsgRetry = 0;
    }
  }});
}
function processMessages(msgs) {
  var allAppMsges = [], thisAppMsg, globalAppMsg;
  var myAppId = getAppExtID();
  var isThisExcluded = false;
  thisAppMsg = globalAppMsg = null;
  try {
    var excludeIds = msgs["global"]["exclude"];
    for (var i = 0; i < excludeIds.length; i++) {
      try {
        if (excludeIds[i] === myAppId) {
          isThisExcluded = true;
          break;
        }
      } catch (err) {
        log(err.message);
      }
    }
    if (!isThisExcluded) {
      try {
        globalAppMsg = msgs["global"];
      } catch (error0) {
        log(error0.message);
      }
    }
    var appMsgs = msgs["private"];
    for (var i = 0; i < appMsgs.length; i++) {
      try {
        var appIds = appMsgs[i]["ids"];
        for (var j = 0; j < appIds.length; j++) {
          try {
            if (isValidExtVersion(appIds[j])) {
              if (appMsgs[i] && appMsgs[i].hasOwnProperty("begin") && Number(appMsgs[i]["begin"]) > Number(dateInYyMmDd())) {
                continue;
              }
              if (appMsgs[i] && appMsgs[i].hasOwnProperty("expire") && Number(appMsgs[i]["expire"]) < Number(dateInYyMmDd())) {
                continue;
              }
              thisAppMsg = appMsgs[i];
              allAppMsges.push(thisAppMsg);
            }
          } catch (e) {
          }
        }
      } catch (error1) {
        log(error1.message);
      }
    }
  } catch (error2) {
    gaEvent(gappRef, "Notif", "ProcessMessageError");
    log(error2.message);
  }
  for (var i = 0; i < allAppMsges.length; i++) {
    postMessages(allAppMsges[i]);
  }
  if (globalAppMsg) {
    if (globalAppMsg.show) {
      setTimeout(function() {
        postMessages(globalAppMsg);
        anyMsgSent = false;
      }, anyMsgSent ? 2000 : 10);
    }
  }
}
function postMessages(appMsg) {
  if (appMsg && (appMsg["show"] === true || appMsg["show"] === "true")) {
    var currentHour = (new Date).getHours();
    if (currentHour >= msgTimeStart && currentHour <= msgTimeEnd || TESTING) {
      var notifySelector = "#msgBox";
      if (appMsg["repeat"] === true) {
        if (appMsg.hasOwnProperty("repeatXHours")) {
          if (isValidRepeatFrequency(appMsg)) {
            finalNotification(appMsg, notifySelector);
          }
          return;
        } else {
          finalNotification(appMsg, notifySelector);
          return;
        }
      }
      var lastmsgid = dbGet("lastmsgid");
      if (lastmsgid === null || lastmsgid.indexOf(appMsg["msgid"]) < 0) {
        finalNotification(appMsg, notifySelector);
        dbAppend("lastmsgid", appMsg["msgid"]);
        if (lastmsgid && lastmsgid.length > 300) {
          dbPut("lastmsgid", appMsg["msgid"]);
        }
      } else {
        log("** Either invalid message or already notified");
      }
    }
  }
}
function isValidRepeatFrequency(appMsg) {
  try {
    if (TESTING) {
      return true;
    }
    var msgId = Number(appMsg["msgid"]);
    var repeatXHrs = Number(appMsg["repeatXHours"]);
    if (repeatXHrs === 0) {
      return false;
    }
    var repeatStore = dbGet("repeatStore");
    var curTime = (new Date).getTime();
    if (!isEmpty(repeatStore)) {
      repeatStore = JSON.parse(repeatStore);
    } else {
      repeatStore = {};
      repeatStore[msgId] = {last:curTime};
      dbPut("repeatStore", JSON.stringify(repeatStore));
      return true;
    }
    var msgRepeatObj = repeatStore[msgId];
    if (msgRepeatObj) {
      var msgLastTime = Number(msgRepeatObj.last);
      var minDiff = getTimeDiffInMinutes(msgLastTime);
      if (minDiff < repeatXHrs * 60) {
        return false;
      }
      repeatStore[msgId].last = curTime;
      dbPut("repeatStore", JSON.stringify(repeatStore));
      return true;
    } else {
      if (Object.keys(repeatStore).length > 50) {
        repeatStore = {};
      }
      repeatStore[msgId] = {last:curTime};
      dbPut("repeatStore", JSON.stringify(repeatStore));
      return true;
    }
  } catch (e) {
  }
  return status;
}
function getAppExtID() {
  var appid = TESTING ? "DrNNAAA" : gappId;
  return appid;
}
function escapeRegExp(string) {
  return string.replace(/([.*+?^=!:${}()|\[\]\/\\])/g, "\\$1");
}
function replaceAll(string, find, replace) {
  return string.replace(new RegExp(escapeRegExp(find), "g"), replace);
}
function finalNotification(appMsg, elementSelector) {
  var typeNotif = !isEmpty(appMsg) && appMsg.hasOwnProperty("typeNotif") ? appMsg.typeNotif : "WEBUI";
  if (typeNotif === "NATIVE") {
    if (typeof finalNotificationNative === "function") {
      finalNotificationNative();
    }
  } else {
    if (typeNotif === "WEBALERT") {
      alert(appMsg.title + ": " + appMsg.msg);
      anyMsgSent = true;
    } else {
      vnotify(appMsg, elementSelector);
    }
  }
}
function postTestMessage(msg, type, selector, position) {
  var testMsg = {"ids":["DrNNAAA"], "show":true, "type":type ? type : "success", "typeNotif":"WEBUI", "title":"Service Update", "msgid":"pm1411071", "msg":msg ? msg : "Thanks for trying <b>SmartList</b>. Keep us posted your feedback.", "autoclose":"0", "pos":position ? position : "top", "repeat":true};
  finalNotification(testMsg, "#msgBox");
}
function vnotify(msg, selector) {
  var notifId = Math.floor(Math.random() * 1000);
  try {
    var exNotifStyles = "";
    if (msg.type === "error") {
      exNotifStyles += "vnotifError";
    } else {
      if (msg.type === "warn") {
        exNotifStyles += "vnotifWarn";
      } else {
        if (msg.type === "success") {
          exNotifStyles += "vnotifSuccess";
        } else {
          exNotifStyles += "vnotifInfo";
        }
      }
    }
    var html = "";
    html += "<div id='vnotif" + notifId + "' class='vnotif " + exNotifStyles + "'>";
    html += "<div class='vnotifClose'>&#215;</div>";
    if (msg.title) {
      html += "<div class='vnotifTitleBox'><span style='font-size: 12px;'>&#9432; </span><span class='vnotifTitle'>" + msg.title + ": <span></div>";
    }
    html += "<span class='vnotifMsg'>" + msg.msg + "</span>";
    html += "<div>";
    if ($("#msgBox").length === 0) {
      $("body").prepend("<div id=\"msgBox\" style=''></div>");
    }
    if (isEmpty(selector)) {
      selector = "#msgBox";
    }
    $(selector).append(html);
    gaEvent(gappRef, "Notif", "FinalMessageSent");
    $(document).on("click", ".vnotifClose", function(e) {
      $(".vnotif").remove();
    });
    if (msg.autoclose) {
      var time = Number(msg.autoclose);
      if (time > 0) {
        setTimeout(function() {
          $("#vnotif" + notifId).fadeOut(1000);
        }, time);
      }
    }
    anyMsgSent = true;
  } catch (e) {
    gaEvent(gappRef, "Notif", "Failed-vnotify");
  }
}
function dateInYyMmDd() {
  var d = new Date;
  var yymmdd = d.getFullYear().toString().substr(2, 2) + "" + ("0" + (d.getMonth() + 1)).slice(-2) + "" + ("0" + d.getDate()).slice(-2);
  return yymmdd;
}
function getTimeDiffInMinutes(longTime) {
  var diff = ((new Date).getTime() - (new Date(longTime)).getTime()) / 1000;
  diff /= 60;
  return Math.abs(Math.round(diff));
}
function isValidExtVersion(appId) {
  try {
    if (!isEmpty(appId)) {
      var myAppId = getAppExtID();
      if (!appId.contains(myAppId)) {
        return false;
      }
      var curExtVer = Number(replaceAll(chrome.runtime.getManifest().version, ".", ""));
      if (appId.contains("#")) {
        var appIdParts = appId.split("#");
        var msgExtId;
        if (appIdParts && appIdParts[1].contains("<")) {
          msgExtId = Number(appIdParts[1].replace("<", ""));
          if (msgExtId < curExtVer) {
            return true;
          }
        } else {
          if (appIdParts && appIdParts[1].contains(">")) {
            msgExtId = Number(appIdParts[1].replace(">", ""));
            if (msgExtId > curExtVer) {
              return true;
            }
          } else {
            if (appIdParts && appIdParts[1].contains("=")) {
              msgExtId = Number(appIdParts[1].replace("=", ""));
              if (msgExtId === curExtVer) {
                return true;
              }
            }
          }
        }
        return false;
      } else {
        return true;
      }
    }
    return false;
  } catch (e) {
    return false;
  }
}
;
