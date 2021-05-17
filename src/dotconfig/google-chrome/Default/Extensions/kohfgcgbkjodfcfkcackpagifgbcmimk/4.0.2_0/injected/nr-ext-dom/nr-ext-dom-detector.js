function NRDomDetector() {
    let self = this;
    self.frame = null;
    self.iconDocument = null;
    self.hasIcon = false;
    self.selectedText = '';
    self.switchIcon = switchIcon;
    self.setLimit = setLimit;
    self.LimitedReadSelectionOn = true;
    self.LimitedReadSelectionCharAmount = 20;
    self.iconState = true;
    self.offset = {start: -1, end: -1};
    self.isInjectingSD = false;
    self.mousePos = {x: 0, y: 0};
    self.isAsyncFunction = isAsyncFunction;
    self.asyncFunctions = ['getHasIcon'];
    self.getHasIcon = getHasIcon;
    self.hasSelectionOnPage = hasSelectionOnPage;
    self.hideReadIcon = hideReadIcon;
    self.removeSelection = removeSelection;
    self.curOnHoverEle = null;
    let iconElements = {
        'readIcon': {}
    };
    function hideReadIcon() {
        self.frame.style.display = 'none';
    }
    function removeSelection() {
        let selection = window.getSelection();
        selection.removeAllRanges();
    }
    function injectRSIcon(state) {
        if (!self.isInjectingSD && !self.hasIcon) {
            self.isInjectingSD = true;
            self.iconState = state['iconState'];
            self.LimitedReadSelectionOn = state['LimitedReadSelectionOn'];
            self.LimitedReadSelectionCharAmount = state['LimitedReadSelectionCharAmount']
            let iframe = document.createElement('iframe');
            self.frame = iframe;
            self.frame.id = "nr-ext-rsicon";
            self.frame.style.position = "absolute";
            self.frame.style.display = "none";
            self.frame.style.width = '50px';
            self.frame.style.height = '50px';
            self.frame.style.zIndex = "9000000000000000000";
            self.frame.style.borderStyle = "none";
            self.frame.style.background = 'transparent';
            document.body.appendChild(iframe);
            self.frame.onload = () => {
                frameContentOnLoad();
            }
            fetch(chrome.runtime.getURL("injected/nr-ext-dom/nr-ext-select-icon/nr-ext-select-icon.html"))
                .then((response) => {
                    return response.text();
                })
                .then((icon) => {
                    try {
                        self.frame.contentDocument.write(icon);
                        self.iconDocument = self.frame.contentDocument;
                        self.frame.contentDocument.close();
                    } catch (err) {
                        self.frame.contentDocument.close();
                    }
                });
        }
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
                self.iconDocument.head.appendChild(tag);
            }
            else if (type === "js") {
                tag = document.createElement("script");
                tag.type = "text/javascript";
                tag.src = url;
                self.iconDocument.body.appendChild(tag);
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
    async function frameContentOnLoad() {
        await loadResource(null, chrome.runtime.getURL('injected/nr-ext-dom/nr-ext-select-icon/nr-ext-select-icon.css'));
        await init();
        self.isInjectingSD = false;
        self.hasIcon = true;
    }
    async function init() {
        try {
            await initIconElements();
            await bindUIEvents();
            await initSelectEventListener();
        } catch (err) {
        }
    }
    function initSelectEventListener() {
        window.addEventListener('mouseup', e => {
            setTimeout(() => {
                if (self.iconState) {
                    if (hasSelectionOnPage()) {
                        showReadingIcon(e.pageX, e.pageY)
                    } else {
                        self.frame.style.display = 'none';
                    }
                }
            }, 0);
        });
        document.addEventListener('mousedown', (e) => {
            if (typeof doc !== 'undefined' && doc.type === 'googleDoc') {
                e.target.click();
            }
        })
        //                
        //                
        //                
        //                
        //                
        //                
        //                
        //                
    }
    function hasSelectionInHtml(toCheckSelectionChar = true) {
        self.offset = {start: -1, end: -1};
        let selection = window.getSelection();
        self.offset = {start: selection.anchorOffset, end: selection.focusOffset};
        if (selection.anchorNode === selection.focusNode && selection.anchorOffset === selection.focusOffset) {
            if (selection.toString().trim() !== '') {
                if (toCheckSelectionChar) {
                    return checkLimitedReadSelection(selection.toString().trim());
                } else {
                    return true;
                }
            } else {
                return false;
            }
        } else {
            let selectedNodes = getSelectedNodes();
            if (selectedNodes.textNodes.length > 0) {
                if (selection.anchorOffset != self.offset.start || selection.focusOffset != self.offset.end) {
                    if (toCheckSelectionChar) {
                        return checkLimitedReadSelection(selection.toString().trim());
                    } else {
                        return true;
                    }
                } else {
                    if (selection.toString().trim() !== '') {
                        if (toCheckSelectionChar) {
                            return checkLimitedReadSelection(selection.toString().trim());
                        } else {
                            return true;
                        }
                    } else {
                        self.offset = {start: -1, end: -1};
                        return false;
                    }
                }
            } else {
                if (selectedNodes.allNodes.length === 0) {
                    if (selection.toString().trim() !== '') {
                        if (toCheckSelectionChar) {
                            return checkLimitedReadSelection(selection.toString().trim());
                        } else {
                            return true;
                        }
                    } else {
                        return false;
                    }
                } else {
                    return false;
                }
            }
        }
    }
    function hasSelectionInGoogleDoc(toCheckSelectionChar = true) {
        hack();
        var doc = googleDocsUtil.getGoogleDocument();
        let selectedText = removeDumbChars(doc.selectedText);
        if (selectedText !== '') {
            if (toCheckSelectionChar) {
                return checkLimitedReadSelection(selectedText);
            } else {
                return true;
            }
        } else {
            return false;
        }
    }
    function checkLimitedReadSelection(selection) {
        if (self.LimitedReadSelectionOn && selection.length <= self.LimitedReadSelectionCharAmount) {
            return false;
        } else {
            return true;
        }
    }
    function hasSelectionOnPage(toCheckSelectionChar = true) {
        let hasSelection = false;
        if (window.docType === 'html') {
            if (hasSelectionInHtml(toCheckSelectionChar)) {
                hasSelection = true;
            }
        } else if (window.docType === 'google doc') {
            if (hasSelectionInGoogleDoc(toCheckSelectionChar)) {
                hasSelection = true;
            }
        }
        return hasSelection;
    }
    function initIconElements() {
        return new Promise((resolve) => {
            for (let ele in iconElements) {
                iconElements[ele] = self.iconDocument.getElementById(ele);
            }
            resolve();
        });
    }
    function bindUIEvents() {
        return new Promise((resolve) => {
            if (iconElements != null) {
                iconElements['readIcon'].onclick = () => {
                    self.frame.style.display = 'none';
                    chrome.runtime.sendMessage({fn: 'readSelection'}, () => void chrome.runtime.lastError);
                }
            } else {
            }
            resolve();
        });
    }
    function showReadingIcon(x, y) {
        self.frame.style.top = y + 5 + 'px';
        self.frame.style.left = x + 5 + 'px';
        self.frame.style.display = 'block';
        timeoutReadingIcon();
    }
    function timeoutReadingIcon() {
        clearTimeout(self.floatBarTimeout);
        self.floatBarTimeout = setTimeout(function() {
            self.frame.style.display = 'none';
            self.selectedText = '';
        }, 3000);
    }
    function switchIcon(value) {
        self.iconState = value;
    }
    function setLimit(value) {
        self.LimitedReadSelectionCharAmount = value;
    }
    chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
        if (self[request['fn']]) {
            self[request.fn](request, sender, sendResponse);
            if (self.isAsyncFunction(request.fn)) {
                return true;
            }
        } else if (request.message === 'toggleShowReadIcon') {
            switchIcon(request.value);
        }
        if (request.message === 'injectSD') {
            injectRSIcon(request.value);
        }
        if (request.message === 'setLimit') {
            setLimit(request.value);
        }
        if (request.message === 'hasSelectionOnPage') {
            sendResponse(hasSelectionOnPage());
            return true;
        }
    });
    function getHasIcon(request, sender, sendResponse) {
        sendResponse(self.hasIcon);
    }
    function isAsyncFunction(fn) {
        if (self.asyncFunctions.includes(fn)) {
            return true;
        } else {
            return false;
        }
    }
    function removeDumbChars(text) {
        return text && text.replace(/\u200c/g, '');
    }
    function hack() {
        var selections = $(".kix-selection-overlay").get();
        var windowHeight = $(window).height();
        var index = binarySearch(selections, function(el) {
            var viewportOffset = el.getBoundingClientRect();
            if (viewportOffset.top < 120) return 1;
            if (viewportOffset.top >= windowHeight) return -1;
            return 0;
        })
        if (index != -1) {
            var validSelections = [selections[index]];
            var line = selections[index].parentNode;
            while (true) {
                line = findPreviousLine(line);
                if (line && $(line).hasClass("kix-lineview") && $(line.firstElementChild).hasClass("kix-selection-overlay")) validSelections.push(line.firstElementChild);
                else break;
            }
            line = selections[index].parentNode;
            while (true) {
                line = findNextLine(line);
                if (line && $(line).hasClass("kix-lineview") && $(line.firstElementChild).hasClass("kix-selection-overlay")) validSelections.push(line.firstElementChild);
                else break;
            }
            if (selections.length != validSelections.length) $(selections).not(validSelections).remove();
        }
        else {
            $(selections).remove();
        }
    }
    function binarySearch(arr, testFn) {
        var m = 0;
        var n = arr.length - 1;
        while (m <= n) {
            var k = (n + m) >> 1;
            var cmp = testFn(arr[k]);
            if (cmp > 0) m = k + 1;
            else if (cmp < 0) n = k - 1;
            else return k;
        }
        return -1;
    }
    function findPreviousLine(line) {
        return line.previousElementSibling ||
            line.parentNode.previousElementSibling && line.parentNode.previousElementSibling.lastElementChild ||
            $(line).closest(".kix-page").prev().find(".kix-page-content-wrapper .kix-lineview").get(-1)
    }
    function findNextLine(line) {
        return line.nextElementSibling ||
            line.parentNode.nextElementSibling && line.parentNode.nextElementSibling.firstElementChild ||
            $(line).closest(".kix-page").next().find(".kix-page-content-wrapper .kix-lineview").get(0)
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
var nrDomDetector = nrDomDetector || new NRDomDetector();