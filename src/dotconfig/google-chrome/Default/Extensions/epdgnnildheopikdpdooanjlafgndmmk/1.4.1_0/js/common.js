//Copyright 2019 and Patent Pending. 2019-12-30 14:54:36
var TESTING = false;
$(document).ready(function() {
  log("******** Common Onready Init");
});
function log(msg) {
  if (TESTING) {
    console.log(msg);
  }
}
function isEmpty(valueOfObj) {
  var i, v;
  try {
    if (valueOfObj === null || valueOfObj === undefined) {
      return true;
    }
    if (valueOfObj && Object.keys(valueOfObj).length === 0) {
      return true;
    }
    if (typeof valueOfObj === "object") {
      for (i in valueOfObj) {
        v = valueOfObj[i];
        if (v !== undefined && typeof v !== "function") {
          return false;
        }
      }
    } else {
      if (typeof valueOfObj === "string" && valueOfObj.trim().length > 0) {
        return false;
      }
    }
  } catch (e) {
    log("couldn't check emptyness: " + e);
  }
  return true;
}
String.prototype.trim = function() {
  return this.replace(/^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g, "");
};
String.prototype.contains = function(it) {
  return this.indexOf(it) !== -1;
};
function getExtManifestVersionNumber(needWithGappIdYesNo) {
  var defaultVer = 0;
  try {
    if (chrome && chrome.runtime) {
      defaultVer = Number(replaceAll(chrome.runtime.getManifest().version, ".", ""));
    }
    if (needWithGappIdYesNo && needWithGappIdYesNo === true) {
      defaultVer = gappId + (defaultVer > 0 ? defaultVer : "000");
    }
  } catch (e) {
  }
  return defaultVer;
}
;
