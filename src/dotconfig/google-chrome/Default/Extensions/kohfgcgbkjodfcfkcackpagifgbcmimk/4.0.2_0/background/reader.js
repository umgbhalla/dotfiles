function Reader() {
  let self = this;
  self.setDocType = setDocType;
  self.tts = null;
  self.setTts = setTts;
  self.readerState = 'init';
  self.currReadIndex = 0;
  self.currPageIndex = 0;
  self.readProgress = 0;
  self.isFirstRead = true;
  self.playId = undefined;
  self.shouldCheckForPreviewMode = true;
  self.readOption = 'all';
  self.readOptionOfParsed = 'all';
  self.play = play;
  self.replay = replay;
  self.stop = stop;
  self.pause = pause;
  self.playNext = playNext;
  self.forward = forward;
  self.backward = backward;
  self.readIndex = readIndex;
  self.setReadIndex = setReadIndex;
  self.readSelection = readSelection;
  self.readByCommand = readByCommand;
  self.readSelectionWithContextMenu = readSelectionWithContextMenu;
  self.setPlayId = setPlayId;
  self.beingReadTabId = null;
  self.getReaderInfo = getReaderInfo;
  self.setShouldCheckForPreviewMode = setShouldCheckForPreviewMode;
  self.setReadOption = setReadOption;
  self.preview = preview;
  self.getReadOption = getReadOption;
  self.setTextsForTtsWithoutPlay = setTextsForTtsWithoutPlay;
  self.asyncFunctions = ['getReaderInfo', 'getReadOption', 'setTextsForTtsWithoutPlay'];
  self.isWaitingForLicense = false;
  self.previewVoiceKey = '';
  function init() {
    browser.webNavigation.onCommitted.addListener(function(details) {
      if (details.tabId === self.beingReadTabId && (details.transitionType !== 'auto_subframe' && details.transitionType !== 'manual_subframe')) {
        stop();
      }
    });
    browser.runtime.onMessage.addListener(function(request, sender, sendResponse) {
      if (self[request['fn']]) {
        self[request['fn']](request, sender, sendResponse);
        if (isAsyncFunction(request['fn'])) {
          return true;
        }
      } else if (request.message === 'readPage') {
        stop();
        return setBeingReadTab(sender)
          .then(() => {
            return setDocType();
          })
          .then(() => {
            return widget.injectWidget(self.beingReadTabId, self.docType, true)
          })
          .then(() => {
            self.readOption = 'all';
            return readPage(request.pageIndex);
          })
          .catch(err => {
          });
      } else if (request.message === 'stop') {
        stop(request.toReset);
      }
    });
  }
  function setDocType(caller) {
    return new Promise(async (resolve, reject) => {
      if (self.isFirstRead) {
        if (caller !== 'google drive preview warning') {
          let docType = await utils.getDocType(self.beingReadTabId);
          self.docType = docType;
        }
        if (self.shouldCheckForPreviewMode && self.docType === 'google drive preview') {
          reject(new Error('ERR_GOOGLE_DRIVE_PREVIEW'));
        } else {
          resolve();
        }
      } else {
        resolve();
      }
    });
  }
  function setTts(type) {
    return new Promise((resolve) => {
      if (self.tts) {
        self.tts.pause(false);
      }
      resolve();
    })
      .then(() => {
        if (type === 'prem' && voices.voices['prem'][self.previewVoiceKey ? self.previewVoiceKey : widget.settings.premVoice].source === 'google') {
          self.tts = freeTts;
        } else {
          if (type === 'free') {
            self.tts = freeTts;
          } else {
            self.tts = onlineTts;
            if (self.tts['setNumPreloads']) {
              if (type === 'prem') {
                self.tts.setNumPreloads(2, 4);
              } else {
                self.tts.setNumPreloads(1, 1);
              }
            }
            if (self.tts['clearPreloads']) {
              self.tts.clearPreloads();
            }
          }
        }
      })
      .catch(function(err) {
      });
  }
  function isAsyncFunction(fn) {
    if (self.asyncFunctions.includes(fn)) {
      return true;
    } else {
      return false;
    }
  }
  function setBeingReadTab(sender = {}, caller = null) {
    return new Promise((resolve, reject) => {
      if (sender && sender.tab && caller !== 'google drive preview warning') {
        if (self.isFirstRead) {
          self.beingReadTabId = sender.tab.id;
          resolve();
        } else {
          if (sender.tab.id !== self.beingReadTabId) {
            reject(new Error('READ_NEW'));
          } else {
            resolve();
          }
        }
      } else {
        resolve();
      }
    });
  }
  function play(request = {}, sender = {}, sendResponse = {}) {
    let op = request ? request.op : null;
    let caller = request ? request.caller : null;
    if (caller && caller === 'readBtn' && self.isFirstRead) {
      reset();
    }
    let percentage = request && typeof request.percentage !== 'undefined' ? request.percentage : null;
    let id = self.setPlayId();
    let texts = request && request.texts ? request.texts : null;
    let index = request && 'index' in request ? request.index : null;
    if (self.tts === null || !isCorrectReaderType()) {
      setTts(widget.settings.voiceType);
    }
    return setBeingReadTab(sender, caller)
      .then(() => {
        return setDocType(caller);
      })
      .then(async () => {
        if (self.isFirstRead || op || ttsText.textsForTts.length === 0) {
          let tabId = extension.activeTabId ? extension.activeTabId : self.beingReadTabId;
          chrome.tabs.sendMessage(tabId, {'message': 'readerOnLoading'}, () => void chrome.runtime.lastError);
          return setTextsForTts(texts);
        } else {
          if (self.docType === 'google doc' && self.readOptionOfParsed === 'all') {
            let same = await isSameText();
            if (same) {
              return Promise.resolve();
            } else {
              return Promise.reject(new Error('ERR_TEXT_EDITED'));
            }
          } else {
            return Promise.resolve();
          }
        }
      })
      .then(() => {
        if (index !== null) {
          self.currReadIndex = index;
        }
        if (op === 'prev') {
          self.currReadIndex = ttsText.textsForTts.length - 1;
        }
        if (op === 'next') {
          self.currReadIndex = 0;
        }
        if (op === 'readPage') {
          if (percentage) {
            self.currReadIndex = Math.floor(ttsText.textsForTts.length * percentage);
          } else {
            self.currReadIndex = 0;
          }
        }
        self.readProgress = ((self.currReadIndex + 1) / ttsText.textsForTts.length) * 100;
      })
      .then(() => {
        return incrTtsUsageForVoices();
      })
      .then(() => {
        return setPlay(id, op);
      })
      .catch((err) => {
        if (err.message === 'ERR_TEXT_EDITED') {
          request['index'] = self.currReadIndex;
          stop(true);
          play(request, sender);
        } else {
          handleError(err, sender, op);
        }
      });
  }
  function isSameText() {
    return new Promise((resolve) => {
      chrome.tabs.sendMessage(self.beingReadTabId, {'fn': 'isSameText'}, (res) => {
        if (chrome.runtime.lastError) {
          resolve(true);
        }
        resolve(res);
      });
    }).catch(err => {
    });
  }
  function preview(request, sender, sendResponse) {
    return new Promise((resolve) => {
      self.previewVoiceKey = request.voice;
      if (self.tts === null || !isCorrectReaderType()) {
        setTts(widget.settings.voiceType);
        resolve();
      } else {
        resolve();
      }
    })
      .then(() => {
        let voice = null;
        if (request.voice) {
          voice = voices.voices[widget.settings.voiceType][request.voice];
        } else {
          voice = voices.voices[widget.settings.voiceType][widget.settings[widget.settings.voiceType + 'Voice']];
        }
        let langCode = voice.language.split('-')[0];
        let previewText = ttsText.previewTexts[langCode];
        if (!previewText) {
          previewText = ttsText.previewTexts['en'];
        }
        self.tts.play(previewText, null);
      })
      .catch((err) => {
      });
  }
  function handleError(err, sender, op = null) {
    err = err.message;
    if (err === 'ERR_INVALID_PLAY_ID') {
    } else if (err === 'READ_NEW') {
      stop();
      play(null, sender, null);
    } else if (err === 'ERR_PDF') {
      alertHandler.displayAlertMessage('ERR_PDF');
    } else if (err === 'ERR_NO_TEXT') {
      readAdjacentPage(op);
    } else if (err === 'ERR_NOT_READABLE' || err === 'ERR_INVALID_PAGE') {
      stop();
      alertHandler.displayAlertMessage(err);
    } else if (err === 'ERR_GOOGLE_DRIVE_PREVIEW') {
      alertHandler.displayAlertMessage('ERR_GOOGLE_DRIVE_PREVIEW');
    } else if (err == 1005) {
      pause();
      alertHandler.displayAlertMessage(err);
    } else if (err == 1006 || err == 'ERR_LICENSE_INVALID') {
      if (self.tts.type === 'online') {
        if (!self.tts.hasInvalidLicenseError) {
          self.tts.hasInvalidLicenseError = true;
          self.isWaitingForLicense = true;
          auth.updateLicense();
        } else {
          if (self.tts.invalidLicenseErrorCount > 0) {
            stop();
          }
        }
      }
    } else {
      stop();
    }
  }
  function setPlay(id, op = 'next') {
    self.isFirstRead = false;
    if (id === self.playId) {
      chrome.tabs.sendMessage(extension.activeTabId, {
        message: 'setCurrRead',
        index: self.currReadIndex,
        readProgress: self.readProgress,
        beingReadTabId: self.beingReadTabId,
        activeTabId: extension.activeTabId,
        texts: ttsText.textsForTts
      }, () => void chrome.runtime.lastError);
      return ttsPlay();
    } else {
      return Promise.reject(new Error("ERR_INVALID_PLAY_ID"));
    }
  }
  function incrTtsUsageForVoices() {
    let text = ttsText.textsForTts[self.currReadIndex].processed;
    if (text && text.length <= 0) {
      return Promise.resolve();
    }
    let userInfo = widget.settings.userInfo;
    if (userInfo && shouldIncrTtsUsageForVoice()) {
      let licenseNum = userInfo['license'] ? userInfo['license'] : '0';
      return utils.increaseTtsUsage(licenseNum, text.length)
        .catch((err) => {
          throw err;
        });
    }
  }
  function shouldIncrTtsUsageForVoice() {
    if (widget.settings.voiceType === 'prem') {
      if (voices.voices['prem'][widget.settings.premVoice].source === 'google') {
        setTts('free');
        return true;
      }
    }
    return false;
  }
  function setPlayId() {
    if (self.playId === undefined) {
      self.playId = 0;
    } else {
      self.playId++;
    }
    return self.playId;
  }
  function onEvent(event) {
    if (event.type === 'start') {
      self.isFirstRead = false;
      setReaderState('reading');
      setReadProgress();
      chrome.tabs.sendMessage(extension.activeTabId, {
        message: 'readerOnPlay',
        index: self.currReadIndex,
        readProgress: self.readProgress,
        beingReadTabId: self.beingReadTabId,
        activeTabId: extension.activeTabId,
        texts: ttsText.textsForTts
      }, () => void chrome.runtime.lastError);
    } else if (event.type === 'end') {
      setReaderState('init');
      playNext();
    } else if (event.type === 'pause') {
      setReaderState('pause');
      chrome.tabs.sendMessage(extension.activeTabId, {'message': 'readerOnPause'}, () => void chrome.runtime.lastError);
    } else if (event.type === 'loading') {
      setReaderState('loading');
      chrome.tabs.sendMessage(extension.activeTabId, {'message': 'readerOnLoading'}, () => void chrome.runtime.lastError);
    } else if (event.type === 'word') {
      if (self.beingReadTabId > 0 && self.beingReadTabId === extension.activeTabId) {
        chrome.tabs.sendMessage(self.beingReadTabId, {fn: 'setWordForMainTextAndCC', sentenceIndex: self.currReadIndex, word: event.word, wordIndex: event.wordIndex}, function(res) {
          if (chrome.runtime.lastError) { }
          chrome.tabs.sendMessage(self.beingReadTabId, {fn: 'highlightWord', sentenceIndex: self.currReadIndex, wordIndex: event.wordIndex}, () => void chrome.runtime.lastError);
        });
      }
    } else if (event.type === 'error') {
      handleError({message: event.err});
    }
  }
  function setReaderState(state) {
    self.readerState = state;
    widget.settings.readerState = state;
  }
  function ttsPlay() {
    let text = ttsText.textsForTts[self.currReadIndex].processed;
    return self.tts.play(text, self.currReadIndex, onEvent)
  }
  function playNext() {
    if (self.currReadIndex + 1 < ttsText.textsForTts.length) {
      self.currReadIndex++;
      play();
    } else {
      if (self.readOption === 'all') {
        readAdjacentPage('next', 'playNext');
      } else {
        stop(false);
        if ((self.readOption === 'selection' || self.readOption === 'selection-context-menu') &&
          widget.settings.isClickToRead) {
          self.readOption = 'all';
          self.isFirstRead = false;
          self.currReadIndex = 0;
          return setTextsForTts(null);
        }
      }
    }
  }
  function scrollToAdjacentPage(direction = 'next') {
    return new Promise(function(resolve) {
      if (self.beingReadTabId > 0) {
        chrome.tabs.sendMessage(self.beingReadTabId, {fn: 'scrollToAdjacentPage', direction: direction}, function(res) {
          if (chrome.runtime.lastError) { }
          resolve(res);
        })
      } else {
        resolve('ERR');
      }
    });
  }
  function scrollToPage(pageIndex) {
    return new Promise(function(resolve) {
      if (self.beingReadTabId > 0) {
        chrome.tabs.sendMessage(self.beingReadTabId, {fn: 'scrollToPage', pageIndex: pageIndex}, function(res) {
          if (chrome.runtime.lastError) { }
          resolve(res);
        })
      } else {
        resolve('ERR');
      }
    });
  }
  function reset(index = 0) {
    self.isFirstRead = true;
    setReaderState('init');
    self.currReadIndex = index;
    self.currPageIndex = 0;
    self.beingReadTabId = null;
    self.playId = undefined;
    self.readOption = 'all';
    ttsText.clearTexts();
    if (self.tts && self.tts['clearPreloads']) {
      self.tts.clearPreloads();
    }
  }
  function pause() {
    if (self.tts) {
      self.tts.pause();
    }
  }
  function stop(toReset = true) {
    chrome.tabs.sendMessage(extension.activeTabId, {'message': 'readerOnStop'}, () => void chrome.runtime.lastError);
    if (self.beingReadTabId > 0) {
      chrome.tabs.sendMessage(self.beingReadTabId, {'message': 'readerOnStop'}, () => void chrome.runtime.lastError);
    }
    if (self.tts) {
      self.tts.stop();
    }
    setReaderState('init');
    self.isFirstRead = true;
    if (toReset === true) {
      reset();
    }
  }
  function replay() {
    return new Promise((resolve) => {
      if (self.tts && self.tts.type === 'online' && self.tts['clearPreloads']) {
        self.tts.clearPreloads();
      }
      resolve();
    }).
      then(() => {
        if (self.readerState === 'reading' || self.readerState === 'loading') {
          self.tts.pause(false);
          play();
        }
      })
      .catch((err) => {
      });
  }
  function forward(request = {}, sender = {}, sendResponse = {}) {
    if (!self.isFirstRead) {
      pause();
      if (self.currReadIndex + 1 < ttsText.textsForTts.length) {
        self.currReadIndex++;
        play();
      } else {
        if (self.readOption === 'selection' || self.readOption === 'selection-context-menu') {
          self.currReadIndex = ttsText.textsForTts.length - 1;
          play();
        } else {
          self.readOption = 'all';
          readAdjacentPage('next', 'forward');
        }
      }
    }
  }
  function backward(request = {}, sender = {}, sendResponse = {}) {
    if (!self.isFirstRead) {
      pause();
      if (self.currReadIndex - 1 >= 0) {
        self.currReadIndex--;
        play();
      } else {
        if (self.readOption === 'selection' ||
          self.readOption === 'selection-context-menu') {
          self.currReadIndex = 0;
          play();
        } else {
          self.readOption = 'all';
          readAdjacentPage('prev', 'backward');
        }
      }
    }
  }
  function readAdjacentPage(op = "next", caller = null) {
    if (!op || (op !== 'prev' && op !== 'next')) {
      op = 'next';
    }
    return scrollToAdjacentPage(op)
      .then((resp) => {
        if (resp !== 'ERR') {
          ttsText.textsForTts = [];
          play({op: op, caller: caller});
        } else {
          if(caller === 'forward' || caller === 'backward' ){
            return play();
          }
          if (self.isFirstRead || !ttsText.textsForTts || ttsText.textsForTts.length === 0) {
            handleError({message: 'ERR_INVALID_PAGE'});
          }
          if (caller === 'playNext') {
            stop(false);
          }
        }
      })
      .catch((err) => {
      });
  }
  function setTextsForTtsWithoutPlay(request = {}, sender = {}, sendResponse = {}) {
    return setBeingReadTab(sender)
      .then(() => {
        return setDocType();
      })
      .then(() => {
        self.isFirstRead = false;
        return setTextsForTts(null);
      })
      .then(() => {
        sendResponse('done');
      })
      .catch((err) => {
        sendResponse('done');
        handleError(err, sender);
      });
  }
  function setTextsForTts(texts = null) {
    const temp = self.readerState;
    if (self.readerState === 'parsing') {
      return Promise.resolve();
    } else {
      self.readerState = 'parsing';
    }
    return pdfDoc.checkPDF()
      .then((res) => {
        if (res.isPdf) {
          return Promise.reject(new Error('ERR_PDF'));
        } else {
          return getTextsFromPage(texts);
        }
      })
      .then((texts) => {
        self.readerState = temp;
        if (texts === 'parsed') {
          chrome.tabs.sendMessage(extension.activeTabId, {message: 'textsToReadOnChange', texts: ttsText.textsForTts}, () => void chrome.runtime.lastError);
          return;
        } else if (texts && texts.length === 0) {
          ttsText.textsForTts = [];
          throw new Error('ERR_NO_TEXT');
        } else {
          texts = texts.map((text) => {return {original: text, processed: ttsText.processText(text)}});
          ttsText.textsForTts = texts;
          chrome.tabs.sendMessage(extension.activeTabId, {message: 'textsToReadOnChange', texts: ttsText.textsForTts}, () => void chrome.runtime.lastError);
        }
      });
  }
  function getTextsFromPage(texts = null) {
    return scriptInjector.executeScriptsForTextProcessor(self.beingReadTabId, self.docType)
      .then(function() {
        return new Promise((resolve, reject) => {
          if (!self.beingReadTabId) {
            reject(new Error('ERR_NO_TABID'));
          }
          if (texts) {
            chrome.tabs.sendMessage(self.beingReadTabId, {fn: 'resetDocInnerTexts'}, () => void chrome.runtime.lastError);
            chrome.tabs.sendMessage(self.beingReadTabId, {message: 'removeNRTags'}, () => void chrome.runtime.lastError);
            self.readOptionOfParsed = self.readOption;
            resolve(texts);
          } else {
            chrome.tabs.sendMessage(self.beingReadTabId, {fn: 'getCurrentIndex'}, function(currPageIndex) {
              if (chrome.runtime.lastError) { }
              if (currPageIndex === self.currPageIndex && ttsText.textsForTts.length > 0 && self.readOptionOfParsed === self.readOption) {
                resolve('parsed');
              } else {
                self.currPageIndex = currPageIndex;
                chrome.tabs.sendMessage(self.beingReadTabId, {fn: 'getTextsFromPage', op: self.readOption}, function(texts) {
                  if (chrome.runtime.lastError) { }
                  self.readOptionOfParsed = self.readOption;
                  resolve(texts);
                });
              }
            });
          }
        });
      });
  }
  function setReadProgress() {
    self.readProgress = ((self.currReadIndex + 1) / ttsText.textsForTts.length) * 100;
  }
  function getReaderInfo(request, sender, sendResponse) {
    sendResponse({
      index: self.currReadIndex,
      readProgress: self.readProgress,
      readerState: self.readerState,
      isFirstRead: self.isFirstRead,
      beingReadTabId: self.beingReadTabId,
      activeTabId: extension.activeTabId,
      readOption: self.readOption
    });
  }
  function getReadOption(request, sender, sendResponse) {
    sendResponse(self.readOption);
  }
  function setShouldCheckForPreviewMode(msg) {
    self.shouldCheckForPreviewMode = msg.val;
  }
  function setReadOption(option) {
    self.readOption = option;
  }
  function isCorrectReaderType() {
    const voiceType = widget.settings.voiceType;
    if (voiceType === 'prem' || voiceType === 'plus') {
      if ((voices.voices[voiceType][self.previewVoiceKey ? self.previewVoiceKey : widget.settings[voiceType + 'Voice']].source === 'google') &&
        self.tts.type !== 'free') {
        return false;
      } else if (self.tts.type !== 'online') {
        return false;
      } else {
        return true;
      }
    } else if (voiceType === 'free' && self.tts.type === 'online') {
      return false;
    } else {
      return true;
    }
  }
  function readIndex(request, sender, sendResponse) {
    let pageIndex = request && typeof request.pageIndex !== 'undefined' ? request.pageIndex : null;
    let senIndex = request && typeof request.index !== 'undefined' ? request.index : null;
    let percentage = request && typeof request.percentage !== 'undefined' ? request.percentage : 0;
    self.isFirstRead = false;
    if (self.tts === null || !isCorrectReaderType()) {
      setTts(widget.settings.voiceType);
    }
    if (senIndex !== null) {
      if (!isNaN(senIndex)) {
        if (senIndex >= 0 && senIndex < ttsText.textsForTts.length) {
          pause();
          self.currReadIndex = senIndex;
          play();
        } else if (senIndex >= 0 && senIndex == ttsText.textsForTts.length) {
          pause();
          self.currReadIndex = senIndex - 1;
          play();
        }
      }
    } else {
      if (pageIndex !== null) {
        if (!isNaN(pageIndex)) {
          pause();
          self.readOption = 'all';
          readPage(request.pageIndex, percentage);
        }
      }
    }
    //    
  }
  function readPage(pageIndex, percentage = 0) {
    pause();
    return scrollToPage(pageIndex)
      .then((resp) => {
        if (resp !== 'ERR') {
          ttsText.textsForTts = [];
          play({op: 'readPage', percentage: percentage});
        } else {
          stop();
          handleError({message: 'ERR_INVALID_PAGE'});
        }
      })
      .catch((err) => {
      });
  }
  async function readSelection(request, sender, sendResponse) {
    stop();
    let docType = await utils.getDocType();
    let tabId = (sender && sender.tab.id) ? sender.tab.id : extension.activeTabId;
    self.readOption = 'selection';
    return widget.injectWidget(tabId, docType, true)
      .then(() => {
        play(request, {tab: {id: tabId}}, sendResponse);
        chrome.tabs.sendMessage(tabId, {fn: 'hideReadIcon'}, () => void chrome.runtime.lastError);
      })
      .catch((err) => {
      });
  }
  async function readByCommand() {
    stop();
    let docType = await utils.getDocType();
    let tabId = extension.activeTabId;
    return widget.injectWidget(tabId, docType, true)
      .then(() => {
        self.readOption = 'all';
        play({caller: 'readBtn'}, {tab: {id: tabId}});
      })
      .catch((err) => {
      });
  }
  async function readSelectionWithContextMenu(sentences) {
    try {
      stop();
      let docType = await utils.getDocType();
      let tabId = extension.activeTabId;
      chrome.tabs.sendMessage(tabId, {fn: 'removeSelection'}, () => void chrome.runtime.lastError);
      self.readOption = 'selection-context-menu';
      await widget.injectWidget(tabId, docType, true);
      if (widget.settings.isAutoSelectVoice) {
        let lang = await utils.detectLanguage(sentences);
        voices.autoSelectVoice({lang: lang}, {tab: {id: tabId}});
      }
      chrome.tabs.sendMessage(tabId, {fn: 'hideReadIcon'}, () => void chrome.runtime.lastError);
      play({texts: sentences}, {tab: {id: tabId}});
    } catch (err) {
    }
  }
  function setReadIndex(request, sender, sendResponse) {
    self.currReadIndex = request.index;
  }
  init();
}
const reader = new Reader();