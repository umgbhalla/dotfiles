let alertHandler = {
  windowId: null,
  tabId: null,
  init: function() {
    chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
      if (request.fn in alertHandler) {
        alertHandler[request.fn](request, sender, sendResponse);
      }
    });
  },
  displayAlertMessage: function(message, data = {}) {
    return new Promise((resolve) => {
      chrome.runtime.sendMessage({'message': 'closePopup'}, () => void chrome.runtime.lastError);
      if (message.message) {
        message = message.message;
      }
      if (message === 'ERR_NOT_READABLE' || message === 'ERR_NO_TEXT') {
        if (reader.readOption !== 'selection-context-menu') {
            chrome.tabs.create({url: 'https://www.naturalreaders.com/ext_howto.html'}, (tab)=>{
              extension.setIcon();
              utils.getActiveTab()
                .then(async (tab) => {
                  let docType = await utils.getDocType();
                  await widget.injectWidget(tab.id, docType, null, true);
                  chrome.tabs.sendMessage(tab.id, {
                    message: 'browserActionOnClicked',
                    beingReadTabId: reader.beingReadTabId, activeTabId: extension.activeTabId
                  }, () => void chrome.runtime.lastError);
                })
                .catch(err => {
                })
            });
        }
      } else if (message === 'ERR_INVALID_PAGE'){
        this.showAlert("showAlertInvalidPage", 512, 552);
      } else if (message === 'ERR_TTS_LIMIT' || message == 1005) {
        let voiceType = widget.settings.voiceType;
        let pwLicNum = widget.settings.userInfo.pwLicNum;
        let pwLicType = widget.settings.userInfo.pwLicType;
        if (voiceType === 'prem') {
          this.showAlert("showAlertPremTtsLimit", 512, 568);
        } else {
          this.showAlert("showAlertPlusTtsLimit", 512, 568, {license: pwLicNum, licType: pwLicType});
        }
      } else if (message === 'ERR_NO_TABID') {
      } else if (message === 'ERR_PDF') {
        this.showAlert("showAlertPdf", 512, 478);
      } else if (message === 'CONVERT_MP3') {
        this.showAlert("showAlertMp3", 512, 316);
      } else if (message === 'ERR_NO_FREE_VOICES') {
        this.showAlert("showAlertNoFreeVoices", 512, 472);
      } else if (message === 'UPDATE_AVAILABLE') {
        this.showAlert("showAlertUpdateAvailable", 512, 472);
      } else if (message === 'UPGRADE_DIALOG') {
        this.showAlert("showUpgradeDialog", 512, 588, data);
      } else if (message === 'UPGRADE_UNSUPPORTED_DIALOG') {
        this.showAlert("showUpgradeUnsupportedDialog", 512, 478, data);
      } else if (message === 'ERR_GOOGLE_DRIVE_PREVIEW') {
        this.showAlert("showGoogleDrivePreviewWarning", 512, 472);
      }
      else {
        this.showAlert("showAlertGeneric", 512, 472);
      }
      resolve();
    })
      .catch(err => {
      });
  },
  showAlert: function(code, w = 512, h = 512, data = {}) {
    let width = w;
    let height = h;
    let dualScreenLeft = 0;
    let dualScreenTop = 0;
    try {
      dualScreenLeft = window.screenLeft != undefined ? window.screenLeft : window.screenX;
      dualScreenTop = window.screenTop != undefined ? window.screenTop : window.screenY;
    } catch (err) {
    }
    let screenWidth = null;
    let screenHeight = null;
    try {
      screenWidth = window.innerWidth ? window.innerWidth : document.documentElement.clientWidth ? document.documentElement.clientWidth : screen.width;
      screenHeight = window.innerHeight ? window.innerHeight : document.documentElement.clientHeight ? document.documentElement.clientHeight : screen.height;
    } catch (err) {
    }
    let left = screenWidth ? Math.round(((screenWidth / 2) - (width / 2)) + dualScreenLeft) : null;
    let top = screenWidth ? Math.round(((screenHeight / 2) - (height / 2)) + dualScreenTop) : null;
    chrome.tabs.create({
      url: "https://www.naturalreaders.com/ext",
      active: false
    }, function(tab) {
      alertHandler.tabId = tab.id;
      chrome.windows.create({
        tabId: tab.id,
        type: 'popup',
        focused: true,
        width: width,
        height: height,
        left: left,
        top: top
      }, function(alertWindow) {
        alertHandler.windowId = alertWindow.id;
        alertHandler.tabId = alertWindow.tabs.length > 0 ? alertWindow.tabs[0].id : null;
        alertHandler.showAlertHelper(code, alertWindow.id, data);
        chrome.browserAction.onClicked.addListener(function checkPopupFocus() {
        });
        chrome.windows.onFocusChanged.addListener(function checkFocus(windowId) {
          if (alertWindow.id !== windowId) {
            chrome.windows.remove(alertWindow.id, () => void chrome.runtime.lastError);
            chrome.windows.onFocusChanged.removeListener(checkFocus);
          }
        });
      });
    });
  },
  showAlertHelper: function(code, alertWindowId, data = {}) {
    chrome.tabs.executeScript(null, {file: "assets/js/plugins/sweetalert2.js"}, function() {
      chrome.tabs.insertCSS(null, {file: "libs/alert.css"}, function() {
        chrome.tabs.executeScript(null, {file: "libs/alert.js"}, function() {
          chrome.tabs.executeScript(null, {
            code: code + '(' + alertWindowId + ',' + JSON.stringify(data) + ');'
          }, () => void chrome.runtime.lastError);
        });
      });
    });
  },
  closeAlertWindow: function(request, sender, sendResponse) {
    chrome.windows.remove(request.windowId, () => void chrome.runtime.lastError);
  }
}
alertHandler.init();
