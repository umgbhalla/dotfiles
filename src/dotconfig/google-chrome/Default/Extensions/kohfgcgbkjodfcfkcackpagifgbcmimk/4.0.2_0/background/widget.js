function Widget() {
    const ReadSelectionCharAmountSelections = [1, 10, 15, 20, 30, 50, 100, 200, 300, 400, 500];
    let self = this;
    self.injectWidget = injectWidget;
    self.injectSD = injectSD;
    self.injectCC = injectCC;
    self.setWidgetUI = setWidgetUI;
    self.setWidgetSetting = setWidgetSetting;
    self.defaultSettings = {
        isVisible: false,
        mode: 'min',
        readerState: 'init',
        voiceType: 'prem',
        speed: 0,
        volume: 0.75,
        freeVoice: null,
        readIcon: true,
        beHighlighted: [],
        isAutoScroll: true,
        isCC: false,
        isDyslexic: false,
        isClickToRead: true,
        isDarkTheme: false,
        isAutoSelectVoice: false,
        preferredVoicesByLang: {},
        prevVoiceTypeBeforeAutoSelectsFree: '',
        showReadSelectionToPageEndOption: true,
        readSelectionOption: 'selection',
        highlightColour: 'light',
        userInfo: {licNum: 0, licCode: '0', license: '0', pwLicCode: '0', pwLicNum: '0', email: 'user@naturalreaders.com'},
        loggedIn: 0,
        LimitedReadSelectionOn: false,
        LimitedReadSelectionCharAmount: 20,
        backwardStep: 0,
        forwardStep: 0,
        backwardSkipNumber: [1, 2],
        forwardSkipNumber: [2, 4],
        returnNormalSkipTime: 2000,
        isMaxModeOpenedBefore: false
    };
    self.settings = self.defaultSettings;
    self.isAsyncFunction = isAsyncFunction;
    self.asyncFunctions = ['getWidgetSettings'];
    self.getWidgetSettings = getWidgetSettings;
    function init() {
        chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
            if (self[request['fn']]) {
                self[request.fn](request, sender, sendResponse);
                if (self.isAsyncFunction(request.fn)) {
                    return true;
                }
            }
        });
        initSettings();
    }
    function initSettings() {
        chrome.storage.sync.get(null, (result) => {
            if (chrome.runtime.lastError) {
            }
            self.settings.mode = result && result.mode ? result.mode : 'min';
            self.settings.voiceType = result && result.voiceType ? result.voiceType : 'prem';
            self.settings.freeVoice = result && result.freeVoice ? result.freeVoice : voices.defaultFreeVoice;
            self.settings.premVoice = result && result.premVoice ? result.premVoice : voices.defaultPremVoice;
            self.settings.plusVoice = result && result.plusVoice ? result.plusVoice : voices.defaultPlusVoice;
            self.settings.preset1Voice = result && result.preset1Voice ? result.preset1Voice : voices.defaultPremVoice;
            self.settings.preset2Voice = result && result.preset2Voice ? result.preset2Voice : voices.defaultPremVoice;
            self.settings.beHighlighted = result && result.beHighlighted ? result.beHighlighted : ['sentence', 'word'];
            self.settings.highlightColour = result && result.highlightColour ? result.highlightColour : 'light';
            self.settings.readIcon = result && result.readIcon != null ? result.readIcon : true;
            self.settings.isAutoScroll = result && 'isAutoScroll' in result ? result.isAutoScroll : true;
            self.settings.isCC = result && 'isCC' in result ? result.isCC : false;
            self.settings.isDyslexic = result && 'isDyslexic' in result ? result.isDyslexic : false;
            self.settings.isClickToRead = result && 'isClickToRead' in result ? result.isClickToRead : true;
            self.settings.isDarkTheme = result && 'isDarkTheme' in result ? result.isDarkTheme : false;
            self.settings.isAutoSelectVoice = result && 'isAutoSelectVoice' in result ? result.isAutoSelectVoice : false;
            self.settings.preferredVoicesByLang = result && 'preferredVoicesByLang' in result ? result.preferredVoicesByLang : voices.preferredVoicesByLang;
            voices.preferredVoicesByLang = self.settings.preferredVoicesByLang;
            self.settings.prevVoiceTypeBeforeAutoSelectsFree = result && 'prevVoiceTypeBeforeAutoSelectsFree' in result ? result.prevVoiceTypeBeforeAutoSelectsFree : '';
            self.settings.readSelectionOption = result && result.readSelectionOption ? result.readSelectionOption : 'selection';
            self.settings.showReadSelectionToPageEndOption = result && result.showReadSelectionToPageEndOption != null ? result.showReadSelectionToPageEndOption : true;
            self.settings.LimitedReadSelectionOn = result && result.LimitedReadSelectionOn != null ? result.LimitedReadSelectionOn : true;
            self.settings.LimitedReadSelectionCharAmount = result && result.LimitedReadSelectionCharAmount && ReadSelectionCharAmountSelections.indexOf(parseInt(result.LimitedReadSelectionCharAmount)) > -1 ? result.LimitedReadSelectionCharAmount : 20;
            self.settings.speed = result && result.speed ? result.speed : 0;
            self.settings.volume = result && 'volume' in result ? result.volume : 0.75;
            self.settings.userInfo = result && result.userInfo ? result.userInfo : {licNum: 0, licCode: '0', license: '0', pwLicCode: '0', pwLicNum: '0', email: 'user@naturalreaders.com'};
            self.settings.loggedIn = result && 'loggedIn' in result ? result.loggedIn : 0;
            self.settings.backwardStep = self.defaultSettings.backwardStep;
            self.settings.forwardStep = self.defaultSettings.forwardStep;
            self.settings.backwardSkipNumber = result && result.backwardSkipNumber ? result.backwardSkipNumber : self.defaultSettings.backwardSkipNumber;
            self.settings.forwardSkipNumber = result && result.forwardSkipNumber ? result.forwardSkipNumber : self.defaultSettings.forwardSkipNumber;
            self.settings.returnNormalSkipTime = result && result.returnNormalSkipTime ? result.returnNormalSkipTime : self.defaultSettings.returnNormalSkipTime;
            self.settings.isMaxModeOpenedBefore = result && 'isMaxModeOpenedBefore' in result ? result.isMaxModeOpenedBefore : false;
        });
    }
    function isAsyncFunction(fn) {
        if (self.asyncFunctions.includes(fn)) {
            return true;
        } else {
            return false;
        }
    }
    function injectWidget(tabId, docType, toShow, toStopReading = false) {
        return scriptInjector.canExecuteScript()
            .then(() => {
                return pdfDoc.isOnlinePdf()
            })
            .then((res) => {
                return new Promise((resolve) => {
                    if (!res) {
                        if (toStopReading && reader.beingReadTabId > 0 && tabId !== reader.beingReadTabId) {
                            reader.stop();
                        }
                        chrome.tabs.sendMessage(tabId, {fn: "getHasWidget"}, function(hasWidget) {
                            if (chrome.runtime.lastError) {
                                return scriptInjector.executeScriptsForTextProcessor(tabId, docType)
                                    .then(() => {
                                        return injectCC(tabId);
                                    })
                                    .then(() => {
                                        chrome.tabs.executeScript(tabId, {file: "injected/nr-ext-widget/nr-ext-widget.js"}, function() {
                                            if (chrome.runtime.lastError) {
                                            }
                                            reader.beingReadTabId = tabId;
                                            chrome.tabs.sendMessage(tabId, {message: "injectWidget", showWelcome: extension.showWelcome}, function(res) {
                                                if (chrome.runtime.lastError) {
                                                }
                                                resolve();
                                            });
                                            injectSD(tabId, docType);
                                        });
                                    });
                            }
                            if (hasWidget) {
                                reader.beingReadTabId = tabId;
                                chrome.tabs.sendMessage(tabId, {fn: "toggleWidget", toShow: toShow, tabId: tabId, beingReadTabId: reader.beingReadTabId, activeTabId: extension.activeTabId}, () => void chrome.runtime.lastError);
                                resolve();
                            }
                        });
                    } else {
                        resolve();
                    }
                });
            })
            .catch((err) => {
            });
    }
    function injectSD(tabId, docType) {
        chrome.tabs.sendMessage(tabId, {fn: "getHasIcon"}, function(hasIcon) {
            if (chrome.runtime.lastError) {
                injectSDHelper(tabId, docType);
            } else {
                if (!hasIcon) {
                    injectSDHelper(tabId, docType);
                }
            }
        });
    }
    function injectCC(tabId) {
        return new Promise((resolve) => {
            chrome.tabs.sendMessage(tabId, {fn: "getHasCC"}, async function(hasCC) {
                if (chrome.runtime.lastError) {
                    await injectCCHelper(tabId);
                    resolve();
                } else {
                    if (!hasCC) {
                        await injectCCHelper(tabId);
                        resolve();
                    } else {
                        resolve();
                    }
                }
            });
        })
            .catch(err => {
            });
    }
    function injectCCHelper(tabId) {
        return new Promise((resolve) => {
            chrome.tabs.executeScript(tabId, {file: "injected/nr-ext-cc/nr-ext-cc.js"}, () => {
                if (chrome.runtime.lastError) {
                    resolve();
                }
                chrome.tabs.sendMessage(tabId, {
                    message: "injectCC",
                    toShow: widget.settings.isCC && reader.readerState === 'reading',
                    isCC: widget.settings.isCC
                }, function(res) {
                    if (chrome.runtime.lastError) {
                        resolve();
                    }
                    resolve();
                });
            })
        })
            .catch(err => {
            });
    }
    function injectSDHelper(tabId, docType) {
        chrome.tabs.executeScript(tabId, {file: "assets/js/jquery-3.6.0.min.js"}, () => {
            if (chrome.runtime.lastError) {
            }
            chrome.tabs.executeScript(tabId, {file: "injected/nr-ext-dom/nr-ext-text-processor/nr-ext-text-processor.js"}, () => {
                if (chrome.runtime.lastError) {
                }
                if (docType === 'google doc') {
                    chrome.tabs.executeScript(tabId, {file: "injected/nr-ext-dom/nr-ext-text-processor/google-doc-utils.js"}, () => {
                        if (chrome.runtime.lastError) {
                        }
                        chrome.tabs.executeScript(tabId, {file: "injected/nr-ext-dom/nr-ext-dom-detector.js"}, () => {
                            if (chrome.runtime.lastError) {
                            }
                            chrome.tabs.sendMessage(tabId, {
                                message: "injectSD",
                                value: {
                                    'iconState': self.settings.readIcon,
                                    'LimitedReadSelectionOn': self.settings.LimitedReadSelectionOn,
                                    'LimitedReadSelectionCharAmount': self.settings.LimitedReadSelectionCharAmount
                                }
                            }, () => void chrome.runtime.lastError);
                        })
                    });
                } else {
                    chrome.tabs.executeScript(tabId, {file: "injected/nr-ext-dom/nr-ext-dom-detector.js"}, () => {
                        if (chrome.runtime.lastError) {
                        }
                        chrome.tabs.sendMessage(tabId, {
                            message: "injectSD",
                            value: {
                                'iconState': self.settings.readIcon,
                                'LimitedReadSelectionOn': self.settings.LimitedReadSelectionOn,
                                'LimitedReadSelectionCharAmount': self.settings.LimitedReadSelectionCharAmount
                            }
                        }, () => void chrome.runtime.lastError);
                    })
                }
            });
        });
    }
    function setWidgetUI(tabId) {
        if (tabId) {
            chrome.tabs.sendMessage(tabId, {fn: "getHasWidget"}, function(hasWidget) {
                if (chrome.runtime.lastError) {
                }
                if (hasWidget) {
                    chrome.tabs.sendMessage(tabId, {fn: "setWidgetUI"}, () => void chrome.runtime.lastError);
                }
            });
        }
    }
    function setWidgetSetting(request, sender, sendResponse) {
        let tabId = reader.beingReadTabId ? reader.beingReadTabId : extension.activeTabId;
        if (request.key === 'voiceType' && request.value !== self.settings.voiceType) {
            reader.setTts(request.value);
            reader.replay();
        } else if ((request.key == 'freeVoice' || request.key == 'premVoice' || request.key == 'plusVoice')) {
            if (!request.isAutoSelected) {
                voices.rememberPreferredVoiceByLang(request.key.split('Voice')[0], request.value);
            }
            if (request.value !== self.settings[request.key]) {
                reader.setTts(self.settings.voiceType);
                reader.replay();
            }
        } else if (request.key === 'speed' && request.value !== self.settings.speed) {
            reader.replay();
        } else if (request.key === 'volume' && request.value !== self.settings.volume) {
            reader.replay();
        } else if (request.key === 'beHighlighted') {
            chrome.tabs.sendMessage(tabId, {message: 'beHighlightedOnChange', beHighlighted: request.value, highlightColour: self.settings.highlightColour}, () => void chrome.runtime.lastError);
        } else if (request.key === 'highlightColour') {
            chrome.tabs.sendMessage(tabId, {message: 'highlightColourOnChange', highlightColour: request.value, oldHighlightColour: self.settings.highlightColour, beHighlighted: self.settings.beHighlighted, readerState: self.settings.readerState}, () => void chrome.runtime.lastError);
        } else if (request.key === 'isAutoScroll') {
            chrome.tabs.sendMessage(tabId, {message: 'isAutoScrollOnChange', isAutoScroll: request.value}, () => void chrome.runtime.lastError);
        } else if (request.key === 'LimitedReadSelectionCharAmount') {
            chrome.tabs.sendMessage(tabId, {message: 'setLimit', value: request.value}, () => void chrome.runtime.lastError)
        } else if (request.key === 'isVisible') {
            chrome.tabs.sendMessage(tabId, {message: 'isVisibleOnChange', isVisible: request.value, mode: self.settings.mode}, () => void chrome.runtime.lastError);
        }
        self.settings[request.key] = request.value;
        let obj = {};
        obj[request.key] = request.value;
        storage.set(obj);
        if (request.toPlay) {
            reader.play();
        }
        //
    }
    function getWidgetSettings(request, sender, sendResponse) {
        if (request.key) {
            sendResponse(self.settings[request.key]);
        } else {
            sendResponse(self.settings);
        }
    }
    init();
}
const widget = new Widget();
