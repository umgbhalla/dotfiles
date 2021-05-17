function NRDomController() {
    let self = this;
    self.highlightColour = 'light';
    self.beHighlighted = [];
    self.isAutoScroll = true;
    self.readerState = 'init';
    self.setCurrRead = setCurrRead;
    self.currHighlightedSentence = null;
    self.currHighlightedCCSentence = null;
    self.currHighlightedWord = null;
    self.currHighlightedCCWord = null;
    self.highlightSentence = highlightSentence;
    self.highlightWord = highlightWord;
    self.scrollTo = scrollTo;
    self.removeHighlight = removeHighlight;
    self.setUI = setUI;
    self.scrollToAdjacentPage = scrollToAdjacentPage;
    self.scrollToPage = scrollToPage;
    self.bindClickToReadEvents = bindClickToReadEvents;
    self.asyncFunctions = ['scrollToAdjacentPage', 'scrollToPage'];
    self.beingReadTabId = null;
    self.activeTabId = null;
    let isVisible = false;
    let mode = 'min';
    function init() {
        chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
            if (self[request.fn]) {
                self[request.fn](request, sender, sendResponse);
                if (isAsyncFunction(request.fn)) {
                    return true;
                }
            } else if (request.message === 'readerOnPlay') {
                self.readerState = 'reading';
                self.beingReadTabId = request.beingReadTabId;
                self.activeTabId = request.activeTabId;
                if (request.beingReadTabId === request.activeTabId) {
                    setCurrRead(request.index);
                }
            } else if (request.message === 'readerOnLoading') {
                self.readerState = 'loading';
            } else if (request.message === 'setCurrRead') {
                if (request.beingReadTabId === request.activeTabId) {
                    setCurrRead(request.index);
                }
            } else if (request.message === 'readerOnPause') {
                self.readerState = 'pause';
                removeHighlight();
            } else if (request.message === 'readerOnStop') {
                self.readerState = 'init';
                removeHighlight();
            } else if (request.message === 'tabOnActivated') {
                self.beingReadTabId = request.beingReadTabId;
                self.activeTabId = request.activeTabId;
                if (request.beingReadTabId === request.activeTabId && request.activeTabId === request.tabId) {
                    setUI();
                } else {
                    removeHighlight();
                }
            } else if (request.message === 'highlightColourOnChange') {
                setHighlightColour(request.highlightColour, request.readerState)
            } else if (request.message === 'beHighlightedOnChange') {
                setBeHighlighted(request.beHighlighted);
            } else if (request.message === 'isAutoScrollOnChange') {
                setAutoScroll(request.isAutoScroll);
            } else if (request.message === 'modeOnChange') {
                mode = request.mode;
            } else if (request.message === 'isVisibleOnChange') {
                isVisible = request.isVisible;
            } else if (request.message === 'browserActionOnClicked') {
                self.beingReadTabId = request.beingReadTabId;
                self.activeTabId = request.activeTabId;
            }
        });
        chrome.runtime.sendMessage({fn: 'getWidgetSettings'}, async (widgetSettings) => {
            if (chrome.runtime.lastError) { }
            isVisible = widgetSettings.isVisible;
            mode = widgetSettings.mode;
        });
        setUI();
    }
    function isAsyncFunction(fn) {
        if (self.asyncFunctions.includes(fn)) {
            return true;
        } else {
            return false;
        }
    }
    function setCurrRead(index) {
        highlightSentence(index);
        const prevElement = document.getElementsByClassName('nr-s' + (index - 1))[0];
        const currElement = document.getElementsByClassName('nr-s' + index)[0];
        const isTextInView = isElementInViewport(prevElement) || isElementInViewport(currElement);
        if (self.isAutoScroll && isTextInView) {
            if(typeof nrExtWidget != 'undefined'){
                nrExtWidget.hideRelocateButton();
            }
            scrollTo(index);
        }
        if (!isTextInView && typeof nrExtWidget != 'undefined') {
            nrExtWidget.showRelocateButton();
        }
    }
    function isCCOn() {
        return typeof nrExtWidget != 'undefined' && nrExtWidget.isCC ? true : false;
    }
    function modifyPageHighlight() {
        let op = 'remove';
        chrome.runtime.sendMessage({fn: 'getReaderInfo'}, function(info) {
            if (chrome.runtime.lastError) { }
            if (!isCCOn() && info.readerState === 'reading') {
                op = 'add';
            }
            modifyHighlight(self.currHighlightedSentence, op, 'sentence');
            modifyHighlight(self.currHighlightedWord, op, 'word');
        });
    }
    function highlightSentence(index) {
        if (!self.beHighlighted.includes('sentence')) return;
        self.removeHighlight();
        self.currHighlightedSentence = document.getElementsByClassName("nr-s" + index);
        modifyHighlight(self.currHighlightedSentence, 'add', 'sentence');
    }
    function highlightWord(request, sender, sendResponse) {
        let sentenceIndex = request.sentenceIndex;
        let wordIndex = request.wordIndex;
        if (!self.beHighlighted.includes('word')) {
            return;
        }
        removeHighlight(['word']);
        let id = 'nr-s' + sentenceIndex + 'w' + wordIndex;
        self.currHighlightedWord = document.getElementsByClassName(id);
        if (typeof nrExtWidget != 'undefined') {
            let ccText = nrExtWidget.ccText;
            let ccId = 'nr-cc-s' + sentenceIndex + 'w' + wordIndex;
            self.currHighlightedCCWord = ccText.getElementsByClassName(ccId);
            modifyHighlight(self.currHighlightedCCWord, 'add', 'word');
        }
        if (!isCCOn()) {
            modifyHighlight(self.currHighlightedWord, 'add', 'word');
        }
    }
    function removeHighlight(toBeRemoved = ['sentence', 'word']) {
        if (toBeRemoved.includes('sentence')) {
            let highlightedSentences = Array.from(document.getElementsByClassName('nr-highlighted-sentence'));
            modifyHighlight(highlightedSentences, 'remove', 'sentence');
        }
        if (toBeRemoved.includes('word')) {
            let highlightedWords = Array.from(document.getElementsByClassName('nr-highlighted-word'));
            modifyHighlight(highlightedWords, 'remove', 'word');
            modifyHighlight(self.currHighlightedCCWord, 'remove', 'word');
        }
    }
    function modifyHighlight(elements, op, type) {
        if (elements) {
            for (let i = 0; i < elements.length; i++) {
                if (elements[i]) {
                    if (op === 'add' && self.beHighlighted.includes(type)) {
                        elements[i].classList.add('nr-' + type + '-highlight-' + self.highlightColour);
                        elements[i].classList.add('nr-highlighted-' + type);
                    } else {
                        elements[i].classList.remove('nr-' + type + '-highlight-' + self.highlightColour);
                        elements[i].classList.remove('nr-highlighted-' + type);
                    }
                }
            }
        }
    }
    function setHighlightColour(colour, readerState = 'pause') {
        self.removeHighlight();
        self.highlightColour = colour;
        if (readerState === 'reading') {
            if (self.beHighlighted.includes('sentence')) {
                modifyHighlight(self.currHighlightedSentence, 'add', 'sentence');
            }
            if (self.beHighlighted.includes('word')) {
                modifyHighlight(self.currHighlightedWord, 'add', 'word');
            }
        }
    }
    function setBeHighlighted(beHighlighted) {
        self.beHighlighted = beHighlighted;
        chrome.runtime.sendMessage({fn: 'getReaderInfo'}, function(info) {
            if (chrome.runtime.lastError) { }
            if (!self.beHighlighted.includes('sentence')) {
                removeHighlight(['sentence']);
            } else {
                if (info.readerState === 'reading') {
                    highlightSentence(info.index);
                }
            }
            if (!self.beHighlighted.includes('word')) {
                removeHighlight(['word']);
            }
        });
    }
    function setAutoScroll(val) {
        self.isAutoScroll = val;
        chrome.runtime.sendMessage({fn: 'getReaderInfo'}, function(info) {
            if (chrome.runtime.lastError) { }
            if (info.readerState === 'reading' && self.isAutoScroll) {
                scrollTo(info.index);
            }
        });
    }
    function scrollTo(index) {
        try {
            let element = null;
            element = document.getElementsByClassName('nr-s' + index)[0];
            if (element) {
                if (doc.type === 'googleDoc') {
                    element.scrollIntoView({behavior: 'smooth', block: 'nearest', inline: 'start'});
                } else {
                    element.scrollIntoView({behavior: 'smooth', block: 'center'});
                }
            }
        } catch (err) {
        }
    }
    function isElementInViewport(el) {
        if (el) {
            const rect = el.getBoundingClientRect();
            return (
                rect.top >= 0 &&
                rect.left >= 0 &&
                rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
                rect.right <= (window.innerWidth || document.documentElement.clientWidth)
            );
        } else {
            return false;
        }
    }
    function setUI() {
        chrome.runtime.sendMessage({fn: 'getWidgetSettings'}, function(widgetSettings) {
            if (chrome.runtime.lastError) { }
            setHighlightColour(widgetSettings.highlightColour, widgetSettings.readerState);
            setBeHighlighted(widgetSettings.beHighlighted);
            setAutoScroll(widgetSettings.isAutoScroll)
        });
        chrome.runtime.sendMessage({fn: 'getReaderInfo'}, function(info) {
            if (chrome.runtime.lastError) { }
            if (info.readerState === 'pause' || info.readerState === 'init') {
                removeHighlight();
            } else if (info.readerState === 'reading') {
                setCurrRead(info.index);
            }
        });
    }
    function scrollToAdjacentPage(msg, sender, sendResponse) {
        return new Promise(function(resolve) {
            if (doc.scrollToAdjacentPage) {
                return doc.scrollToAdjacentPage(msg.direction)
                    .then(resp => {
                        sendResponse(resp);
                        resolve(resp);
                    })
            } else {
                sendResponse("ERR");
            }
        })
            .catch((err) => {
                sendResponse("ERR");
            });
    }
    function scrollToPage(msg, sender, sendResponse) {
        return new Promise(function(resolve) {
            if (doc.scrollToPage) {
                return doc.scrollToPage(msg.pageIndex)
                    .then(resp => {
                        sendResponse(resp);
                        resolve(resp);
                    })
            } else {
                sendResponse("ERR");
            }
        })
            .catch((err) => {
                sendResponse("ERR");
            });
    }
    function removeSelection() {
        let selection = window.getSelection();
        selection.removeAllRanges();
    }
    function bindClickToReadEvents(ele) {
        let index = parseInt(ele.id.split('nr-s')[1]);
        ele.onmouseover = () => {
            removeClassFromElements(Array.from(document.getElementsByClassName('nr-onhover')), 'nr-onhover');
            if (nrExtWidget.isVisible) {
                chrome.runtime.sendMessage({fn: 'getWidgetSettings', key: 'isClickToRead'}, function(isClickToRead) {
                    if (chrome.runtime.lastError) {
                    }
                    if ((self.activeTabId === self.beingReadTabId) &&
                        isClickToRead) {
                        if ((self.readerState === 'pause' || self.readerState === 'init') &&
                            doc && doc.type === 'googleDoc') {
                            return;
                        } else {
                            let elements = Array.from(document.getElementsByClassName("nr-s" + index));
                            addClassToElements(elements, 'nr-onhover');
                        }
                    }
                });
            }
        }
        ele.onmouseout = () => {
            let elements = Array.from(document.getElementsByClassName("nr-s" + index));
            removeClassFromElements(elements, 'nr-onhover');
        }
        ele.onclick = debounce(() => {
            if (nrExtWidget.isVisible) {
                chrome.runtime.sendMessage({fn: 'getWidgetSettings', key: 'isClickToRead'}, function(isClickToRead) {
                    if (chrome.runtime.lastError) {
                    }
                    if ((self.activeTabId === self.beingReadTabId) &&
                        isClickToRead) {
                        if ((self.readerState === 'pause' || self.readerState === 'init')
                            && doc && doc.type === 'googleDoc') {
                            return;
                        } else {
                            chrome.runtime.sendMessage({fn: 'readIndex', index}, () => void chrome.runtime.lastError);
                        }
                    }
                });
            }
        });
    }
    function addClassToElements(elements, className) {
        elements.forEach(ele => {
            ele.classList.add(className);
        });
    }
    function removeClassFromElements(elements, className) {
        elements.forEach(ele => {
            ele.classList.remove(className);
        });
    }
    init();
}
var nrDomController = nrDomController || new NRDomController();