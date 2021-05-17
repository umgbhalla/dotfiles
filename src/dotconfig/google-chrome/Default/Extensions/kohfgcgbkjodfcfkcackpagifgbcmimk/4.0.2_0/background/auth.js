var errorMsgs = {
  'ERR_SUB_NOT_FOUND': 'Looks like you don\'t have an active Premium subscription. ' +
    'Please check to see if you already have Plus or an active subscription',
  'ERR_NO_VALID_SRC': 'Looks like you don\'t have an active payment method attached to your account. ' +
    'Please update your card information and try again.',
  'ERR_PAYMENT_FAILED': 'There was an issue while charging payment. If the error persists, please update ' +
    'your card information and try again.'
};
let auth = {
  windowId: null,
  isProcessing: false,
  tabId: null,
  init: function() {
    chromeRuntimeMsgExternal.setFilter('authLogin', this.loginHelper.bind(this));
    chromeRuntimeMsgExternal.setFilter('authLogout', this.logoutHelper.bind(this));
    chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
      if (request.fn in auth) {
        auth[request.fn](request, sender, sendResponse);
      }
    });
    this.updateLicense();
    this.refreshLicenseAfterOneDaySingleUse();
  },
  currentExtId: -1,
  getCurrentExtId: function() {
    return extension.activeTabId;
  },
  updateLicense: function() {
    chrome.storage.sync.get(['userInfo'], (result) => {
      let id = result.userInfo ? (result.userInfo.id ? result.userInfo.id : null) : null;
      if (id) {
        let userInfo = {"email": result.userInfo.email, "id": id, "username": result.userInfo.username};
        this.getLicenses(userInfo.id, userInfo.username)
          .then(rst => {
            let license = rst.license;
            let pwLicNum = rst.pwLicNum ? rst.pwLicNum.toString() : "0";
            let pwLicCode = rst.pwLicCode ? rst.pwLicCode : "0";
            let pwLicType = rst.pwLicType ? rst.pwLicType : "pw";
            if (license) {
              userInfo["licNum"] = license.licNum;
              userInfo["license"] = license.licNum.toString();
              userInfo["licCode"] = license.licCode;
              userInfo["pwLicNum"] = pwLicNum;
              userInfo["pwLicCode"] = pwLicCode;
              userInfo["pwLicType"] = pwLicType;
              if (license.ownerEmail) {
                userInfo["ownerEmail"] = license.ownerEmail;
              }
            } else {
              userInfo["licNum"] = 0;
              userInfo["license"] = "0";
              userInfo["licCode"] = "0";
              userInfo["pwLicNum"] = "0";
              userInfo["pwLicCode"] = "0";
              userInfo["pwLicType"] = 'pw';
            }
            widget.setWidgetSetting({key: 'userInfo', value: userInfo});
            let tabIdToUpdate = this.currentExtId && this.currentExtId > 0 ? this.currentExtId : extension.activeTabId;
            chrome.tabs.sendMessage(tabIdToUpdate, {'fn': 'setLoggedInUI'}, () => void chrome.runtime.lastError);
            if (userInfo.licNum != 0 || (reader.tts && reader.tts['hasInvalidLicenseError'])) {
              if (reader.tts && reader.tts['clearBlobsWithError']) {
                reader.tts.clearBlobsWithError();
              }
            }
            try {
              if (reader.isWaitingForLicense) {
                reader.isWaitingForLicense = false;
                if (reader.tts.type === 'online') {
                  if (reader.tts.hasInvalidLicenseError) {
                    if (reader.tts.invalidLicenseErrorCount < 1) {
                      reader.tts.invalidLicenseErrorCount++;
                      reader.play();
                    }
                  }
                }
              }
            } catch (err) {
              reader.stop();
            }
          });
      }
    });
  },
  refreshLicenseAfterOneDaySingleUse: function() {
    const oneDay = 1000 * 60 * 60 * 24;
    setInterval(() => {
      this.updateLicense();
    }, oneDay);
  },
  login: function(request, sender, sendResponse) {
    this.currentExtId = this.getCurrentExtId();
    this.createAuthTab('login');
  },
  logout: function(request, sender, sendResponse) {
    this.currentExtId = this.getCurrentExtId();
    this.createAuthTab('logout');
  },
  signup: function(request, sender, sendResponse) {
    this.currentExtId = this.getCurrentExtId();
    this.createAuthTab('signup');
  },
  upgrade: function(request, sender, sendResponse) {
    let licType = widget.settings.userInfo.pwLicType;
    if (licType !== 'pw') {
      alertHandler.displayAlertMessage('UPGRADE_UNSUPPORTED_DIALOG', {licType});
    } else {
      let userEmail = widget.settings.userInfo.email;
      let userLicCode = widget.settings.userInfo.pwLicCode;
      let liccodeNew = '6005';
      if (userLicCode === '6006') {
        liccodeNew = '6008';
      }
      data = {liccodeCurr: userLicCode, liccodeNew: liccodeNew, email: userEmail, errors: errorMsgs};
      alertHandler.displayAlertMessage('UPGRADE_DIALOG', data);
    }
  },
  createAuthTab: function(op) {
    auth.isProcessing = true;
    let url = '';
    if (op === 'login') {
      url = 'https://www.naturalreaders.com/login-service/login?redir=ext-login&dest=ext/loading';
    } else if (op === 'logout') {
      url = 'https://www.naturalreaders.com/login-service/extension/loggedout';
    } else if (op === 'signup') {
      url = 'https://www.naturalreaders.com/login-service/signup?redir=ext-login&dest=ext/loading'
    }
    chrome.tabs.create({
      url: url,
      active: false
    }, function(tab) {
      let tabID = tab.id;
      let width = 400;
      let height = 700;
      let left = null;
      let top = null;
      auth.tabId = tabID;
      try {
        left = Math.round((screen.width / 2) - (width / 2));
        top = Math.round((screen.height / 2) - (height / 2));
      } catch (err) {
      }
      chrome.windows.create({
        tabId: tabID,
        type: 'popup',
        focused: true,
        width: width,
        height: height,
        left: left,
        top: top
      }, function(window) {
        auth.windowId = window.id;
        chrome.windows.onFocusChanged.addListener(function checkFocus(windowId) {
          if (window.id !== windowId && !auth.isProcessing) {
            chrome.windows.remove(window.id, () => void chrome.runtime.lastError);
            chrome.windows.onFocusChanged.removeListener(checkFocus);
          }
        });
        chrome.windows.onRemoved.addListener(function checkRemove(removedWindowId) {
          if (this.windowId === removedWindowId) {
            auth.isProcessing = false;
            chrome.windows.onRemoved.removeListener(checkRemove);
          }
        })
      });
      if (op === 'login') {
        chrome.tabs.executeScript(tabID, {
          code: "let user = localStorage.getItem('NAPersonal-userinfo');" +
            "let license = localStorage.getItem('pw-license');" +
            "chrome.runtime.sendMessage({ fn: 'loginHelper', tabID:" + tabID + ", user:user, license:license }, () => void chrome.runtime.lastError);"
        });
      } else if (op === 'logout') {
        chrome.tabs.executeScript(tabID, {
          code:
            "localStorage.setItem('NAPersonal-userinfo', JSON.stringify(null));" +
            "localStorage.setItem('NAPersonal-isLog', JSON.stringify(0));" +
            "localStorage.setItem('pw-license', JSON.stringify({num: 0, expiryDate: 'expired', isAutoRenew: false, isExpired: true, planName: 'Free Plan'}));" +
            "localStorage.setItem('edu-license', JSON.stringify(null));" +
            "chrome.runtime.sendMessage({ fn: 'logoutHelper', tabID:" + tabID + "}, () => void chrome.runtime.lastError);"
        });
      } else if (op === 'signup') {
        chrome.tabs.executeScript(tabID, {
          code:
            "chrome.runtime.sendMessage({ fn: 'signupHelper', tabID:" + tabID + "}, () => void chrome.runtime.lastError);"
        });
      }
    });
  },
  signupHelper: function(request, sender, sendResponse) {
    let signupTabID = request.tabID;
    chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
      if (tabId === signupTabID) {
        if (changeInfo.url != undefined) {
          if (changeInfo.url.includes("https://naturalreaders.com/login-service/login?redir=ext-login&dest=ext/loading")) {
            chrome.tabs.executeScript(signupTabID, {
              code:
                "chrome.runtime.sendMessage({ fn: 'loginHelper', tabID:" + signupTabID + ", user:null, license:null }, () => void chrome.runtime.lastError);"
            });
          }
        }
      }
    });
  },
  loginHelper: function(request, sender, sendResponse) {
    let loginTabID = request.tabID;
    let user;
    if (request && request.user && typeof request.user === 'string')
      user = JSON.parse(request.user);
    if (!user) {
      chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
        if (tabId === loginTabID) {
          if (changeInfo.url != undefined) {
            if (changeInfo.url.includes("https://www.naturalreaders.com/login-service/auth-password?email=")) {
              chrome.tabs.executeScript(loginTabID, {
                code:
                  "localStorage.setItem('NAPersonal-userinfo', JSON.stringify(null));" +
                  "localStorage.setItem('NAPersonal-isLog', JSON.stringify(0));" +
                  "localStorage.setItem('pw-license', JSON.stringify(null));" +
                  "localStorage.setItem('edu-license', JSON.stringify(null));"
              });
            }
            if (changeInfo.url.includes('https://www.naturalreaders.com/login-service/extension/loggedin')) {
              chrome.tabs.executeScript(loginTabID, {
                code:
                  "let ssoUser = localStorage.getItem('NAPersonal-userinfo');" +
                  "chrome.runtime.sendMessage({ fn: 'loginHelper', tabID:" + loginTabID + ", user:ssoUser, alreadyLoggedIn:true },() => void chrome.runtime.lastError);"
              });
            }
          }
        }
      });
    } else {
      let userInfo = {};
      userInfo["email"] = user.userid;
      userInfo["id"] = user.id;
      userInfo["username"] = user.username;
      if (!request['alreadyLoggedIn']) {
        chrome.tabs.executeScript(loginTabID, {
          code: "window.location.replace('https://www.naturalreaders.com/login-service/extension/loggedin');"
        });
      }
      let license = request.license ? JSON.parse(request.license) : null;
      let pwLicense = request.pwLicense ? JSON.parse(request.pwLicense) : license;
      let pwLicNum = pwLicense ? pwLicense.num.toString() : "0";
      let pwLicCode = pwLicense ? pwLicense.licCode : "0";
      let pwLicType = pwLicense ? pwLicense.type : 'pw';
      if (!license || license.num == '0') {
        this.getLicenses(user.id, user.username)
          .then(rst => {
            license = rst.license;
            pwLicNum = rst.pwLicNum ? rst.pwLicNum.toString() : "0";
            pwLicCode = rst.pwLicCode ? rst.pwLicCode : "0";
            pwLicType = rst.pwLicType ? rst.pwLicType : 'pw';
            if (license) {
              userInfo["licNum"] = license.licNum;
              userInfo["license"] = license.licNum.toString();
              userInfo["licCode"] = license.licCode;
              userInfo["pwLicNum"] = pwLicNum;
              userInfo["pwLicCode"] = pwLicCode;
              userInfo["pwLicType"] = pwLicType;
              if (license.ownerEmail) {
                userInfo["ownerEmail"] = license.ownerEmail;
              }
            } else {
              userInfo["licNum"] = 0;
              userInfo["license"] = "0";
              userInfo["licCode"] = "0";
              userInfo["pwLicNum"] = "0";
              userInfo["pwLicCode"] = "0";
              userInfo["pwLicType"] = "pw";
            }
            widget.setWidgetSetting({key: 'userInfo', value: userInfo});
            widget.setWidgetSetting({key: 'loggedIn', value: 1});
            if (userInfo.licNum != 0) {
              if (reader.tts && reader.tts['clearBlobsWithError']) {
                reader.tts.clearBlobsWithError();
              }
            }
            let tabIdToUpdate = this.currentExtId && this.currentExtId > 0 ? this.currentExtId : extension.activeTabId;
            chrome.tabs.sendMessage(tabIdToUpdate, {'fn': 'setLoggedInUI'}, () => void chrome.runtime.lastError);
            pe.getPeListForUser();
            auth.isProcessing = false;
          });
      } else {
        userInfo["license"] = license.num.toString();
        userInfo["licNum"] = license.licNum;
        userInfo["licCode"] = license.licCode;
        userInfo["pwLicNum"] = pwLicNum;
        userInfo["pwLicCode"] = pwLicCode;
        userInfo["pwLicType"] = pwLicType;
        if (license.ownerEmail) {
          userInfo["ownerEmail"] = license.ownerEmail;
        }
        widget.setWidgetSetting({key: 'userInfo', value: userInfo});
        widget.setWidgetSetting({key: 'loggedIn', value: 1});
        if (userInfo.licNum != 0) {
          if (reader.tts && reader.tts['clearBlobsWithError']) {
            reader.tts.clearBlobsWithError();
          }
        }
        let tabIdToUpdate = this.currentExtId && this.currentExtId > 0 ? this.currentExtId : extension.activeTabId;
        chrome.tabs.sendMessage(tabIdToUpdate, {'fn': 'setLoggedInUI'}, () => void chrome.runtime.lastError);
        auth.isProcessing = false;
        sendResponse({ok: true});
      }
    }
  },
  logoutHelper: function(request, sender, sendResponse) {
    auth.isProcessing = false;
    let userInfo = {'licNum': 0, 'license': "0", 'pwLicNum': "0", 'pwLicCode': "0", 'email': 'user@naturalreaders.com', 'id': null, 'username': '', 'licCode': '0'};
    widget.setWidgetSetting({key: 'userInfo', value: userInfo});
    widget.setWidgetSetting({key: 'loggedIn', value: 0});
    let tabIdToUpdate = this.currentExtId && this.currentExtId > 0 ? this.currentExtId : extension.activeTabId;
    chrome.tabs.sendMessage(tabIdToUpdate, {'fn': 'setLoggedOutUI'}, () => void chrome.runtime.lastError);
    pe.setPeAndTts([]);
    sendResponse({ok: true});
  },
  getBillingInfoOrLicense: async function(id, username, provider, resource) {
    const params = {
      id,
      username,
      provider
    };
    const headers = {
      'Content-Type': 'application/json'
    };
    let url = new URL('https://rrauikxmbg.execute-api.us-east-1.amazonaws.com/prod/' + resource);
    url.search = new URLSearchParams(params)
    return fetch(url, headers)
      .then(response => {
        return Promise.resolve(response.json());
      })
      .catch(err => {
      });
  },
  getLicenses: function(id, username) {
    return Promise.all([this.getBillingInfoOrLicense(id, username, 'pw', 'billing'), this.getBillingInfoOrLicense(id, username, 'edu', 'license')])
      .then((response) => {
        let billingInfo = response[0];
        let eduInfo = response[1];
        if (billingInfo) {
          let pwLicNum = billingInfo && billingInfo['planDefine'] && !this.isLicenseExpired(billingInfo['status']) ? billingInfo['planDefine']['licNum'] : 0;
          let pwLicCode = billingInfo && billingInfo['planDefine'] && !this.isLicenseExpired(billingInfo['status']) ? billingInfo['planDefine']['plan'] : '0';
          let pwLicense = billingInfo && billingInfo['planDefine'] && !this.isLicenseExpired(billingInfo['status']) ? {licNum: billingInfo['planDefine']['licNum'], licCode: billingInfo['planDefine']['plan']} : null;
          let pwLicType = billingInfo && billingInfo['planDefine'] && !this.isLicenseExpired(billingInfo['status']) ? billingInfo['app'] : 'pw';
          if (pwLicType === "stripe") {
            pwLicType = "pw";
          }
          let eduLicNum = eduInfo && eduInfo['planDefine'] ? eduInfo['planDefine']['licNum'] : 0;
          let eduLicense = eduInfo && eduInfo['planDefine'] ? {licNum: eduInfo['planDefine']['licNum'], licCode: eduInfo['planDefine']['plan'], ownerEmail: eduInfo.ownerEmail ? eduInfo.ownerEmail : ''} : null;
          if (pwLicNum == 13) {
            return {license: pwLicense, pwLicNum, pwLicCode, pwLicType};
          } else if (pwLicNum == 12) {
            return {license: pwLicense, pwLicNum, pwLicCode, pwLicType};
          } else {
            if (eduLicNum >= 31 && eduLicNum <= 37) {
              return {license: eduLicense, pwLicNum, pwLicCode, pwLicType};
            } else {
              return {license: null, pwLicNum, pwLicCode, pwLicType};
            }
          }
        } else {
          return {license: null, pwLicNum: "0", pwLicCode: "0", pwLicType};
        }
      })
      .catch(err => {
      });
  },
  //  
  //        
  //        
  //        
  //        
  isLicenseExpired: function(status) {
    let isExpired = true;
    switch (status) {
      case 'trialing':
      case 'active':
      case 'past_due':
        isExpired = false;
        break;
      default:
        isExpired = false;
    }
    return isExpired;
  }
}
auth.init();
