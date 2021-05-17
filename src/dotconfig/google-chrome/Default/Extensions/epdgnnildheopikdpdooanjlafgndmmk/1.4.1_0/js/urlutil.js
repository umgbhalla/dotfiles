//Copyright 2019 and Patent Pending. 2019-12-30 14:54:35
function isValidShortUrl(linkData, type) {
  var status = {error:false, msg:"Unknown Error!", link:null};
  try {
    if (type === "bitly") {
      if (linkData.status_code != 200) {
        status.error = true;
        status.msg = linkData.status_txt;
      } else {
        status.link = linkData.data.url;
      }
    }
    if (type === "mcfee") {
      if (linkData.indexOf("ERROR") >= 0) {
        status.error = true;
        status.msg = linkData;
      } else {
        status.link = linkData;
      }
    }
    if (status.error) {
    }
    if (status.link != null && (status.link.indexOf("http") == -1 || status.link.length > 25)) {
      status.error = true;
      status.msg = "Invalid or too long URL";
    }
  } catch (err) {
    gaEvent(gappRef, "URL-Validation-Fail", linkData);
    status.error = true;
  }
  return status;
}
function findUrls(text) {
  var source = (text || "").toString();
  var urlArray = [];
  var url;
  var matchArray;
  var regexToken = /(((ftp|https?):\/\/)[\-\w@:%_\+.~#?,&\/\/=]+)|((mailto:)?[_.\w-]+@([\w][\w\-]+\.)+[a-zA-Z]{2,3})/g;
  while ((matchArray = regexToken.exec(source)) !== null) {
    var token = matchArray[0];
    urlArray.push(token);
  }
  return urlArray;
}
;
