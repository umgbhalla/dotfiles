//Copyright 2019 and Patent Pending. 2019-12-30 14:54:42
var _gaq = _gaq || [];
_gaq.push(["_setAccount", "UA-46096258-1"]);
function gaPageView() {
  _gaq.push(["_trackPageview"]);
}
function gaEvent(action, label) {
  if (!TESTING) {
    _gaq.push(["_trackEvent", action, label]);
  } else {
    log(_gaq.push(["_trackEvent", action, label]));
  }
}
function gaEvent(action, label, labelValue) {
  if (!TESTING) {
    _gaq.push(["_trackEvent", action, label, labelValue]);
  } else {
    log(["_trackEvent", action, label, labelValue]);
  }
}
;
