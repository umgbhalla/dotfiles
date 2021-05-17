function Utils() {
  this.getActiveTab = getActiveTab;
  this.getActiveTabId = getActiveTabId;
  this.listenForPortConnection = listenForPortConnection;
  this.writeToLocalStorage = writeToLocalStorage;
  this.readFromLocalStorage = readFromLocalStorage;
  this.debounce = debounce;
  this.calculateRate = calculateRate;
  this.increaseTtsUsage = increaseTtsUsage;
  this.runtimeSendMessage = runtimeSendMessage;
  this.getTextsFromPage = getTextsFromPage;
  this.replaceLineBreakWithPeriod = replaceLineBreakWithPeriod;
  this.excapeQuotes = excapeQuotes;
  this.processText = processText;
  this.processTextForConvert = processTextForConvert;
  this.addParagraphTagAndCleanUpText = addParagraphTagAndCleanUpText;
  this.combineTextForConvertIntoAString = combineTextForConvertIntoAString;
  this.getOS = getOS;
  this.recordExtUsage = recordExtUsage;
  this.isWindowValid = isWindowValid;
  this.getDocType = getDocType;
  this.setFunctionId = setFunctionId;
  this.detectLanguage = detectLanguage;
  function isWindowValid(windowId) {
    chrome.windows.get(windowId, {populate: false, windowTypes: ['popup']}, function(window) {
      if (!window) {
        return false;
      } else {
        return true;
      }
    });
  }
  function getActiveTab() {
    return new Promise(function(resolve, reject) {
      browser.tabs.query({active: true, lastFocusedWindow: true}, retrieveTabs)
      function retrieveTabs(tabs) {
        if (tabs && tabs.length > 0) {
          resolve(tabs[0]);
        } else {
          reject(new Error('ERR_NO_ACTIVE_TAB'));
        }
      }
    })
  }
  function getActiveTabId() {
    return new Promise(function(resolve, reject) {
      browser.tabs.query({active: true, lastFocusedWindow: true}, retrieveTabs)
      function retrieveTabs(tabs) {
        if (tabs.length > 0) {
          resolve(tabs[0]['id']);
        } else {
          reject(new Error('ERR_NO_ACTIVE_TAB'));
        }
      }
    })
  }
  function listenForPortConnection(portName) {
    return new Promise(function(resolve, reject) {
      browser.runtime.onConnect.addListener(function(onConnectPort) {
        if (portName === onConnectPort.name) {
          resolve(onConnectPort)
        } else {
          reject('No port')
        }
      });
    })
  }
  function writeToLocalStorage(keyValuePairs, callback) {
    return new Promise(function(resolve, reject) {
      try {
        browser.storage.local.set(keyValuePairs, function(res) {
          resolve({res: 'ok', err: null});
        })
      } catch (err) {
        reject({res: 'ko', err});
      }
    });
  }
  function readFromLocalStorage(keys, callback) {
    return new Promise(function(resolve, reject) {
      try {
        browser.storage.local.get(keys, function(res) {
          resolve({res, err: null});
        });
      } catch (err) {
        reject({res: 'ko', err})
      }
    });
  }
  function debounce(func, wait = 500, immediate = true) {
    var timeout;
    return function() {
      var context = this, args = arguments;
      var later = function() {
        timeout = null;
        if (!immediate)
          func.apply(context, args);
      };
      var callNow = immediate && !timeout;
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
      if (callNow) func.apply(context, args);
    };
  }
  function calculateRate(rate) {
    if (typeof rate === 'undefined') {
      return 1.0;
    }
    let calculatedRate = 1;
    if (rate > 0) calculatedRate += rate * 0.1;
    else calculatedRate += rate * 0.2;
    return calculatedRate;
  }
  async function getDocType(tabId) {
    return pdfDoc.checkPDF()
      .then((res) => {
        if (res.isPdf) {
          Promise.resolve(null);
        } else {
          return new Promise((resolve) => {
            chrome.tabs.executeScript(tabId, {
              code:
                "" +
                "if (!window.isDocTypeChecked) {" +
                "let resp = null;" +
                "if (location.hostname == 'docs.google.com') {" +
                "if (document.getElementsByClassName('kix-appview-editor').length){resp = 'google doc';}" +
                "else if (document.getElementsByClassName('.drive-viewer-paginated-scrollable').length){ resp = 'google drive doc';}" +
                "else {resp = 'html';}" +
                "} else if (location.hostname == 'drive.google.com') {" +
                "if (document.getElementsByClassName('drive-viewer-paginated-scrollable').length){resp = 'google drive doc';}" +
                "else{resp = 'google drive preview';}" +
                "}else {" +
                "resp = 'html';" +
                "}" +
                "window.isDocTypeChecked = true;" +
                "window.docType = resp;" +
                "resp;" +
                "} else { window.docType; }"
            }, (result) => {
              if (chrome.runtime.lastError) {
                resolve(null);
              }
              if (result) {
                resolve(result[0]);
              } else {
                resolve(null);
              }
            });
          });
        }
      })
      .catch((err) => {
      });
  }
  function increaseTtsUsage(licenseNumber, charCount) {
    let apiEndpoint = new URL('https://tuwz0i1tl0.execute-api.us-east-1.amazonaws.com/prod/incr-tts');
    let params = {l: licenseNumber, c: charCount}
    apiEndpoint.search = new URLSearchParams(params)
    return fetch(apiEndpoint, {
      method: 'GET',
      mode: 'cors',
      cache: 'no-cache',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
    })
      .then(response => {
        let contentType = response.headers.get("content-type");
        if (response.ok) {
          return response.json()
            .then(function(res) {
              return res;
            })
        } else if (contentType && contentType.includes("application/json")) {
          return response.json()
            .then(function(res) {
              if (res && res['errorCode'] && res['errorCode'] === 'ERR_CONVERT_LIMIT') {
                throw new Error('ERR_TTS_LIMIT')
              } else if (res && res['errorCode'] && res['errorCode'] == 1005) {
                throw new Error(res['errorCode']);
              } else {
                throw new Error('ERR_UNKOWN');
              }
            })
        }
      })
      .catch(err => {
        throw err;
      });
  }
  function runtimeSendMessage(message) {
    return new Promise(function(resolve) {
      browser.runtime.sendMessage(message, () => void browser.runtime.lastError);
      resolve();
    })
  }
  function getTextsFromPage(tabId, op = "all") {
    if (!tabId) {
      return Promise.reject(new Error('ERR_NO_TABID'));
    }
    msg = {
      fn: 'getTextsFromPage',
      op: op,
      'chromeAsync': true
    }
    return new Promise(function(resolve) {
      chrome.tabs.sendMessage(tabId, msg, null, responseCallback = getResponse)
      function getResponse(response) {
        if (chrome.runtime.lastError) {}
        resolve(response)
      }
    });
  }
  function excapeQuotes(text) {
    let processedText = text.replace(/'/g, "\\'");
    processedText = processedText.replace(/"/g, '\\"');
    return processedText
  }
  function replaceLineBreakWithPeriod(text) {
    let processedText = text.trim();
    processedText = processedText.replace(/(?:\r\n|\r)/g, '\\n');
    processedText = processedText.replace(/(?:\n{2,})/g, '\\n');
    processedText = processedText.replace(/(?<!([\\?\\}\\{\\.\\;\\,\\!\\,]))\n/g, '. ');
    processedText = processedText.replace(/(?:\n)/g, ' ');
    return processedText;
  }
  function replaceLineBreakWithPeriodBk(text) {
    let processedText = text.trim();
    processedText = processedText.replace(/(?:\r\n|\r)/g, '\n');
    processedText = processedText.replace(/(?:\n{2,})/g, '\n');
    processedText = processedText.replace(/(?:\n)/g, '. ');
    return processedText;
  }
  function processText(text) {
    let processedText = replaceSpecialChars(text);
    return processedText;
  }
  function processTextForConvert(text) {
    let processedText = processText(text);
    processedText = replaceLineBreakWithPeriod(processedText);
    processedText = excapeQuotes(processedText);
    return processedText;
  }
  function getObjectLength(obj) {
    return Object.keys(obj).length;
  }
  function setFunctionId(id) {
    if (id === undefined) {
      id = 0;
    } else {
      id++;
    }
    return id;
  }
  function replaceSpecialChars(text) {
    let processedText = text.replace(/<br\s*\/?>/gi, '. ');
    processedText = processedText.replace(/[\u200c|\u200b|\u200d|\ufeff]/gi, ' ');
    processedText = processedText.replace(/[\u0000|\u001b|\u001c|\u001f|\ufe4f|\u005f|\uff3f]/g, '');
    processedText = processedText.replace(/[\u2018|\u2019|\u2039|\u203A]/g, "'");
    processedText = processedText.replace(/[\u201c|\u201d|\u00ab|\u00bb]/g, '"');
    processedText = processedText.replace(/[\uff01]/g, '!');
    processedText = processedText.replace(/[\uff1f]/g, '?');
    processedText = processedText.replace(/[\uff0c]/g, ',');
    processedText = processedText.replace(/[\uff1a]/g, ':');
    processedText = processedText.replace(/[\uff1b]/g, ';');
    processedText = processedText.replace(/[\u2026]/g, '.');
    processedText = processedText.replace(/[\u2014|\u2015]/g, '-');
    processedText = processedText.replace(/[\u005f|\uff3f]/g, ' ');
    processedText = processedText.replace(/(^|\s*)(&c\.|&c|etc)(\s|\”|\’|\'|\"|\;|\,|\?|\!|$)/g, '$1etc.$3');
    return processedText;
  }
  function addParagraphTagAndCleanUpText(textForConvert) {
    let processedText = textForConvert.map(function(text) {
      return `<p>${processTextForConvert(text)}</p>`;
    });
    return processedText;
  }
  function combineTextForConvertIntoAString(textForConvert) {
    let processTextArray = addParagraphTagAndCleanUpText(textForConvert);
    return processTextArray.join('');
  }
  function getOS() {
    let res = {os: 'non-mac'};
    if (window.navigator.platform.toUpperCase().indexOf('MAC') !== -1) {
      res.os = 'mac';
    }
    return res;
  }
  function recordExtUsage(urlInfo) {
    let apiEndpoint = new URL('https://tuwz0i1tl0.execute-api.us-east-1.amazonaws.com/prod/use-ext');
    let params = {o: urlInfo.origin, h: urlInfo.href}
    apiEndpoint.search = new URLSearchParams(params)
    return fetch(apiEndpoint, {
      method: 'POST',
      mode: 'cors',
      cache: 'no-cache',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
    })
      .then(_ => {
        return Promise.resolve();
      })
      .catch(_ => {
        return Promise.resolve();
      })
  }
  function detectLanguage(texts) {
    var minChars = 1000;
    var maxPages = 10;
    var output = combineTexts("", texts);
    return detectLanguageOf(output);
    function combineTexts(output, texts) {
      for (var i = 0; i < texts.length && output.length < minChars; i++) output += (texts[i] + " ");
      return output;
    }
  }
  function detectLanguageOf(text) {
    //  
    return browserDetectLanguage(text)
      .then(function(result) {
        return result;
      })
  }
  function browserDetectLanguage(text) {
    if (!chrome.i18n.detectLanguage) return Promise.resolve(null);
    return new Promise(function(fulfill) {
      chrome.i18n.detectLanguage(text, fulfill);
    })
      .then(function(result) {
        if (result) {
          var list = result.languages.filter(function(item) {return item.language != "und"});
          list.sort(function(a, b) {return b.percentage - a.percentage});
          return list[0] && list[0].language;
        }
        else {
          return null;
        }
      })
  }
}
const utils = new Utils();
