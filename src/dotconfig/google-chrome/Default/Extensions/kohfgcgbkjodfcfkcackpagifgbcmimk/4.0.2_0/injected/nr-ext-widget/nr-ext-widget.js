function NRExtWidget() {
    let self = this;
    self.readerState = 'init';
    self.frame = null;
    self.widgetDocument = null;
    self.hasWidget = false;
    self.isVoicesInit = false;
    self.mode = 'min';
    self.isVisible = false;
    self.isAutoSelectVoice = false;
    self.isInjectingWidget = false;
    self.showWelcome = false;
    self.isAsyncFunction = isAsyncFunction;
    self.asyncFunctions = ['getHasTextProcessor', 'getHasWidget', 'injectWidget'];
    self.getHasTextProcessor = getHasTextProcessor;
    self.getHasWidget = getHasWidget;
    self.injectWidget = injectWidget;
    self.setWidgetUI = setWidgetUI;
    self.toggleWidget = toggleWidget;
    self.voicesOnLoad = voicesOnLoad;
    self.getWidgetElements = getWidgetElements;
    self.setPresetAsSelectedVoice = setPresetAsSelectedVoice;
    self.showRelocateButton = showRelocateButton;
    self.hideRelocateButton = hideRelocateButton;
    self.readSelection = readSelection;
    self.setCCText = setCCText;
    self.loginBtnText = 'Log In';
    self.logoutBtnText = 'Log Out';
    self.signupBtnText = 'Sign Up';
    self.defaultEmail = 'user@naturalreaders.com';
    self.freeUserText = 'Free User';
    self.premUserText = 'Premium User';
    self.plusUserText = 'Plus User';
    self.eduPremUserText = 'Edu Premium Group User';
    self.freeEduPremUserText = 'Free Edu Premium Group User';
    self.eduPremUserExpiredText = 'Edu Premium Group User (Expired)';
    self.loadingTimer = null;
    self.voiceType = 'prem';
    self.texts = null;
    self.progressTimeIncrementor = null;
    let isMenuOpenedFromMin = false;
    let isMaxModeOpenedBefore = false;
    const autoSelectVoiceTooltipText = 'Auto-detects the language and changes the voice to suit. English (US) is used if it cannot be detected.';
    const convertTooltipText = 'Convert selected text to mp3 for personal use (Premium & Plus users only).';
    const restartTooltipText = 'Clear settings & login information, reload & restart the extension.';
    const peTooltipText = 'Fine-tune pronunciation using word substitution. (Login Required)';
    const clickToReadTooltipText = 'Click on any text to read from there. Note that in Google Docs, the feature is disabled when paused.';
    const uploadTooltipText = 'you can upload files like: pdf, txt, docs,epub, ods, odt, pages, pptx, png, and jped';
    let elementIds = {
        widgetBody: 'nr-ext-body',
        container: 'ext-container',
        closeBtn: 'btn_exit',
        uploadDragAndDrop: 'nr-ext-drag-and-drop',
        uploadFinishDragAndDrop:'nr-ext-drag-and-drop-finish',
        uploadErrorDragAndDrop:'nr-ext-drag-and-drop-error',
        uploadBrowseBtn: 'nr-ext-btn-upload-browse',
        openFileBtn: 'nr-ext-btn-open-file',
        uploadDiffFileBtn: 'nr-ext-btn-upload-diff-file',
        uploadProgress: 'nr-ext-upload-progress',
        uploadFileName: 'nr-ext-upload-filename',
        uploadErrorMsg: 'nr-ext-upload-error',
        uploadTryAgainBtn: 'nr-ext-btn-upload-try-again',
        inputTextsBtn: 'nr-ext-btn-input-texts',
        readBtn: 'btn_play',
        forwardBtn: 'btn_forward',
        backwardBtn: 'btn_rewind',
        stopBtn: 'btn_stop',
        clickToReadToggle: 'nr-ext-click-to-read-toggle',
        clickToReadTooltip: 'nr-ext-tooltip-click',
        peBtn: "nr-ext-btn-pe",
        peTooltip: 'nr-ext-tooltip-pe',
        convertBtn: 'nr-ext-btn-convert',
        convertTooltip: 'nr-ext-tooltip-convert',
        ccBtn: 'cc',
        ccBtnText: 'ccBtnText',
        ccToggle: 'nr-ext-cc-toggle',
        dyslexiaToggle: 'nr-ext-dyslexia-toggle',
        autoScrollToggle: 'nr-ext-autoscroll-toggle',
        darkThemeToggle: 'nr-ext-theme-toggle',
        loginBtn: "loginBtn",
        logoutBtn: 'logoutBtn',
        signupBtn: "signupBtn",
        loginLogoutBtnMobile: "loginLogoutBtnMobile",
        signupBtnMobile: "signupBtnMobile",
        refreshLicenseBtn: 'nr-ext-refresh-license-btn',
        refreshLicenseBtnIcon: 'nr-ext-refresh-license-icon',
        premUpgradeBtn: 'prem-upgrade',
        freePlusUpgradeBtn: 'free-plus-upgrade',
        premPlusUpgradeBtn: 'prem-plus-upgrade',
        userLicType: "userLicType",
        noFreeVoices: 'nr-ext-no-free-voices',
        noFreeVoicesReloadBtn: 'nr-ext-no-free-voices-reload-btn',
        voiceList: 'nr-ext-voice-list',
        freeVoice: 'nr-ext-voice-free',
        premVoice: 'nr-ext-voice-prem',
        plusVoice: 'nr-ext-voice-plus',
        preset1Voice: 'nr-ext-voice-preset1',
        preset2Voice: 'nr-ext-voice-preset2',
        freeVoiceList: 'nr-ext-free-voice-list',
        premVoiceList: 'nr-ext-prem-voice-list',
        plusVoiceList: 'nr-ext-plus-voice-list',
        preset1VoiceList: 'nr-ext-preset1-voice-list',
        preset2VoiceList: 'nr-ext-preset2-voice-list',
        freeVoiceListMapper: 'nr-ext-free-voice-list-mapper',
        premVoiceListMapper: 'nr-ext-prem-voice-list-mapper',
        plusVoiceListMapper: 'nr-ext-plus-voice-list-mapper',
        preset1VoiceListMapper: 'nr-ext-preset1-voice-list-mapper',
        preset2VoiceListMapper: 'nr-ext-preset2-voice-list-mapper',
        readIconOn: 'nr-ext-read-selection',
        highlightMode: 'highlight-mode',
        highlightModeText: 'nr-ext-highlight-mode-text',
        highlightModeMenu: 'nr-ext-highlight-mode-menu',
        highlightColour: 'highlight-color',
        highlightColourText: 'nr-ext-highlight-colour-text',
        highlightColourMenu: 'nr-ext-highlight-color-menu',
        autoSelectVoice: 'nr-ext-auto-select-voice',
        autoSelectVoiceTooltip: 'nr-ext-tooltip-auto-select-voice',
        reloadBtn: 'nr-ext-reload-btn',
        restartTooltip: 'nr-ext-tooltip-restart-reader',
        selectableCharLimit: 'nr-ext-menu-rs-char-limit',
        selectedCharLimit: 'nr-ext-read-selection-text',
        hotkeysBtn: 'hotkeys',
        speedValue: 'nr-ext-speed-slider-value-sender',
        volumeValue: 'nr-ext-volume-slider-value-sender',
        ccContainer: 'nr-ext-cc',
        closeCC: 'btn-close-cc',
        ccText: 'nr-ext-cc-text',
        progressMax: 'nr-ext-progress-max-sender',
        progressValue: 'nr-ext-progress-value-sender',
        progressTimeTotal: 'nr-ext-progress-time-total',
        progressTimeCurr: 'nr-ext-progress-time-curr',
        progressLabel: 'ext-progress-label',
        progressSlider: 'ext-progress-slider',
        progressContainer: 'ext-progress-container',
        issuesBtn: 'ext-btn-report-issues',
        convertToPdfBtn: 'nr-ext-btn-convert-to-pdf',
        saveToMobileErrorMsg: 'nr-ext-mobile-error',
        saveToMobileTryAgainBtn: 'nr-ext-btn-mobile-try-again',
        downloadAndroidBtn: 'nr-ext-download-android',
        downloadIosBtn: 'nr-ext-download-ios',
        maxBtn: 'btn_max',
        minBtn: 'btn_min',
        profileBtn: 'btn_profile',
        profileClose: 'profile-close',
        menuContainer: 'nr-ext-menu',
        menuTrigger: 'btn_settings',
        openSettingsIcon: 'nr-ext-icon-open-settings',
        closeSettingsIcon: 'nr-ext-icon-close-settings',
        profileContainer: 'ext-profile-container',
        preferenceBtn: 'nr-ext-btn-preference',
        closePreferenceBtn: 'nr-ext-btn-close-preference',
        presetVoiceListBtn: 'nr-ext-btn-preset-voices',
        closePresetVoiceListBtn: 'nr-ext-close-preset-voice-list',
        uploadTrigger: 'upload-trigger',
        mobileTrigger: 'mobile-trigger',
        voiceTrigger: 'voice-trigger',
        settingsTrigger: 'settings-trigger',
        highlightBtn: 'btn_highlight',
        highlightClose: 'highlight_close',
        readSelectionBtn: 'btn_selection',
        closeCaptionsSettingsBtn: 'nr-ext-closed-captions',
        uploadMenu: 'upload-menu',
        mobileMenu: 'mobile-menu',
        voiceMenu: 'voice-menu',
        settingsMenu: 'settings-menu',
        settingsTitle: 'settings-title',
        launchContainer: 'nr-ext-launch',
        launchClose: 'launch-close',
        launchClose2: 'launch-close2',
        launchClose3: 'launch-close3',
        launchStep2: 'launch-step2',
        launchStep3: 'launch-step3',
        relocateBtn: 'nr-ext-btn-relocate',
        uploadTooltip: 'nr-ext-tooltip-upload'
    }
    let highlightMode = {
        all: {
            key: 'all',
            value: ['sentence', 'word'],
            text: 'Sentence and word'
        },
        sentence: {
            key: 'sentence',
            value: ['sentence'],
            text: 'Sentence only'
        },
        word: {
            key: 'word',
            value: ['word'],
            text: 'Word only'
        },
        none: {
            key: 'none',
            value: [],
            text: 'None'
        }
    };
    let highlightColour = {
        light: {
            key: 'light',
            value: 'light',
            text: 'Light'
        },
        dark: {
            key: 'dark',
            value: 'dark',
            text: 'Dark'
        },
        ice: {
            key: 'ice',
            value: 'ice',
            text: 'Ice'
        },
        warm: {
            key: 'warm',
            value: 'warm',
            text: 'Warm'
        }
    }
    self.frameStyles = {
        "default": {
            width: '280px',
            height: '64px',
            top: '12px',
            right: '12px',
            background: 'transparent',
            'border-radius': '32px 0 0 32px',
            'box-shadow': "4px 4px 20px rgba(0, 0, 0, 0.08), -4px -4px 20px rgba(0, 0, 0, 0.08)"
        },
        "welcome": {
            width: '280px',
            height: '250px',
            top: '12px',
            right: '12px',
            background: 'transparent',
            'border-radius': '32px 0 0 0',
            'box-shadow': "4px 4px 20px rgba(0, 0, 0, 0.08), -4px -4px 20px rgba(0, 0, 0, 0.08)"
        },
        "settings": {
            width: '100%',
            height: '100%',
            bottom: '0',
            left: '0',
            background: 'transparent',
            'border-radius': '0',
            'box-shadow': 'rgba(0,0,0,0.3) 0px -3px 8px'
        },
        "min": {
            width: '104px',
            height: '56px',
            top: '109px',
        },
        "max": {
            width: '320px',
            height: '100px',
            top: '109px',
        },
        "profile": {
            width: '320px',
            height: '464px',
            top: '109px',
        },
        "menu": {
            width: '320px',
            height: '380px',
            top: '109px',
        },
    }
    const speedToCharsPerSecond = {
        '9': 39.6,
        '8': 36.3,
        '7': 31.1,
        '6': 29.1,
        '5': 25.6,
        '4': 22.9,
        '3': 20.8,
        '2': 18.2,
        '1': 16.1,
        '0': 14.5,
        '-1': 13.2,
        '-2': 11.8,
        '-3': 10.6,
        '-4': 9.7,
        '-5': 8.5,
        '-6': 7.6,
        '-7': 6.9,
        '-8': 6.1,
        '-9': 5.5
    }
    self.indexToProgressTime = {}
    self.isAutoScroll = true;
    self.isDyslexic = false;
    self.isClickToRead = true;
    self.isCC = false;
    self.isDarkTheme = false;
    var over = false;
    let readOption = 'all';
    self.uploadPdfUrl = '';
    function isCCElement(id) {
        if (id === 'ccContainer' ||
            id === 'closeCC' ||
            id === 'ccText') {
            return true;
        } else {
            return false;
        }
    }
    function mobileAndTabletcheck() {
        var check = false;
        (function(a) {if (/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino|android|ipad|playbook|silk/i.test(a) || /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0, 4))) check = true;})(navigator.userAgent || navigator.vendor || window.opera);
        return check;
    };
    async function init() {
        try {
            await initWidgetElements();
            await bindUIEvents();
            await setWidgetUI();
            if (!self.isVoicesInit) {
                await setUIVoiceLists();
            }
        } catch (err) {
        }
    }
    function initWidgetElements() {
        return new Promise((resolve) => {
            for (let id in elementIds) {
                if (isCCElement(id)) {
                    self[id] = nrCC.ccDocument.getElementById(elementIds[id]);
                } else {
                    self[id] = self.widgetDocument.getElementById(elementIds[id]);
                }
            }
            resolve();
        })
            .catch((err) => {
            });
    }
    function loadResources(urls) {
        let promises = [];
        for (let i = 0; i < urls.length; i++) {
            promises.push(loadResource(null, chrome.runtime.getURL(urls[i])));
        }
        return Promise.all(promises)
            .catch((err) => {
            });
    }
    function loadResource(type, url) {
        return new Promise((resolve, reject) => {
            let tag;
            if (!type) {
                let match = url.match(/\.([^.]+)$/);
                if (match) {
                    type = match[1];
                }
            }
            if (!type) {
                type = "js";
            }
            if (type === 'css') {
                tag = document.createElement("link");
                tag.type = 'text/css';
                tag.rel = 'stylesheet';
                tag.href = url;
                self.widgetDocument.head.appendChild(tag);
            }
            else if (type === "js") {
                tag = document.createElement("script");
                tag.type = "text/javascript";
                tag.src = url;
                self.widgetDocument.body.appendChild(tag);
            }
            if (tag) {
                tag.onload = () => {
                    resolve(url);
                };
                tag.onerror = () => {
                    reject(url);
                };
            }
        })
            .catch((err) => {
            });
    }
    function setWidgetUI(request, sender, sendResponse) {
        let widgetSettings = null;
        return new Promise((resolve) => {
            chrome.runtime.sendMessage({fn: 'getWidgetSettings'}, async (_widgetSettings) => {
                if (chrome.runtime.lastError) { }
                widgetSettings = _widgetSettings;
                self.readerState = widgetSettings.readerState;
                self.voiceType = widgetSettings.voiceType;
                setUserUI(widgetSettings.userInfo, widgetSettings.loggedIn);
                let mode = highlightMode.none;
                if (widgetSettings.beHighlighted.length > 0) {
                    if (widgetSettings.beHighlighted.length > 1) {
                        mode = highlightMode.all;
                    } else {
                        mode = highlightMode[widgetSettings.beHighlighted[0]];
                    }
                }
                updateUIDropdownCurrentText(self.highlightMode, mode.text);
                setUISelectedDropdownItemByValue(self.highlightModeMenu, mode.key);
                let colour = highlightColour.light;
                for (let _colour in highlightColour) {
                    if (highlightColour[_colour].value == widgetSettings.highlightColour) {
                        colour = highlightColour[_colour];
                        break;
                    }
                }
                updateUIDropdownCurrentText(self.highlightColour, colour.text);
                updateUIDropdownCurrentHighlightColourIcon(self.highlightColour, 'nr-ext-color-', colour.value);
                setUISelectedDropdownItemByValue(self.highlightColourMenu, colour.key);
                setAutoScroll(widgetSettings.isAutoScroll);
                self.isClickToRead = widgetSettings.isClickToRead;
                setIsCC(widgetSettings.isCC);
                setCCBackgroundColour(widgetSettings.highlightColour);
                setDyslexia(widgetSettings.isDyslexic);
                setIsDarkTheme(widgetSettings.isDarkTheme);
                setAutoSelectVoice(widgetSettings.isAutoSelectVoice);
                if (!self.isVoicesInit) {
                    await setUIVoiceLists();
                } else {
                    updateVoice(widgetSettings);
                    invokeVoiceListOnChangeEvent(self.preset1VoiceListMapper, widgetSettings.preset1Voice);
                    invokeVoiceListOnChangeEvent(self.preset2VoiceListMapper, widgetSettings.preset2Voice);
                }
                setSpeedSliderValue(widgetSettings.speed, false);
                setVolumeSliderValue(widgetSettings.volume, false);
                setReadIcon(widgetSettings.readIcon);
                initReadSelectionCharLimit(widgetSettings.LimitedReadSelectionCharAmount);
                setReaderUI();
                setProgressUI();
                initTooltip(self.clickToReadTooltip, 'top', clickToReadTooltipText);
                initTooltip(self.peTooltip, 'top', peTooltipText);
                initTooltip(self.restartTooltip, 'top', restartTooltipText);
                initTooltip(self.convertTooltip, 'top', convertTooltipText);
                initTooltip(self.autoSelectVoiceTooltip, 'bottom', autoSelectVoiceTooltipText);
                initTooltip(self.profileBtn, 'right', 'Profile');
                initTooltip(self.stopBtn, 'left', 'Stop');
                initTooltip(self.relocateBtn, 'right', 'Relocate text');
                initTooltip(self.minBtn, 'left', 'Minimize');
                initTooltip(self.maxBtn, 'left', 'Maximize');
                initTooltip(self.closeBtn, 'left', 'Close');
                initTooltip(self.menuTrigger, 'left', 'Settings');
                initTooltip(self.logoutBtn, 'left', 'Log Out');
                initTooltip(self.refreshLicenseBtn, 'left', 'Reload License');
                initTooltip(self.uploadTooltip, 'left', uploadTooltipText);
                setWidgetMode(widgetSettings.mode);
                if (self.showWelcome) {
                    setWidgetMode('max');
                    setMenuStatus(self.container, 'data-launch', 'true');
                    self.showWelcome = false;
                    chrome.runtime.sendMessage({fn: 'setShowWelcome', val: false}, () => void chrome.runtime.lastError);
                }
                resolve();
            });
        })
            .then(() => {
                if (widgetSettings.isVisible) {
                    if (request && ((request.beingReadTabId && request.beingReadTabId === request.tabId && request.activeTabId === request.tabId) ||
                        (!request.beingReadTabId && request.tabId && request.activeTabId === request.tabId))) {
                        setWidgetVisibility(true);
                    } else {
                        setWidgetVisibility(false);
                    }
                } else {
                    setWidgetVisibility(false);
                }
            })
            .catch((err) => {
            });
    }
    function setWidgetMode(mode) {
        self.mode = mode;
        if (mode === 'max') {
            configureWidgetFrame('max');
            $(self.container).attr('data-size', 'max');
            dynamicHeight();
            if (self.readerState !== 'init') {
                setProgressUI();
            }
            setWidgetSetting('mode', 'max');
        } else {
            configureWidgetFrame('min');
            $(self.container).attr('data-size', 'min');
            var currentMenu = $(self.container).attr('menu-status');
            var currentClose = currentMenu + 'Close';
            $(self[currentClose]).click();
            setWidgetSetting('mode', 'min');
        }
    }
    function toggleWelcome(val) {
        if (val) {
        } else {
            self.welcome.style.display = 'none';
            self.frame.style.borderRadius = '32px 0 0 32px';
            updateFrameHeight(64);
            self.showWelcome = false;
        }
    }
    function updateVoice(widgetSettings) {
        let activeSpeakerTabButton = self[widgetSettings.voiceType + 'Voice'];
        const event = new Event('click');
        activeSpeakerTabButton.dispatchEvent(event);
    }
    function initReadSelectionCharLimit(charLimit) {
        const charLimitString = charLimit + " characters";
        self.selectedCharLimit.innerText = charLimitString;
    }
    function setReadSelectionCharLimit(e) {
        const selectedText = e.target.innerText;
        const charLimit = parseInt(selectedText.split(' ')[0], 10);
        self.selectedCharLimit.innerText = selectedText;
        setWidgetSetting('LimitedReadSelectionCharAmount', charLimit);
    }
    function setUIVoiceLists() {
        return new Promise(function(resolve) {
            chrome.runtime.sendMessage({fn: 'getIsSettingVoices'}, function(isSettingVoices) {
                if (chrome.runtime.lastError) { }
                if (!isSettingVoices) {
                    setUIFreeVoiceList();
                    setUIPremVoiceList();
                    setUIPlusVoiceList();
                    setUIPresetVoiceLists();
                    selectVoiceType(self.voiceType);
                    self.isVoicesInit = true;
                }
                resolve();
            });
        })
            .catch(err => {
            });
    }
    function setUIPresetVoiceLists() {
        chrome.runtime.sendMessage({fn: 'getVoices', type: 'all'}, (voices) => {
            if (chrome.runtime.lastError) { }
            populateVoiceList('preset1VoiceList', voices);
            populateVoiceList('preset2VoiceList', voices);
        });
    }
    function setUIFreeVoiceList() {
        chrome.runtime.sendMessage({fn: 'getVoices', type: 'free'}, (freeVoices) => {
            if (chrome.runtime.lastError) { }
            if (freeVoices && Object.keys(freeVoices).length > 0) {
                if (self.noFreeVoices) {
                    self.noFreeVoices.remove();
                    self.noFreeVoicesReloadBtn.remove();
                }
                populateVoiceList('freeVoiceList', freeVoices);
            } else {
                self.noFreeVoices.innerHTML = 'No voices are available on your device or there might be a problem when retrieving the voices. Please try re-installing the extension, closing other TTS applications or clicking the "Restart Reader" button below. Sorry for the inconvenience. If problem persists, please contact us.';
                self.noFreeVoicesReloadBtn.style.display = 'block';
            }
        });
    }
    function setUIPremVoiceList() {
        chrome.runtime.sendMessage({fn: 'getVoices', type: 'prem'}, (premVoices) => {
            if (chrome.runtime.lastError) { }
            populateVoiceList('premVoiceList', premVoices);
        });
    }
    function setUIPlusVoiceList() {
        chrome.runtime.sendMessage({fn: 'getVoices', type: 'plus'}, (plusVoices) => {
            if (chrome.runtime.lastError) { }
            populateVoiceList('plusVoiceList', plusVoices);
        });
    }
    function populateVoiceList(target, voices) {
        let voiceItemsTarget = target;
        let voiceListMapperTarget = target + 'Mapper';
        populateVoiceItems(voiceItemsTarget, voices);
        populateVoiceListMapper(voiceListMapperTarget, voices);
        let widgetSettings = null;
        chrome.runtime.sendMessage({fn: 'getWidgetSettings'}, async (_widgetSettings) => {
            if (chrome.runtime.lastError) { }
            widgetSettings = _widgetSettings;
            if (voiceListMapperTarget == widgetSettings.voiceType + 'VoiceListMapper') {
                invokeVoiceListOnChangeEvent(self[widgetSettings.voiceType + 'VoiceListMapper'], widgetSettings[widgetSettings.voiceType + 'Voice']);
            } else if (voiceListMapperTarget == 'preset1VoiceListMapper') {
                invokeVoiceListOnChangeEvent(self.preset1VoiceListMapper, widgetSettings['preset1Voice']);
            } else if (voiceListMapperTarget == 'preset2VoiceListMapper') {
                invokeVoiceListOnChangeEvent(self.preset2VoiceListMapper, widgetSettings['preset2Voice']);
            }
        });
    }
    function populateVoiceItems(target, voices) {
        const voiceMenu = self[target];
        voiceMenu.innerHTML = '';
        for (let voice in voices) {
            if (target.includes('free') && voices[voice].isPrem) {
                continue;
            }
            const cell = document.createElement("div");
            cell.classList.add('nr-ext-voice-cell');
            const label = document.createElement("label");
            label.classList.add('nr-ext-selectable');
            const voiceName = document.createElement("div");
            voiceName.classList.add("voice");
            voiceName.innerText = getLanguageName(voices[voice]['language']) + " - " + voices[voice]['name'];
            if (target.includes('preset')) {
                label.classList.add('preset-voice');
                voiceName.innerText = voices[voice].type === 'free' ? 'Free: ' + voiceName.innerText : (voices[voice].type === 'prem' ? 'Premium: ' : 'Plus: ') + voiceName.innerText;
                label.appendChild(voiceName);
                cell.appendChild(label);
            } else {
                label.classList.add('voice-detail');
                label.htmlFor = 'nr-ext-' + voices[voice]['key'];
                const imgFlag = document.createElement("div");
                const flagClass = matchFlagWithLocale(voices[voice]['language']);
                if (flagClass !== 'nr-unknown-locale') {
                    imgFlag.classList.add('nr-sprite');
                }
                imgFlag.classList.add(flagClass);
                const previewVoiceBtn = document.createElement("button");
                previewVoiceBtn.classList.add("ext-icon-button");
                previewVoiceBtn.classList.add("nr-ext-preview-voice");
                previewVoiceBtn.innerHTML = `<svg class="icon"><use xlink:href="#play_circle_filled"></use></svg>`;
                previewVoiceBtn.onclick = () => {preview(voices[voice]['key'])};
                cell.onmouseover = () => {
                    if (self.readerState !== 'reading' && self.readerState !== 'loading') {
                        previewVoiceBtn.style.display = 'inline-block';
                    } else {
                        previewVoiceBtn.style.display = 'none';
                    }
                }
                cell.onmouseleave = () => {
                    previewVoiceBtn.style.display = 'none';
                }
                label.appendChild(imgFlag);
                label.appendChild(voiceName);
                const voiceInput = document.createElement("input");
                voiceInput.type = "radio";
                voiceInput.name = target + "Voice";
                voiceInput.id = 'nr-ext-' + voices[voice]['key'];
                cell.appendChild(label);
                cell.appendChild(previewVoiceBtn);
                cell.appendChild(voiceInput);
            }
            if (target.includes('preset')) {
                label.setAttribute('voiceType', voices[voice].type);
                label.setAttribute('isPreset', true);
            }
            label.setAttribute('value', voices[voice]['key']);
            voiceMenu.appendChild(cell);
            cell.onclick = () => {selectVoiceItem(label, target)};
        }
    }
    function preview(voice) {
        chrome.runtime.sendMessage({fn: 'preview', voice}, () => void chrome.runtime.lastError);
    }
    function populateVoiceListMapper(mapper, voices) {
        const voiceListSelect = self[mapper];
        voiceListSelect.options.length = 0;
        for (let voice in voices) {
            if (mapper.includes('free') && voices[voice].isPrem) {
                continue;
            }
            const option = document.createElement("option");
            option.text = voices[voice]['key'];
            option.value = voices[voice]['key'];
            voiceListSelect.add(option);
        }
        voiceListSelect.onchange = debounce(changeVoice);
    }
    function generateSelectableItemsClickEvent(selectMenu, onClickEvent) {
        const selectableItems = selectMenu.querySelectorAll('.nr-ext-selectable');
        for (let i = 0; i < selectableItems.length; i++) {
            selectableItems[i].onclick = onClickEvent;
        }
    }
    function highlightColourItemOnClick(e) {
        let colour = this.getAttribute('value');
        setWidgetSetting('highlightColour', highlightColour[colour].value);
        updateUIDropdownCurrentText(self.highlightColour, highlightColour[colour].text);
        updateUIDropdownCurrentHighlightColourIcon(self.highlightColourIcon, 'nr-ext-color-', highlightColour[colour].value);
        setUISelectedItem(this);
    }
    function highlightModeItemOnClick(e) {
        let mode = this.getAttribute('value');
        setWidgetSetting('beHighlighted', highlightMode[mode].value);
        updateUIDropdownCurrentText(self.highlightMode, highlightMode[mode].text);
        setUISelectedItem(this);
    }
    function updateUIDropdownCurrentHighlightColourIcon(iconElement, prefixClassName, value) {
        if (!iconElement)
            return;
        for (let _color in highlightColour) {
            iconElement.classList.remove(prefixClassName + _color);
        }
        iconElement.classList.add(prefixClassName + value);
    }
    function updateUIDropdownCurrentText(dropdownDisplayItem, curText) {
        if (dropdownDisplayItem)
            dropdownDisplayItem.innerText = curText;
    }
    function setUISelectedDropdownItemByValue(dropdownMenu, value) {
        if (!dropdownMenu)
            return;
        let dropdownItems = dropdownMenu.querySelectorAll('.nr-ext-selectable');
        for (let i = 0; i < dropdownItems.length; i++) {
            let optionValue = dropdownItems[i].getAttribute('value');
            if (optionValue == value) {
                setUISelectedItem(dropdownItems[i]);
                break;
            }
        }
    }
    function getLanguageName(lang) {
        switch (lang) {
            case 'en-US':
                return 'English (US)';
            case 'en-GB':
                return 'English (UK)';
            case 'en-UK':
                return 'English (UK)';
            case 'en-CY':
                return 'English (Wales)';
            case 'en-AU':
                return 'English (Australia)';
            case 'en-IN':
                return 'English (India)';
            case 'es-ES':
                return 'Spanish (Spain)';
            case 'es-MX':
                return 'Spanish (Mexico)';
            case 'es-CA':
                return 'Spanish (Spain)';
            case 'de-DE':
                return 'German';
            case 'fr-FR':
                return 'French';
            case 'es-US':
                return 'Spanish (US)';
            case 'it-IT':
                return 'Italian';
            case 'pl-PL':
                return 'Polish';
            case 'nl-NL':
                return 'Dutch';
            case 'tr-TR':
                return 'Turkish';
            case 'no-NO':
                return 'Norwegian';
            case 'nb-NO':
                return 'Norwegian';
            case 'is-IS':
                return 'Icelandic';
            case 'da-DK':
                return 'Danish';
            case 'cy-GB':
                return 'Welsh';
            case 'zh-CN':
                return 'Chinese';
            case 'zh-TW':
                return 'Chinese (Taiwan)';
            case 'zh-HK':
                return 'Chinese (Hong Kong)';
            case 'ja-JP':
                return 'Japanese';
            case 'ko-KR':
                return 'Korean';
            case 'hi-HI':
                return 'Hindi';
            case 'id-ID':
                return 'Indonesian';
            case 'ro-RO':
                return 'Romanian'
            case 'ru-RU':
                return 'Russian';
            case 'pt-BR':
                return 'Portuguese (Brazil)';
            case 'pt-PT':
                return 'Portuguese (Portugal)';
            case 'fr-CA':
                return 'French (Canada)';
            case 'sv-SE':
                return 'Swedish';
            default:
                return lang;
        }
    }
    function selectVoiceItem(voiceItem, voiceList) {
        const voice = voiceItem.getAttribute('value');
        const isPreset = voiceItem.getAttribute('isPreset');
        let mapper = null;
        switch (voiceList) {
            case 'freeVoiceList': {
                mapper = self['freeVoiceListMapper'];
                break;
            }
            case 'premVoiceList': {
                mapper = self['premVoiceListMapper'];
                break;
            }
            case 'plusVoiceList': {
                mapper = self['plusVoiceListMapper'];
                break;
            }
            case 'preset1VoiceList': {
                mapper = self['preset1VoiceListMapper'];
                self['preset1Voice'].textContent = voiceItem.textContent;
                break;
            }
            case 'preset2VoiceList': {
                mapper = self['preset2VoiceListMapper'];
                self['preset2Voice'].textContent = voiceItem.textContent;
                break;
            }
            default: {
                mapper = self['freeVoiceListMapper'];
            }
        }
        invokeVoiceListOnChangeEvent(mapper, voice);
    }
    function setPresetAsSelectedVoice(request, sender, sendResponse) {
        const presetIndex = request.index;
        const presetMenu = self['preset' + presetIndex + 'VoiceList']
        const voiceItems = presetMenu.querySelectorAll('.nr-ext-selectable');
        const selectedIndex = self['preset' + presetIndex + 'VoiceListMapper'].selectedIndex;
        const voice = voiceItems[selectedIndex];
        const voiceType = voice.getAttribute('voiceType');
        const value = voice.getAttribute('value');
        const voiceListMapperToChange = self[voiceType + 'VoiceListMapper'];
        invokeVoiceListOnChangeEvent(voiceListMapperToChange, value);
        const activeSpeakerTabButton = self[voiceType + 'Voice'];
        const event = new Event('click');
        activeSpeakerTabButton.dispatchEvent(event);
    }
    function changeVoice(e) {
        let voiceType = '';
        if (e.target.id.includes('plus')) {
            voiceType = 'plus';
        } else if (e.target.id.includes('prem')) {
            voiceType = 'prem';
        } else if (e.target.id.includes('preset1')) {
            voiceType = 'preset1';
        } else if (e.target.id.includes('preset2')) {
            voiceType = 'preset2';
        } else {
            voiceType = 'free';
        }
        if (voiceType) {
            setWidgetSetting(voiceType + 'Voice', e.target.value);
        }
        let voiceMenu;
        switch (e.target.id) {
            case elementIds['freeVoiceListMapper']: {
                voiceMenu = self['freeVoiceList'];
                break;
            }
            case elementIds['premVoiceListMapper']: {
                voiceMenu = self['premVoiceList'];
                break;
            }
            case elementIds['plusVoiceListMapper']: {
                voiceMenu = self['plusVoiceList'];
                break;
            }
            case elementIds['preset1VoiceListMapper']: {
                voiceMenu = self['preset1VoiceList'];
                break;
            }
            case elementIds['preset2VoiceListMapper']: {
                voiceMenu = self['preset2VoiceList'];
                break;
            }
            default: {
                voiceMenu = self['freeVoiceList'];
            }
        }
        const voiceItems = voiceMenu.querySelectorAll('.nr-ext-selectable');
        try {
            const isPreset = JSON.parse(voiceItems[e.target.selectedIndex].getAttribute('isPreset'));
            if (isPreset) {
                if (e.target.id.includes('preset1')) {
                    self['preset1Voice'].textContent = voiceItems[e.target.selectedIndex].textContent;
                } else if (e.target.id.includes('preset2')) {
                    self['preset2Voice'].textContent = voiceItems[e.target.selectedIndex].textContent;
                }
            }
        } catch (err) {
        }
        setUISelectedVoice(voiceItems[e.target.selectedIndex]);
    }
    function setUISelectedItem(selectedItem) {
        try {
            const prevSelectedItem = selectedItem.parentElement.querySelector('.nr-ext-selectable.selected');
            const isSelected = selectedItem.classList.contains('selected');
            if (!isSelected) {
                selectedItem.classList.add('selected');
                if (prevSelectedItem) {
                    prevSelectedItem.classList.remove('selected');
                }
            }
        } catch (err) {
        }
    }
    function setUISelectedVoice(selectedVoice) {
        try {
            const input = selectedVoice.parentElement.querySelector('input');
            if (input && !input.checked) {
                input.checked = true;
            }
        } catch (err) {
        }
    }
    function invokeVoiceListOnChangeEvent(target, value) {
        let element = target;
        const event = new Event('change');
        if (element && value !== null) {
            element.value = value;
        }
        if (element)
            element.dispatchEvent(event);
    }
    function matchFlagWithLocale(locale) {
        let src;
        switch (locale) {
            case 'en-US':
                src = 'en-US';
                break;
            case 'en-GB':
                src = 'en-GB';
                break;
            case 'en-AU':
                src = 'en-AU';
                break;
            case 'en-GB-WLS':
                src = 'en-GB-WLS';
                break;
            case 'en-IN':
                src = 'en-IN';
                break;
            case 'en-CY':
                src = 'en-GB-WLS';
                break;
            case 'es-US':
                src = 'en-US';
                break;
            case 'es-CA':
                src = 'es-ES';
                break;
            case 'es-ES':
                src = 'es-ES';
                break;
            case 'tr-TR':
                src = 'tr-TR';
                break;
            case 'sv-SE':
                src = 'sv-SE';
                break;
            case 'ru-RU':
                src = 'ru-RU';
                break;
            case 'ro-RO':
                src = 'ro-RO';
                break;
            case 'pt-PT':
                src = 'pt-PT';
                break;
            case 'pt-BR':
                src = 'pt-BR';
                break;
            case 'pl-PL':
                src = 'pl-PL';
                break;
            case 'nl-NL':
                src = 'nl-NL';
                break;
            case 'nb-NO':
                src = 'no-NO';
                break;
            case 'no-NO':
                src = 'no-NO';
                break;
            case 'ko-KR':
                src = 'ko-KR';
                break;
            case 'ja-JP':
                src = 'ja-JP';
                break;
            case 'it-IT':
                src = 'it-IT';
                break;
            case 'is-IS':
                src = 'is-IS';
                break;
            case 'fr-FR':
                src = 'fr-FR';
                break;
            case 'fr-CA':
                src = 'fr-CA';
                break;
            case 'de-DE':
                src = 'de-DE';
                break;
            case 'da-DK':
                src = 'da-DK';
                break;
            case 'cy-GB':
                src = 'en-GB-WLS';
                break;
            default:
                src = 'nr-unknown-locale';
        }
        return src;
    }
    function setWidgetSetting(key, value) {
        chrome.runtime.sendMessage({fn: 'setWidgetSetting', key: key, value: value}, () => void chrome.runtime.lastError);
    }
    function loginLogout() {
        chrome.runtime.sendMessage({fn: 'getWidgetSettings'}, async (_widgetSettings) => {
            if (chrome.runtime.lastError) { }
            widgetSettings = _widgetSettings;
            if (widgetSettings.loggedIn) {
                chrome.runtime.sendMessage({fn: 'logout'}, () => void chrome.runtime.lastError);
            } else {
                chrome.runtime.sendMessage({fn: 'login'}, () => void chrome.runtime.lastError);
            }
        })
    }
    function bindUIEvents() {
        return new Promise((resolve) => {
            self.closeBtn.onclick = () => {
                stopBtnOnClick();
                toggleWidget();
            };
            self.readBtn.onclick = readBtnOnClick;
            self.stopBtn.onclick = stopBtnOnClick;
            self.forwardBtn.onclick = forward;
            self.backwardBtn.onclick = rewind;
            /* data-size */
            self.maxBtn.onclick = () => {
                setWidgetMode('max');
            }
            self.minBtn.onclick = () => {
                setWidgetMode('min');
            }
            self.profileBtn.onclick = () => {
                configureWidgetFrame('profile');
                chrome.runtime.sendMessage({fn: 'getWidgetSettings'}, async (_widgetSettings) => {
                    if (chrome.runtime.lastError) { }
                    widgetSettings = _widgetSettings;
                    if (widgetSettings.loggedIn) {
                        setProfileContainerStatus('login');
                    } else {
                        setProfileContainerStatus('init');
                    }
                })
                $(self.container).attr('data-size', 'profile');
                var currentMenu = $(self.container).attr('menu-status');
                var currentClose = currentMenu + 'Close';
                $(self[currentClose]).click();
            }
            self.profileClose.onclick = () => {
                configureWidgetFrame('max');
                $(self.container).attr('data-size', 'max');
                dynamicHeight();
            }
            /* data-size */
            /* tabs-menu */
            self.menuTrigger.onclick = () => {
                openMenu('open');
            }
            self.uploadTrigger.onclick = () => {
                openMenu('upload');
            }
            self.mobileTrigger.onclick = () => {
                openMenu('mobile');
            }
            self.voiceTrigger.onclick = () => {
                openMenu('voice');
            }
            self.settingsTrigger.onclick = () => {
                $(self.settingsMenu).attr('settings-status', 'init');
                $(self.settingsTitle).text('Reader Settings');
                openMenu('settings');
            }
            self.highlightBtn.onclick = () => {
                $(self.settingsMenu).attr('settings-status', 'highlight');
                $(self.settingsTitle).text('Highlight');
                dynamicHeight();
            }
            self.highlightClose.onclick = () => {
                $(self.settingsMenu).attr('settings-status', 'init');
                $(self.settingsTitle).text('Reader Settings');
                dynamicHeight();
            }
            self.readSelectionBtn.onclick = () => {
                $(self.settingsMenu).attr('settings-status', 'read');
                $(self.settingsTitle).text('Read Selection');
                dynamicHeight();
            }
            self.closeCaptionsSettingsBtn.onclick = () => {
                $(self.settingsMenu).attr('settings-status', 'cc');
                $(self.settingsTitle).text('Closed Captions');
                dynamicHeight();
            }
            self.selectableCharLimit.onclick = (e) => {
                setReadSelectionCharLimit(e);
            }
            /* tabs-menu */
            /* launch-menu */
            self.launchClose.onclick = () => {
                setMenuStatus(self.container, 'data-launch', 'false');
            }
            self.launchClose2.onclick = () => {
                setMenuStatus(self.container, 'data-launch', 'false');
            }
            self.launchClose3.onclick = () => {
                setMenuStatus(self.container, 'data-launch', 'false');
            }
            self.launchStep2.onclick = () => {
                setMenuStatus(self.launchContainer, 'launch-status', 'feature');
            }
            self.launchStep3.onclick = () => {
                setMenuStatus(self.launchContainer, 'launch-status', 'pin');
            }
            /* launch-menu */
            self.freeVoice.onclick = () => {selectVoiceType('free')};
            self.premVoice.onclick = () => {selectVoiceType('prem')};
            self.plusVoice.onclick = () => {selectVoiceType('plus')};
            self.speedValue.onchange = () => {
                setProgressTime(self.texts);
                setWidgetSetting('speed', self.speedValue.value);
            }
            self.volumeValue.onchange = () => {
                setWidgetSetting('volume', self.volumeValue.value);
            }
            self.autoSelectVoice.onclick = () => {setAutoSelectVoice(!self.isAutoSelectVoice)};
            self.clickToReadToggle.onclick = () => {setClickToRead(!self.isClickToRead)};
            self.readIconOn.onclick = () => {setReadIcon(!self.readIcon)};
            self.ccToggle.onclick = () => {setIsCC(!self.isCC)};
            self.dyslexiaToggle.onclick = () => {setDyslexia(!self.isDyslexic)};
            self.autoScrollToggle.onclick = () => {setAutoScroll(!self.isAutoScroll, true)};
            self.darkThemeToggle.onclick = () => {setIsDarkTheme(!self.isDarkTheme)}
            self.closeCC.onclick = () => {setIsCC(false);}
            self.preferenceBtn.onclick = () => {
                setProfileContainerStatus('preferences');
            }
            self.closePreferenceBtn.onclick = () => {
                chrome.runtime.sendMessage({fn: 'getWidgetSettings'}, async (_widgetSettings) => {
                    if (chrome.runtime.lastError) { }
                    widgetSettings = _widgetSettings;
                    if (widgetSettings.loggedIn) {
                        setProfileContainerStatus('login');
                    } else {
                        setProfileContainerStatus('init');
                    }
                })
            }
            self.presetVoiceListBtn.onclick = () => {
                setProfileContainerStatus('voices');
            }
            self.closePresetVoiceListBtn.onclick = () => {
                setProfileContainerStatus('preferences');
            }
            self.peBtn.onclick = openPe;
            self.convertBtn.onclick = convert;
            self.loginBtn.onclick = () => {
                loginLogout();
            }
            self.logoutBtn.onclick = () => {
                loginLogout();
            }
            self.loginLogoutBtnMobile.onclick = () => {
                loginLogout();
            }
            self.signupBtn.onclick = () => {
                chrome.runtime.sendMessage({fn: 'signup'}, () => void chrome.runtime.lastError);
            }
            self.signupBtnMobile.onclick = () => {
                chrome.runtime.sendMessage({fn: 'signup'}, () => void chrome.runtime.lastError);
            }
            self.refreshLicenseBtn.onclick = () => {
                chrome.runtime.sendMessage({fn: 'updateLicense'}, () => void chrome.runtime.lastError);
                self.refreshLicenseBtnIcon.classList.add('spin');
            }
            self.issuesBtn.onclick = () => {
                chrome.runtime.sendMessage({fn: 'openReportIssues'}, () => void chrome.runtime.lastError);
            };
            /* Save to mobile */
            self.convertToPdfBtn.onclick = convertToPdf;
            self.downloadAndroidBtn.onclick = () => {openDownloadMobile('android');}
            self.downloadIosBtn.onclick = () => {openDownloadMobile('ios');}
            self.saveToMobileTryAgainBtn.onclick = () => {
                setMenuStatus(self.mobileMenu, 'mobile-status', 'save');
            }
            /* Upload */
            self.inputTextsBtn.onclick = openPW;
            self.uploadBrowseBtn.onchange = (e) => {
                uploadFile(self.uploadBrowseBtn.files[0]);
            }
            self.openFileBtn.onclick = () => {
                if (self.uploadPdfUrl) {
                    const ext = getExtName(self.uploadFileName.innerText);
                    if (ext === 'pdf') {
                        chrome.runtime.sendMessage({fn: 'setFile', url: self.uploadPdfUrl, fileName: self.uploadFileName.innerText}, () => void chrome.runtime.lastError);
                    } else {
                        chrome.runtime.sendMessage({fn: 'openFileInPW', pdfUrl: self.uploadPdfUrl}, () => void chrome.runtime.lastError);
                    }
                }
            }
            self.uploadDiffFileBtn.onclick = () => {
                setMenuStatus(self.uploadMenu, 'upload-status', 'init');
            }
            self.uploadTryAgainBtn.onclick = () => {
                setMenuStatus(self.uploadMenu, 'upload-status', 'init');
            }
            self.uploadDragAndDrop.ondrop = (e) => {
                e.stopPropagation();
                e.preventDefault();
                const dt = e.dataTransfer;
                const file = dt.files[0];
                uploadFile(file);
            }
            self.uploadDragAndDrop.ondragenter = (e) => {
                e.stopPropagation();
                e.preventDefault();
            }
            self.uploadDragAndDrop.ondragover = (e) => {
                e.stopPropagation();
                e.preventDefault();
            }
            self.uploadErrorDragAndDrop.ondrop = (e) => {
                e.stopPropagation();
                e.preventDefault();
                const dt = e.dataTransfer;
                const file = dt.files[0];
                uploadFile(file);
            }
            self.uploadErrorDragAndDrop.ondragenter = (e) => {
                e.stopPropagation();
                e.preventDefault();
            }
            self.uploadErrorDragAndDrop.ondragover = (e) => {
                e.stopPropagation();
                e.preventDefault();
            }
            self.uploadFinishDragAndDrop.ondrop = (e) => {
                e.stopPropagation();
                e.preventDefault();
                const dt = e.dataTransfer;
                const file = dt.files[0];
                uploadFile(file);
            }
            self.uploadFinishDragAndDrop.ondragenter = (e) => {
                e.stopPropagation();
                e.preventDefault();
            }
            self.uploadFinishDragAndDrop.ondragover = (e) => {
                e.stopPropagation();
                e.preventDefault();
            }
            generateSelectableItemsClickEvent(self.highlightModeMenu, highlightModeItemOnClick);
            generateSelectableItemsClickEvent(self.highlightColourMenu, highlightColourItemOnClick);
            self.hotkeysBtn.onclick = () => {
                chrome.runtime.sendMessage({fn: 'editHotkeys'}, () => void chrome.runtime.lastError);
            }
            self.reloadBtn.onclick = reload;
            self.noFreeVoicesReloadBtn.onclick = reload;
            /* Progress Bar */
            self.progressValue.onchange = debounce(() => {
                let progressValue = JSON.parse(self.progressValue.value);
                if (progressValue.tag !== 'nr-ext-widget') {
                    if (progressValue.lastModified === 'page') {
                        chrome.runtime.sendMessage({fn: 'readIndex', pageIndex: progressValue.pageIndex, percentage: progressValue.percentage}, () => void chrome.runtime.lastError);
                    } else {
                        chrome.runtime.sendMessage({fn: 'readIndex', index: progressValue.sentenceIndex}, () => void chrome.runtime.lastError);
                    }
                }
            });
            /* Upgrade */
            self.premUpgradeBtn.onclick = () => {
                window.open('https://www.naturalreaders.com/checkout/plans?plan=personal', '_blank');
            }
            self.freePlusUpgradeBtn.onclick = () => {
                window.open('https://www.naturalreaders.com/checkout/plans?plan=plus', '_blank');
            }
            self.premPlusUpgradeBtn.onclick = () => {
                chrome.runtime.sendMessage({fn: 'upgrade'}, () => void chrome.runtime.lastError)
            }
            /* Relocate Tip */
            self.relocateBtn.onclick = () => {
                chrome.runtime.sendMessage({fn: 'getReaderInfo'}, function(info) {
                    if (chrome.runtime.lastError) { }
                    if (info.readerState === 'reading' && typeof nrDomController != 'undefined') {
                        nrDomController.scrollTo(info.index);
                    }
                });
                self.relocateBtn.style.display = 'none';
            }
            resolve();
        })
            .catch((err) => {
            });
    }
    function disableBodyDrag() {
        document.body.style.pointerEvents = 'none';
    }
    function enableBodyDrag() {
        document.body.style.pointerEvents = 'unset';
    }
    function checkCanUpload(file) {
        return new Promise(async (resolve, reject) => {
            const supportedFormats = ['txt', 'odp', 'odt', 'ods', 'pages', 'numbers', 'ppt', 'pptx', 'xls', 'xlsx',
                'jpeg', 'png', 'jpg', 'doc', 'docx', 'pdf', 'rtf', 'epub'];
            const imgFormats = ['jpeg', 'png', 'jpg'];
            const ext = getExtName(file.name);
            if (file.size > 50 * 1024 * 1024) {
                if (ext === 'pdf') {
                    if (file.size > 200 * 1024 * 1024) {
                        reject(new Error("Upload PDF failed: over 200MB"));
                    } else {
                        resolve();
                    }
                } else {
                    reject(new Error("Upload failed: over 50MB"));
                }
            } else if (supportedFormats.indexOf(ext) === -1) {
                reject(new Error("Upload failed: unsupported file type"));
            } else {
                const isAuthorized = await canOCR(ext);
                if (imgFormats.indexOf(ext) > -1 && !isAuthorized) {
                    reject(new Error("Upload failed: OCR not supported"));
                } else {
                    resolve();
                }
            }
        })
            .catch(err => {
                return Promise.reject(err);
            });
    }
    function canOCR() {
        return new Promise((resolve) => {
            chrome.runtime.sendMessage({fn: 'getWidgetSettings'}, (widgetSettings) => {
                if (chrome.runtime.lastError) {
                    resolve(false);
                }
                if (widgetSettings && widgetSettings.userInfo) {
                    const userInfo = widgetSettings.userInfo;
                    let userLicNum = 0;
                    let pwLicNum = 0;
                    if (userInfo.licNum) {
                        userLicNum = userInfo.licNum;
                    } else if (userInfo.license) {
                        userLicNum = parseInt(userInfo.license);
                    }
                    if (userInfo.pwLicNum) {
                        pwLicNum = parseInt(userInfo.pwLicNum);
                    }
                    if ((userLicNum === 12 || pwLicNum === 12) ||
                        (userLicNum === 13 || pwLicNum === 13) ||
                        (userLicNum >= 32 && userLicNum <= 37)) {
                        resolve(true);
                    } else {
                        resolve(false);
                    }
                } else {
                    resolve(false);
                }
            })
        })
            .catch(err => {
                return Promise.resolve(false);
            });
    }
    function getExtName(filename) {
        const ff = filename.toString();
        const fileExtension = ff.substring(ff.lastIndexOf('.') + 1);
        return fileExtension.toString().toLowerCase();
    }
    function uploadFile(file = null) {
        if (!file) {
            return;
        }
        return checkCanUpload(file)
            .then(() => {
                const ext = getExtName(file.name);
                if (ext !== 'pdf') {
                    chrome.runtime.sendMessage({fn: 'getWidgetSettings'}, function(widgetSettings) {
                        if (chrome.runtime.lastError) { }
                        const userId = widgetSettings.userInfo ? widgetSettings.userInfo.id : '';
                        setMenuStatus(self.uploadMenu, 'upload-status', 'loading');
                        self.uploadProgress.innerText = '0%';
                        let uploadUrl = 'https://uploadocr.naturalreaders.com/up3?apikey=b98x9xlfs54ws4k0wc0o8g4gwc0w8ss&action=touserpdf';
                        if (userId) {
                            uploadUrl += '&userid=' + userId;
                        }
                        const reader = new FileReader();
                        const date1 = new Date();
                        reader.onload = function(e) {
                            const date2 = new Date();
                            const formData = new FormData();
                            formData.append('filename', file.name);
                            if (userId) {
                                formData.append('userid', userId);
                            }
                            formData.append('file', e.target.result);
                            var xhr = new XMLHttpRequest();
                            xhr.open('POST', uploadUrl, true);
                            xhr.upload.onprogress = function(event) {
                                self.uploadProgress.innerText = Math.round(100 * event.loaded / event.total) + '%';
                            };
                            xhr.onload = () => {
                                if (xhr.status >= 400) {
                                    setMenuStatus(self.uploadMenu, 'upload-status', 'error');
                                    self.uploadErrorMsg.innerText = "Upload failed: server error or file corrupted";
                                }
                                if (xhr.status == 200) {
                                    setMenuStatus(self.uploadMenu, 'upload-status', 'finish');
                                    self.uploadPdfUrl = JSON.parse(xhr.response).pdfurl;
                                    self.uploadFileName.innerText = file.name;
                                }
                            };
                            xhr.onerror = function(event) {
                                setMenuStatus(self.uploadMenu, 'upload-status', 'error');
                                self.uploadErrorMsg.innerText = "Upload failed: server error or file corrupted";
                            };
                            xhr.send(formData);
                        }
                        reader.readAsDataURL(file);
                    });
                } else {
                    setMenuStatus(self.uploadMenu, 'upload-status', 'finish');
                    self.uploadPdfUrl = URL.createObjectURL(file);
                    self.uploadFileName.innerText = file.name;
                }
            })
            .catch(err => {
                setMenuStatus(self.uploadMenu, 'upload-status', 'error');
                self.uploadErrorMsg.innerText = err.message;
            });
    }
    function setProfileContainerStatus(status) {
        $(self.profileContainer).attr('profile-status', status);
        dynamicHeight();
    }
    function setMenuStatus(menu, attr, status) {
        $(menu).attr(attr, status);
        dynamicHeight();
    }
    function openMenu(type) {
        var currentMenu = $(self.container).attr('menu-status');
        var clickMenu = type;
        if (type == 'open') {
            if (currentMenu != 'init') {
                closeMenu();
            } else {
                $(self.container).attr('menu-status', 'voice');
                changeDisplay('openSettingsIcon', false);
                changeDisplay('closeSettingsIcon', true);
                dynamicHeight();
            }
        } else {
            $(self.container).attr('menu-status', clickMenu);
            dynamicHeight();
        }
    }
    function closeMenu() {
        changeDisplay('openSettingsIcon', true);
        changeDisplay('closeSettingsIcon', false);
        var currentMenu = $(self.container).attr('menu-status');
        var childStatus = currentMenu + '-status';
        var childMenu = null;
        switch (currentMenu) {
            case 'upload':
                childMenu = self.uploadMenu;
                break;
            case 'mobile':
                childMenu = self.mobileMenu;
                break;
            case 'voice':
                childMenu = self.voiceMenu;
                break;
            case 'settings':
                childMenu = self.settingsMenu;
                break;
            default:
                break;
        }
        $(self.container).attr('menu-status', 'init');
        if (currentMenu == 'mobile') {
            chrome.runtime.sendMessage({fn: 'getWidgetSettings'}, async (_widgetSettings) => {
                if (chrome.runtime.lastError) { }
                widgetSettings = _widgetSettings;
                if (widgetSettings.loggedIn) {
                    $(childMenu).attr(childStatus, 'save');
                } else {
                    $(childMenu).attr(childStatus, 'init');
                }
                dynamicHeight();
            })
        } else {
            $(childMenu).attr(childStatus, 'init');
            dynamicHeight();
        }
    }
    function dynamicHeight() {
        const progressH = 29;// hieght 24 with margin 5
        const maxContainerH = 60;
        const menuH = 296;// most menu-content
        const launchH1 = 192;
        const launchH2 = 341;
        const launchH3 = 256;
        const voicesH = 392;// voice menu only
        const mobileH = 348;// just for not login
        const settingsH = 424;// settings-init
        const highlightH = 338;
        const ccH = 184;
        const readselectH = 237;
        const toggleVoiceH = 396;
        const preferenceH = 168;
        const unauthorizedH = 544;
        const profileH = 504;
        var currentH = 0;
        var currentSize = $(self.container).attr('data-size');
        if (currentSize == 'profile') {
            var currentProfile = $(self.profileContainer).attr('profile-status');
            switch (currentProfile) {
                case 'init':
                    currentH = unauthorizedH;
                    break;
                case 'login':
                    currentH = profileH;
                    break;
                case 'preferences':
                    currentH = preferenceH;
                    break;
                case 'voices':
                    currentH = toggleVoiceH;
                    break;
                default:
                    currentH = unauthorizedH;
                    break;
            }
        } else if (currentSize == 'max') {
            currentH = maxContainerH;
            var currentPlay = $(self.container).attr('data-play');
            var progressStatus = self.progressContainer.clientHeight;
            if (currentPlay != 'init' || progressStatus > 0) {
                currentH += progressH;
                self.frame.style.top = '80px';
            } else {
                self.frame.style.top = '109px';
            }
            var currentLaunch = $(self.container).attr('data-launch');
            var launchStatus = $(self.launchContainer).attr('launch-status');
            if (currentLaunch == 'true') {
                switch (launchStatus) {
                    case 'init':
                        currentH += launchH1;
                        break;
                    case 'feature':
                        currentH += launchH2;
                        break;
                    case 'pin':
                        currentH += launchH3;
                        break;
                    default:
                        break;
                }
            }
            var currentMenu = $(self.container).attr('menu-status');
            switch (currentMenu) {
                case 'upload':
                    currentH += menuH;
                    break;
                case 'mobile':
                    currentH += mobileH;
                    break;
                case 'voice':
                    currentH += voicesH;
                    break;
                case 'settings':
                    var childStatus = $(self.settingsMenu).attr('settings-status');
                    if (childStatus == 'init') {
                        currentH += settingsH;
                    } else if (childStatus == 'highlight') {
                        currentH += highlightH;
                    } else if (childStatus == 'cc') {
                        currentH += ccH;
                    } else {
                        currentH += readselectH;
                    }
                    break;
                default:
                    break;
            }
        } else if (currentSize == 'min') {
            currentH = 56;
        }
        self.frame.style.height = currentH + "px";
    }
    function selectVoiceType(voiceType) {
        $(self.voiceList).attr('voice-type', voiceType);
        if (voiceType === 'free') {
            changeDisplay('freeVoiceList');
            changeDisplay('premVoiceList', false)
            changeDisplay('plusVoiceList', false)
            setWidgetSetting('voiceType', 'free');
        } else if (voiceType === 'prem') {
            changeDisplay('premVoiceList');
            changeDisplay('freeVoiceList', false)
            changeDisplay('plusVoiceList', false)
            setWidgetSetting('voiceType', 'prem');
        } else {
            changeDisplay('plusVoiceList');
            changeDisplay('premVoiceList', false)
            changeDisplay('freeVoiceList', false)
            setWidgetSetting('voiceType', 'plus');
        }
        chrome.runtime.sendMessage({fn: 'getWidgetSettings'}, function(widgetSettings) {
            if (chrome.runtime.lastError) { }
            invokeVoiceListOnChangeEvent(self[voiceType + 'VoiceListMapper'], widgetSettings[voiceType + 'Voice']);
        });
    }
    function changeDisplay(elementName, toShow = true) {
        if (toShow) {
            self[elementName].style.display = 'block';
        } else {
            self[elementName].style.display = 'none';
        }
    }
    function stopBtnOnClick() {
        chrome.runtime.sendMessage({message: 'stop', toReset: false}, () => void chrome.runtime.lastError);
    }
    function readBtnOnClick() {
        if (self.readerState === 'pause' || self.readerState === 'init') {
            if (nrDomDetector.hasSelectionOnPage(false)) {
                readSelection();
            } else {
                if (doc && (doc.type === 'googleDoc' || doc.type === 'googleDrivePreview')) {
                    const beingReadPageIndex = doc.getPageIndex();
                    const currentPageIndex = doc.getCurrentIndex();
                    if (beingReadPageIndex !== currentPageIndex) {
                        chrome.runtime.sendMessage({message: 'readPage', pageIndex: currentPageIndex}, () => void chrome.runtime.lastError);
                    } else {
                        chrome.runtime.sendMessage({fn: 'play', caller: 'readBtn'}, () => void chrome.runtime.lastError);
                    }
                } else {
                    chrome.runtime.sendMessage({fn: 'play', caller: 'readBtn'}, () => void chrome.runtime.lastError);
                }
            }
        } else {
            chrome.runtime.sendMessage({fn: 'pause'}, () => void chrome.runtime.lastError);
        }
    }
    function setReaderUI() {
        if (self.readerState === 'reading') {
            setUIOnPlay();
        } else if (self.readerState === 'pause') {
            setUIOnPause();
        } else if (self.readerState === 'init') {
            setUIOnStop();
        } else {
            setUIOnLoading();
        }
    }
    function openPW() {
        window.open('https://www.naturalreaders.com/online/', '_blank');
    }
    function openDownloadMobile(type) {
        let url = '';
        if (type === 'ios') {
            url = 'https://apps.apple.com/app/id1487572960';
        } else {
            url = 'https://play.google.com/store/apps/details?id=com.naturalsoft.personalweb';
        }
        window.open(url, '_blank');
    }
    function convert() {
        chrome.runtime.sendMessage({fn: 'onConvertBtnClicked'}, () => void chrome.runtime.lastError);
    }
    function openPe() {
        window.open('https://www.naturalreaders.com/online/?action=pe', '_blank');
    }
    function reload() {
        chrome.runtime.sendMessage({fn: 'reload'}, () => void chrome.runtime.lastError);
    }
    function updateFrameHeight(height) {
        if (height) {
            self.frame.style.height = height + "px";
        } else {
            self.frame.style.height = self.frame.contentWindow.document.body.scrollHeight + "px";
            self.frame.style.height = self.frame.contentWindow.document.body.scrollHeight + "px";
        }
    }
    function readSelection() {
        chrome.runtime.sendMessage({fn: 'readSelection'}, () => void chrome.runtime.lastError);
        nrDomDetector.frame.style.display = 'none';
    }
    function rewind() {
        chrome.runtime.sendMessage({fn: 'backward', number: 1}, () => void chrome.runtime.lastError);
    }
    function forward() {
        chrome.runtime.sendMessage({fn: 'forward', number: 1}, () => void chrome.runtime.lastError);
    }
    function setAutoScroll(isAutoScroll, relocate = false) {
        self.isAutoScroll = isAutoScroll;
        setToggle(self.isAutoScroll, self.autoScrollToggle);
        setWidgetSetting('isAutoScroll', isAutoScroll);
        if (relocate) {
            chrome.runtime.sendMessage({fn: 'relocate'}, () => void chrome.runtime.lastError);
        }
    }
    function showRelocateButton() {
        self.relocateBtn.style.display = 'block';
    }
    function hideRelocateButton() {
        self.relocateBtn.style.display = 'none';
    }
    function setDyslexia(isDyslexic) {
        self.isDyslexic = isDyslexic;
        setToggle(self.isDyslexic, self.dyslexiaToggle);
        setWidgetSetting('isDyslexic', self.isDyslexic);
        setDyslexicFont(isDyslexic);
    }
    function setIsDarkTheme(isDarkTheme) {
        self.isDarkTheme = isDarkTheme;
        setToggle(self.isDarkTheme, self.darkThemeToggle);
        setWidgetSetting('isDarkTheme', self.isDarkTheme);
        const theme = isDarkTheme ? 'dark' : 'light';
        setMenuStatus(self.widgetBody, 'data-theme', theme);
    }
    function setClickToRead(isClickToRead) {
        return new Promise((resolve) => {
            self.isClickToRead = isClickToRead;
            setWidgetSetting('isClickToRead', self.isClickToRead);
            if (self.isClickToRead) {
                chrome.runtime.sendMessage({fn: 'getReaderInfo'}, function(readerInfo) {
                    if (readerInfo.isFirstRead && readerInfo.readOption === 'all') {
                        self.readBtn.classList.add('spin');
                        self.readBtn.style.pointerEvents = 'none';
                        self.forwardBtn.style.pointerEvents = 'none';
                        self.backwardBtn.style.pointerEvents = 'none';
                        chrome.runtime.sendMessage({fn: 'setTextsForTtsWithoutPlay'}, (res) => {
                            if (chrome.runtime.lastError) {
                            }
                            self.readBtn.classList.remove('spin');
                            self.readBtn.style.pointerEvents = 'auto';
                            self.forwardBtn.style.pointerEvents = 'auto';
                            self.backwardBtn.style.pointerEvents = 'auto';
                            resolve();
                        })
                    } else {
                        resolve();
                    }
                });
            } else {
                resolve();
            }
            setToggle(self.isClickToRead, self.clickToReadToggle);
        })
            .catch(err => {
            });
    }
    function setToggle(checked, element) {
        if (checked) {
            $(element).attr('toggle-status', 'on');
        } else {
            $(element).attr('toggle-status', 'off');
        }
    }
    function setIsCC(isCC) {
        self.isCC = isCC;
        nrCC.isCC = isCC;
        setToggle(self.isCC, self.ccToggle);
        setWidgetSetting('isCC', self.isCC);
        if (self.isCC) {
            setWidgetSetting('isCC', true);
            chrome.runtime.sendMessage({fn: 'getReaderInfo'}, function(readerInfo) {
                if (readerInfo.readerState === 'reading' && readerInfo.beingReadTabId === readerInfo.activeTabId) {
                    nrCC.setCCVisibility(true);
                } else {
                    nrCC.setCCVisibility(false);
                }
            });
        } else {
            setWidgetSetting('isCC', false);
            nrCC.setCCVisibility(false);
        }
    }
    function setAutoSelectVoice(isAutoSelectVoice) {
        self.isAutoSelectVoice = isAutoSelectVoice;
        setToggle(self.isAutoSelectVoice, self.autoSelectVoice);
        setWidgetSetting('isAutoSelectVoice', isAutoSelectVoice);
    }
    function setReadIcon(readIcon) {
        self.readIcon = readIcon;
        setToggle(self.readIcon, self.readIconOn);
        setWidgetSetting('readIcon', self.readIcon);
        if (nrDomDetector != undefined) {
            nrDomDetector.switchIcon(readIcon);
        }
    }
    function setDyslexicFont(isDyslexic) {
        if (isDyslexic) {
            self.ccText.classList.add('dyslexicfonts');
        } else {
            self.ccText.classList.remove('dyslexicfonts');
        }
    }
    function setUIOnLoading() {
        $(self.container).attr('data-play', 'play');
        self.readBtn.classList.add('spin');
        nrCC.setCCVisibility(false);
        $(".nr-ext-preview-voice").hide();
        self.readerState = 'loading';
        self.forwardBtn.disabled = true;
        self.backwardBtn.disabled = true;
        dynamicHeight();
    }
    function setUIOnPlay() {
        if (self.readBtn && self.readBtn.classList.contains('spin')) {
            self.readBtn.classList.remove('spin');
        }
        $(".nr-ext-preview-voice").hide();
        $(self.container).attr('data-play', 'play');
        self.forwardBtn.disabled = false;
        self.backwardBtn.disabled = false;
        self.readerState = 'reading';
        dynamicHeight();
    }
    function setUIOnPause() {
        if (self.readBtn && self.readBtn.classList.contains('spin')) {
            self.readBtn.classList.remove('spin');
        }
        if (self.readerState !== "init") {
            $(self.container).attr('data-play', 'pause');
            self.readerState = 'pause';
        }
        self.forwardBtn.disabled = false;
        self.backwardBtn.disabled = false;
        nrCC.setCCVisibility(false);
        self.relocateBtn.style.display = 'none';
    }
    function setUIOnStop() {
        if (self.readBtn && self.readBtn.classList.contains('spin')) {
            self.readBtn.classList.remove('spin');
        }
        $(self.container).attr('data-play', 'init');
        self.readerState = 'init';
        nrCC.setCCVisibility(false);
        self.forwardBtn.disabled = false;
        self.backwardBtn.disabled = false;
        dynamicHeight();
    }
    function injectWidget(request, sender, sendResponse) {
        if (!self.isInjectingWidget && !self.hasWidget) {
            self.isInjectingWidget = true;
            self.showWelcome = request.showWelcome ? request.showWelcome : false;
            chrome.runtime.sendMessage({fn: 'setIcon', state: 'loading'}, () => void chrome.runtime.lastError);
            if (!self.loadingTimer) {
                self.loadingTimer = setTimeout(() => {
                    clearTimeout(self.loadingTimer);
                    chrome.runtime.sendMessage({fn: 'setIcon'}, () => void chrome.runtime.lastError);
                }, 10000);
            }
            let iframe = document.createElement('iframe');
            self.frame = iframe;
            self.frame.id = "nr-ext-widget";
            self.frame.style.background = "none";
            self.frame.style.backgroundColor = "transparent";
            configureWidgetFrame('min');
            self.frame.style.overflow = "hidden";
            self.frame.style.position = "fixed";
            self.frame.style.top = '109px';
            self.frame.style.right = '20px';
            self.frame.style.display = "none";
            self.frame.style.zIndex = "9000000000000000000";
            self.frame.style.background = 'transparent';
            self.frame.style.borderRadius = '8px';
            self.frame.style.boxShadow = '0px 8px 20px rgba(0, 0, 0, 0.08)';
            self.frame.style.filter = 'drop-shadow(0px 8px 20px rgba(0, 0, 0, 0.08))';
            self.frame.style.borderStyle = "none";
            document.body.appendChild(iframe);
            self.frame.onload = async () => {
                await frameContentOnLoad();
                sendResponse(true);
            }
            fetch(chrome.runtime.getURL("injected/nr-ext-widget/nr-ext-widget.html"))
                .then((response) => {
                    return response.text();
                })
                .then((widget) => {
                    try {
                        self.frame.contentDocument.write(widget);
                        self.widgetDocument = self.frame.contentDocument;
                        self.frame.contentDocument.close();
                    } catch (err) {
                        self.frame.contentDocument.close();
                    };
                }).catch(err => {
                });
        }
    }
    async function frameContentOnLoad() {
        await loadResource(null, chrome.runtime.getURL('assets/css/bootstrap.min.css'));
        await loadResource(null, chrome.runtime.getURL('assets/css/ion.rangeSlider.css'));
        await loadResource(null, chrome.runtime.getURL('injected/nr-ext-widget/nr-ext-widget.css'));
        await loadResource(null, chrome.runtime.getURL('assets/js/jquery-3.6.0.min.js'));
        await loadResource(null, chrome.runtime.getURL('assets/js/bootstrap.bundle.min.js'));
        await loadResource(null, chrome.runtime.getURL('assets/js/ion.rangeSlider.min.js'));
        await loadResource(null, chrome.runtime.getURL('injected/nr-ext-widget/slider-init.js'));
        await init();
        setWidgetVisibility(true);
        setWidgetSetting('isVisible', true);
        self.hasWidget = true;
        chrome.runtime.sendMessage({fn: 'setIcon'}, () => void chrome.runtime.lastError);
        clearTimeout(self.loadingTimer);
        self.isInjectingWidget = false;
        await setClickToRead(self.isClickToRead);
    }
    function toggleWidget(request, sender, sendResponse) {
        if ((request && request.toShow) || self.frame.style.display === 'none') {
            setWidgetVisibility(true);
            setWidgetSetting('isVisible', true);
            setWidgetUI(request);
        } else {
            setWidgetVisibility(false);
            setWidgetSetting('isVisible', false);
        }
    }
    function setWidgetVisibility(val) {
        if (val) {
            self.frame.style.display = 'block';
        } else {
            self.frame.style.display = 'none';
        }
        self.isVisible = val;
    }
    function configureWidgetFrame(mode) {
        for (let property in self.frameStyles[mode]) {
            self.frame.style[property] = self.frameStyles[mode][property];
        }
    }
    chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
        if (request.fn in nrExtWidget) {
            nrExtWidget[request.fn](request, sender, sendResponse);
            if (nrExtWidget.isAsyncFunction(request.fn)) {
                return true;
            }
        } else if (request.message === 'injectWidget') {
            injectWidget(request, sender, sendResponse);
            return true;
        } else if (request.message === 'readerOnPlay') {
            setUIOnPlay();
            updateProgress(request.index);
            incrementProgressTime(request.index);
            setCCText(request.texts[request.index].processed, request.index);
            if (nrCC.isCC && request.beingReadTabId === request.activeTabId) {
                nrCC.setCCVisibility(true);
            } else {
                nrCC.setCCVisibility(false);
            }
        } else if (request.message === 'readerOnLoading') {
            setUIOnLoading();
        } else if (request.message === 'readerOnPause') {
            setUIOnPause();
            clearInterval(self.progressTimeIncrementor);
            self.progressTimeIncrementor = null;
        } else if (request.message === 'readerOnStop') {
            setUIOnStop();
            self.texts = null;
        } else if (request.message === 'textsToReadOnChange') {
            self.texts = request.texts;
            setProgressTime(request.texts);
            setProgressMax(request.texts);
        } else if (request.message === 'tabOnActivated') {
            setWidgetUI(request);
        } else if (request.fn === 'setLoggedInUI' || request.fn === 'setLoggedOutUI') {
            chrome.runtime.sendMessage({fn: 'getWidgetSettings'}, async (_widgetSettings) => {
                if (chrome.runtime.lastError) { }
                widgetSettings = _widgetSettings;
                if (widgetSettings && widgetSettings.userInfo)
                    setUserUI(widgetSettings.userInfo, widgetSettings.loggedIn);
            })
        } else if (request.message === 'readSelectionOnEnd') {
        } else if (request.message === 'toggleShowReadIcon') {
            setReadIcon(request.value);
        } else if (request.message === 'highlightColourOnChange') {
            setCCBackgroundColour(request.highlightColour, request.oldHighlightColour);
        } else if (request.message === 'updateVoice') {
            chrome.runtime.sendMessage({fn: 'getWidgetSettings'}, (widgetSettings) => {
                if (chrome.runtime.lastError) { }
                updateVoice(widgetSettings);
            });
        }
    });
    function setCCBackgroundColour(newColour, oldColour = null) {
        if (!self.ccContainer)
            return;
        if (oldColour) {
            self.ccContainer.classList.remove('nr-sentence-highlight-' + oldColour);
        }
        self.ccContainer.classList.add('nr-sentence-highlight-' + newColour);
    }
    function setLoggedInUI() {
        if (self.signupBtn)
            self.signupBtn.style.visibility = "hidden";
        setMenuStatus(self.mobileMenu, 'mobile-status', 'save');
        setProfileContainerStatus('login')
        self.refreshLicenseBtn.style.display = "inline-block";
        self.refreshLicenseBtnIcon.classList.remove('spin');
        if (self.peBtn)
            self.peBtn.disabled = false;
    }
    function setUserInfoUI(userInfo) {
        let userEmail = self.widgetDocument.getElementById("userEmail");
        let userLicType = self.widgetDocument.getElementById("userLicType");
        if (!userInfo) {
            userEmail.innerText = '';
            userLicType.innerText = self.freeUserText;
        };
        if (userInfo.email && userInfo.email != self.defaultEmail) {
            userEmail.innerText = userInfo.email;
        } else {
            userEmail.innerText = '';
        }
        let userLicNum = 0;
        if (userInfo.licNum) {
            userLicNum = userInfo.licNum;
        }
        else if (userInfo.license) {
            userLicNum = userInfo.license;
            if (userLicNum === "0") {
                userLicNum = 0;
            }
            else if (userLicNum === "12") {
                userLicNum = 12;
            } else if (userLicNum === "32") {
                userLicNum = 32;
            } else if (userLicNum === "13") {
                userLicNum = 13;
            }
        }
        let pwLicNum = userInfo.pwLicNum;
        resetUserPlans();
        if (userLicNum == 12) {
            userLicType.innerText = self.premUserText;
            setUserPlans('prem-user', ['prem-plus-upgrade']);
        } else if (userLicNum == 13) {
            userLicType.innerText = self.plusUserText;
            setUserPlans('plus-user');
        } else if (userLicNum >= 33 && pwLicNum == 0) {
            userLicType.innerText = self.eduPremUserText;
            setUserPlans('prem-user', ['free-plus-upgrade']);
        } else if (userLicNum >= 33 && pwLicNum == 12) {
            userLicType.innerText = self.eduPremUserText;
            setUserPlans('prem-user', ['prem-plus-upgrade']);
        } else if (userLicNum == 32 && pwLicNum == 0) {
            userLicType.innerText = self.freeEduPremUserText;
            setUserPlans('free-user', ['free-plus-upgrade']);
        } else if (userLicNum == 32 && pwLicNum == 12) {
            userLicType.innerText = self.freeEduPremUserText;
            setUserPlans('free-user', ['prem-plus-upgrade']);
        } else if (userLicNum == 31 && pwLicNum == 0) {
            userLicType.innerText = self.eduPremUserExpiredText;
            setUserPlans('free-user', ['prem-upgrade', 'free-plus-upgrade']);
        } else {
            userLicType.innerText = self.freeUserText;
            setUserPlans('free-user', ['prem-upgrade', 'free-plus-upgrade']);
        }
    }
    function setLoggedOutUI() {
        if (self.signupBtn)
            self.signupBtn.innerText = self.signupBtnText;
        self.signupBtn.style.visibility = "visible";
        setProfileContainerStatus('init')
        setMenuStatus(self.mobileMenu, 'mobile-status', 'init');
        self.refreshLicenseBtn.style.display = "none";
        if (self.peBtn)
            self.peBtn.disabled = true;
    }
    function resetUserPlans() {
        let planIds = ['free-user', 'prem-user', 'prem-upgrade', 'plus-user', 'free-plus-upgrade', 'prem-plus-upgrade'];
        for (i in planIds) {
            let planElm = self.widgetDocument.getElementById(planIds[i]);
            if (planElm)
                planElm.style.display = "none";
        }
    }
    function setUserPlans(user, upgrade) {
        changeDisplay('premUpgradeBtn', false);
        changeDisplay('freePlusUpgradeBtn', false);
        changeDisplay('premPlusUpgradeBtn', false);
        if (upgrade) {
            for (i in upgrade) {
                const upgradeElm = self.widgetDocument.getElementById(upgrade[i]);
                upgradeElm.style.display = "block";
            }
        }
    }
    function setUserUI(userInfo, loggedIn) {
        if (loggedIn) {
            setLoggedInUI();
            setUserInfoUI(userInfo);
        } else {
            setLoggedOutUI();
            setUserInfoUI(userInfo);
        }
    }
    function isAsyncFunction(fnName) {
        return self.asyncFunctions.includes(fnName);
    }
    function convertToPdf() {
        chrome.runtime.sendMessage({fn: 'getWidgetSettings'}, (widgetSettings) => {
            if (chrome.runtime.lastError) {
                setMenuStatus(self.mobileMenu, 'mobile-status', 'error');
                return;
            }
            const userId = widgetSettings.userInfo ? widgetSettings.userInfo.id : '';
            setMenuStatus(self.mobileMenu, 'mobile-status', 'loading');
            doc.parseForConvertToPdf().then(function(elements) {
                fetch(chrome.runtime.getURL("assets/template.html"))
                    .then((response) => {
                        return response.text();
                    }).then((htmlstr) => {
                        let title = '';
                        let titleTags = document.head.getElementsByTagName('title');
                        if (titleTags.length > 0) {
                            title = titleTags[0].innerText;
                        }
                        var description = getMeta('Description');
                        if (description == '') {
                            description = getMeta('description');
                        }
                        let texts = [];
                        for (var i = 0; i != elements.length; i++) {
                            if (title == '') {
                                const domName = elements[i].nodeName.toLowerCase();
                                if (domName == 'h1' || domName == 'h2') {
                                    title = elements[i].innerText;
                                }
                                continue;
                            }
                            texts.push(elements[i].innerText);
                        }
                        htmlstr += title + '</div>';
                        htmlstr += '<div class="pdf-subtitle">' + description + '</div>';
                        htmlstr += '<section class="pdf-content">';
                        for (var i = 0; i != texts.length; i++) {
                            htmlstr += '<p class="pdf-paragraphs">' + texts[i] + '</p>';
                        }
                        htmlstr += '</section></body></html>';
                        const xhr = new XMLHttpRequest();
                        const params = new URLSearchParams();
                        params.set('html', htmlstr);
                        params.set('title', title);
                        if (userId) {
                            params.set('userid', userId);
                        }
                        xhr.open('POST', 'https://uploadocr.naturalreaders.com/html2pdf');
                        xhr.onreadystatechange = function() {
                            if (this.readyState === XMLHttpRequest.DONE && this.status >= 400) {
                                setMenuStatus(self.mobileMenu, 'mobile-status', 'error');
                                self.saveToMobileErrorMsg.innerText = 'Server error';
                            }
                            if (this.readyState === XMLHttpRequest.DONE && this.status === 200) {
                                setMenuStatus(self.mobileMenu, 'mobile-status', 'finish');
                                setLastRead(userId, title, JSON.parse(xhr.response).pdfurl);
                            }
                        }
                        xhr.onerror = function(err) {
                            setMenuStatus(self.mobileMenu, 'mobile-status', 'error');
                            self.saveToMobileErrorMsg.innerText = 'Server error';
                        };
                        try {
                            xhr.send(params);
                        } catch (e) {
                            setMenuStatus(self.mobileMenu, 'mobile-status', 'error');
                            self.saveToMobileErrorMsg.innerText = 'Server or unknown error';
                        }
                    })
                    .catch(err => {
                        setMenuStatus(self.mobileMenu, 'mobile-status', 'error');
                        self.saveToMobileErrorMsg.innerText = 'Unknown error';
                    });
            })
                .catch(err => {
                    setMenuStatus(self.mobileMenu, 'mobile-status', 'error');
                    self.saveToMobileErrorMsg.innerText = 'Error getting texts from the page';
                });
        });
    }
    function setLastRead(userId, title, fileurl) {
        const xhr = new XMLHttpRequest();
        const params = new URLSearchParams();
        params.set('userid', userId);
        params.set('apikey', 'b98x9xlfs54ws4k0wc0o8g4gwc0w8ss');
        params.set('title', title);
        params.set('fileurl', fileurl);
        params.set('speed', 0);
        params.set('speaker', '0#0');
        params.set('pageindex', 0);
        params.set('sentenceindex', 0);
        xhr.open('GET', 'https://webapi.naturalreaders.com/personweb/addlastread?' + params.toString());
        xhr.onreadystatechange = function() {
            if (this.readyState === XMLHttpRequest.DONE && this.status >= 400) {
            }
            if (this.readyState === XMLHttpRequest.DONE && this.status === 200) {
            }
        }
        xhr.onerror = function(err) {
        };
        try {
            xhr.send(params);
        } catch (e) {
        }
    }
    function getMeta(metaName) {
        const metas = document.getElementsByTagName('meta');
        for (let i = 0; i < metas.length; i++) {
            if (metas[i].getAttribute('name') === metaName) {
                return metas[i].getAttribute('content');
            }
        }
        return '';
    }
    function getHasTextProcessor(request, sender, sendResponse) {
        try {
            if (nrTextProcessor === undefined) {
                sendResponse(false);
            } else {
                sendResponse(true);
            }
            return true;
        } catch (err) {
            sendResponse(false);
            return true;
        }
    }
    function getHasWidget(request, sender, sendResponse) {
        sendResponse(self.hasWidget);
    }
    function voicesOnLoad(request, sender, sendResponse) {
        if (!self.isVoicesInit) {
            setUIVoiceLists();
        }
    }
    function setSpeedSliderValue(value, shouldSetWidgetSetting = true) {
        self.speedValue.value = value;
        const event = new Event('change');
        self.speedValue.dispatchEvent(event);
        if (shouldSetWidgetSetting) {
            setWidgetSetting('speed', value);
        }
    }
    function setVolumeSliderValue(value, shouldSetWidgetSetting = true) {
        self.volumeValue.value = value;
        const event = new Event('change');
        self.volumeValue.dispatchEvent(event);
        if (shouldSetWidgetSetting) {
            setWidgetSetting('volume', value);
        }
    }
    function updateProgress(senIndex = 0, pageIndex = null, percentage = null, lastModified = null, tag = 'nr-ext-widget') {
        let progressValue;
        if (!self.progressValue.value) {
            progressValue = {
                sentenceIndex: 0,
                pageIndex: -1,
                percentage: 0,
                lastModified: 'sentence',
                tag: tag
            };
        } else {
            progressValue = JSON.parse(self.progressValue.value);
            progressValue.tag = tag;
        }
        if (getTypeOfProgressMode(readOption) === 'page') {
            if (doc.getPageIndex() === -1) {
                progressValue.pageIndex = doc.getPages().length - 1;
            } else {
                progressValue.pageIndex = doc.getPageIndex();
            }
        }
        if (pageIndex != null) {
            progressValue.pageIndex = pageIndex;
        }
        progressValue.sentenceIndex = senIndex;
        if (percentage != null) {
            progressValue.percentage = percentage;
        }
        if (lastModified != null) {
            progressValue.lastModified = lastModified;
        }
        self.progressValue.value = JSON.stringify(progressValue);
        self.progressTimeCurr.innerText = self.indexToProgressTime[senIndex] ? self.indexToProgressTime[senIndex].displayedTime : '0:00';
        setProgressUI();
        const event = new Event('change');
        self.progressValue.dispatchEvent(event);
    }
    function getReadProgressIndexBySlider() {
        let progressValue = JSON.parse(self.progressValue.value);
        if (getTypeOfProgressMode(readOption) === 'page') {
            return parseInt(progressValue.pageIndex);
        } else {
            return parseInt(progressValue.sentenceIndex);
        }
    }
    function setProgressMax(texts) {
        return new Promise((resolve) => {
            let maxValue = {
                readOption: 'all',
                texts: texts,
                pageCount: -1
            };
            if (texts.length > 0) {
                chrome.runtime.sendMessage({fn: 'getReadOption'}, function(_readOption) {
                    if (chrome.runtime.lastError) { }
                    maxValue.readOption = _readOption;
                    readOption = _readOption;
                    if (getTypeOfProgressMode(readOption) === 'page') {
                        maxValue.pageCount = doc.getPages().length;
                    }
                    if (self.progressMax.value !== JSON.stringify(maxValue)) {
                        self.progressMax.value = JSON.stringify(maxValue);
                        var ev = new Event('change');
                        self.progressMax.dispatchEvent(ev);
                    }
                    resolve();
                });
            } else {
                if (self.progressMax.value !== JSON.stringify(maxValue)) {
                    self.progressMax.value = JSON.stringify(maxValue);
                    var ev = new Event('change');
                    self.progressMax.dispatchEvent(ev);
                }
                resolve();
            }
        })
    }
    function setProgressTime(texts = null) {
        if (!texts) {
            return;
        }
        let numChars = 0
        texts.map((text, index) => {
            if (index === 0) {
                self.indexToProgressTime[index] = {displayedTime: "0:00", seconds: 0};
            } else {
                const seconds = Math.round(numChars / speedToCharsPerSecond[self.speedValue.value]);
                self.indexToProgressTime[index] = {displayedTime: secondsToHHMMSS(seconds), seconds};
            }
            numChars += text.processed.length;
        });
        const seconds = Math.round(numChars / speedToCharsPerSecond[self.speedValue.value]);
        self.indexToProgressTime[texts.length] = {displayedTime: secondsToHHMMSS(seconds), seconds};
        self.progressTimeTotal.innerText = secondsToHHMMSS(Math.round(numChars / speedToCharsPerSecond[self.speedValue.value]));
        setProgressUI();
    }
    function setProgressUI() {
        if (doc.type === 'googleDoc' || doc.type === 'googleDrivePreview') {
            self.progressLabel.style.display = 'none';
            const labelW = self.progressLabel.clientWidth + 'px';
            var sliderW = 'calc(100% - ' + labelW + ')';
            self.progressSlider.style.width = sliderW;
        } else {
            if (self.progressLabel.clientWidth > 0) {
                self.progressLabel.style.display = 'block';
                const labelW = (self.progressLabel.clientWidth + 10) + 'px';
                var sliderW = 'calc(100% - ' + labelW + ')';
                self.progressSlider.style.width = sliderW;
            }
        }
    }
    function incrementProgressTime(index) {
        if (!self.indexToProgressTime[index] || !self.indexToProgressTime[index + 1]) {
            return;
        }
        const currIndexTime = self.indexToProgressTime[index].seconds;
        const nextIndexTime = self.indexToProgressTime[index + 1].seconds;
        const timeDiff = nextIndexTime - currIndexTime;
        let currSecond = currIndexTime;
        if (self.progressTimeIncrementor) {
            clearInterval(self.progressTimeIncrementor);
            self.progressTimeIncrementor = null;
        }
        self.progressTimeIncrementor = setInterval(() => {
            currSecond++;
            self.progressTimeCurr.innerText = secondsToHHMMSS(currSecond);
            if (currSecond == 3600) {
                setProgressUI();
            }
        }, 1000)
    }
    function secondsToHHMMSS(sec) {
        const sec_num = parseInt(sec, 10);
        let hours = Math.floor(sec_num / 3600);
        let minutes = Math.floor((sec_num - (hours * 3600)) / 60);
        let seconds = sec_num - (hours * 3600) - (minutes * 60);
        if (hours >= 1 && hours < 10) {hours = "0" + hours;}
        if (minutes < 10) {minutes = "0" + minutes;}
        if (seconds < 10) {seconds = "0" + seconds;}
        if (hours < 1) {
            return minutes + ':' + seconds;
        } else {
            return hours + ':' + minutes + ':' + seconds;
        }
    }
    function getTypeOfProgressMode(_readOption) {
        let _mode = 'sentence';
        if (typeof doc !== 'undefined' && (doc.type === 'googleDoc' || doc.type === 'googleDrivePreview')) {
            if (doc.getPages().length > 1 && _readOption !== 'selection') {
                _mode = 'page';
            }
        }
        return _mode;
    }
    function getReadSliderMax() {
        let _value = JSON.parse(self.progressMax.value);
        maxValue = _value.texts.length;
        if (getTypeOfProgressMode(readOption) === 'page') {
            maxValue = _value.pageCount;
        }
        return maxValue;
    }
    //    
    //    
    //     var x = e.clientX - rect.left;
    //     var y = e.clientY - rect.top; 
    //    
    function calculateProgressByPosition(x, y, rect) {
        var percent = 0;
        if (x > rect.width / 2) {
            percent = y * 50 / rect.height;
        } else {
            percent = (rect.height - y) * 50 / rect.height + 50;
        }
        return percent;
    }
    //    
    //    
    function setCircleProgress(start, end) {
        let prevProgress = start;
        if (isNaN(prevProgress)) {
            prevProgress = -1;
        }
        window.requestAnimationFrame(render);
        curCircleProgress = end;
        function render() {
            prevProgress += 1;
            if (prevProgress >= 50 && !over) {
                over = true;
                self.progress.classList.add('over50');
            }
            var nrdeg = (3.6 * prevProgress) + 'deg';
            self.widgetDocument.documentElement.style.setProperty('--nrdeg', nrdeg);
            if (prevProgress < end) {
                window.requestAnimationFrame(render);
            }
        }
    }
    function resetReadProgress() {
        over = false;
        self.progress.classList.remove('over50');
        setCircleProgress(-1, 0);
    }
    //    
    function initTooltip(elem, direction, text) {
        let tooltip = setTooltip(elem, direction, text);
        elem.onmouseenter = function() {
            if (elem.id === 'nr-ext-btn-relocate' && self.mode === 'min') {
                return;
            }
            tooltip.style.display = "block";
            tooltip.style.visibility = "visible";
        };
        elem.onmouseleave = function() {
            tooltip.style.display = "none";
        };
        tooltip.onmouseenter = function() {
            tooltip.style.display = "none";
        };
    }
    function setTooltip(elem, direction, text) {
        let tooltip = document.createElement("span");
        if (text.length > 20) {
            tooltip.classList.add('tooltip');
        }
        tooltip.classList.add(direction + 'Tooltip');
        tooltip.style.display = "none";
        tooltip.innerHTML = text;
        elem.appendChild(tooltip);
        return tooltip;
    }
    function setTooltipText(elem, direction, text) {
        let tooltips = elem.getElementsByClassName(direction + "Tooltip");
        for (let i = 0; i < tooltips.length; i++) {
            tooltips[i].innerHTML = text;
        }
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
        }
    }
    function setCCText(text, index) {
        $(self.ccText).empty();
        let textNode = document.createTextNode(text);
        self.ccText.appendChild(textNode);
    }
    function getWidgetElements() {
        return widgetElements;
    }
}
var nrExtWidget = nrExtWidget || new NRExtWidget();