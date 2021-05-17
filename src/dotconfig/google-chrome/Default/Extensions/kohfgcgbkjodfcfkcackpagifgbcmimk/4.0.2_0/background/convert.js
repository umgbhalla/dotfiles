function Convert() {
  let self = this;
  self.needToSendTrueForChromeAsyncResFunctions = [];
  self.convertTabId = null;
  self.textToConvert = '';
  self.convertAlertWindowId = 0;
  self.shouldConvert = false;
  this.init = init;
  this.addOnRemovedListenerForConvert = addOnRemovedListenerForConvert;
  this.setConvertAlertWindowId = setConvertAlertWindowId;
  this.setShouldConvert = setShouldConvert;
  this.convert = convert;
  this.onConvertBtnClicked = onConvertBtnClicked;
  this.passTextToPwForConvert = passTextToPwForConvert;
  function init() {
    chrome.runtime.onMessage.addListener(gotMessage);
  }
  function gotMessage(msg, sender, sendResponse) {
    if (self[msg['fn']]) {
      self[msg['fn']](msg, sender, sendResponse);
      if (needToSendTrueForChromeAsyncRes(msg['fn'])) {
        return true;
      }
    }
  }
  function needToSendTrueForChromeAsyncRes(functionName) {
    if (self.needToSendTrueForChromeAsyncResFunctions.includes(functionName)) {
      return true;
    }
    return false;
  }
  function addOnRemovedListenerForConvert() {
    chrome.windows.onRemoved.addListener(function checkRemove(removedWindowId) {
      if (self.convertAlertWindowId === removedWindowId && self.shouldConvert) {
        chrome.windows.onRemoved.removeListener(checkRemove);
        convert();
        self.shouldConvert = false;
      }
    })
  }
  function setConvertAlertWindowId(request, sender, sendResponse) {
    this.convertAlertWindowId = request.windowId;
  }
  function setShouldConvert(request, sender, sendResponse) {
    this.shouldConvert = request.val;
  }
  function convert() {
    return utils.getDocType()
      .then((docType) => {
        return scriptInjector.executeScriptsForTextProcessor(extension.activeTabId, docType)
      })
      .then(function() {
        return utils.getTextsFromPage(extension.activeTabId, 'convert');
      })
      .then(function(texts) {
        if (texts && texts.length === 0) {
          throw new Error('ERR_NO_TEXT');
        } else {
          let processedTextForConvert = utils.combineTextForConvertIntoAString(texts);
          return passTextToPwForConvert(processedTextForConvert);
        }
      })
      .catch(function(err) {
        if (err && err['message']) {
          alertHandler.displayAlertMessage(err['message']);
        } else {
          alertHandler.displayAlertMessage(new Error('ERR_UNKNOWN'));
        }
        return Promise.resolve();
      })
  }
  function onConvertBtnClicked(request, sender, sendResponse) {
    return scriptInjector.canExecuteScript()
      .then(res => {
        if (res) {
          convert();
        }
      });
  }
  function setTextInInputDiv(onUpdatedTabId, changeInfo, tab) {
    if (onUpdatedTabId === self.convertTabId) {
      if (typeof changeInfo.status != 'undefined' && changeInfo.status === 'complete') {
        let codeToExecute = "document.getElementById(\'inputDiv\').innerHTML = \'" + self.textToConvert + "\'";
        chrome.tabs.executeScript(self.convertTabId, {
          code: codeToExecute
        }, () => void chrome.runtime.lastError);
        chrome.tabs.onUpdated.removeListener(setTextInInputDiv);
      }
    }
  }
  function passTextToPwForConvert(textToConvert) {
    return new Promise(function(resolve) {
      chrome.tabs.create({
        url: 'https://www.naturalreaders.com/online/',
        active: true
      }, function(tab) {
        self.convertTabId = tab.id;
        self.textToConvert = textToConvert;
        chrome.tabs.onUpdated.addListener(setTextInInputDiv);
        resolve();
      })
    })
  }
}
const convert = new Convert();
convert.init();
