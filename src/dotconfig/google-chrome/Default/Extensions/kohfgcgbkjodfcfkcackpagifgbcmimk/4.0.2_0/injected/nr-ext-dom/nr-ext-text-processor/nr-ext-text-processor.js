function NRTextProcessor() {
    let self = this;
    self.processHtmlText = processHtmlText;
    self.processSentencesByLength = processSentencesByLength;
    self.getNlpSentences = getNlpSentences;
    let textsToRead = [];
    self.getTextsFromPage = getTextsFromPage;
    self.setVoiceByDocLang = setVoiceByDocLang;
    self.setWordsForMainTextAndCC = setWordsForMainTextAndCC;
    self.setWordForMainTextAndCC = setWordForMainTextAndCC;
    self.isSameText = isSameText;
    self.getCurrentIndex = getCurrentIndex;
    self.setWord = setWord;
    self.resetDocInnerTexts = resetDocInnerTexts;
    self.asyncFunctions = ['getTextsFromPage', 'setWordForMainTextAndCC', 'getCurrentIndex', 'isSameText'];
    function getCurrentIndex(request, sender, sendResponse) {
        let currentPageIndex = 0;
        if (doc.getCurrentIndex) {
            currentPageIndex = doc.getCurrentIndex();
        }
        sendResponse(currentPageIndex);
    }
    function isSameText(request, sender, sendResponse) {
        if (doc.isSameText) {
            sendResponse(doc.isSameText());
        } else {
            sendResponse(true);
        }
    }
    function init() {
        chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
            if (self[request['fn']]) {
                self[request['fn']](request, sender, sendResponse);
                if (isAsyncFunction(request['fn'])) {
                    return true;
                }
            } else if (request.message === 'removeNRTags') {
                removeNRTags();
            } else if (request.message === 'setVoiceByDocLang') {
                setVoiceByDocLang(textsToRead);
            }
        });
    }
    function isAsyncFunction(fn) {
        if (self.asyncFunctions.includes(fn)) {
            return true;
        } else {
            return false;
        }
    }
    function resetDocInnerTexts() {
        doc.docInnerText = '';
    }
    function getTextsFromPage(request, sender, sendResponse) {
        return doc.getTexts(request.op, request.text)
            .then((texts) => {
                return new Promise((resolve) => {
                    let nrSentences = Array.from(document.getElementsByTagName('nr-sentence'));
                    nrSentences.forEach(nrSentence => {
                        nrDomController.bindClickToReadEvents(nrSentence);
                    });
                    textsToRead = texts;
                    resolve();
                });
            })
            .then(() => {
                return setVoiceByDocLang(textsToRead);
            })
            .then(() => {
                sendResponse(textsToRead);
                return Promise.resolve();
            })
            .catch((err) => {
                if (err === 'ERR_ALREADY_PARSED') {
                    sendResponse(textsToRead);
                }
            });
    }
    function setVoiceByDocLang(texts) {
        return new Promise(async (resolve) => {
            chrome.runtime.sendMessage({fn: 'getWidgetSettings', key: 'isAutoSelectVoice'}, async function(isAutoSelectVoice) {
                if (chrome.runtime.lastError) {
                }
                if (isAutoSelectVoice) {
                    let lang = getLang() || await detectLanguage(texts);
                    chrome.runtime.sendMessage({fn: 'autoSelectVoice', lang: lang}, function(res) {
                        if (chrome.runtime.lastError) { }
                        resolve();
                    });
                } else {
                    resolve();
                }
            })
        })
            .catch(err => {
            });
    }
    function setWordsForMainTextAndCC(request, sender, sendResponse) {
        let sentenceIndex = request.index;
        let words = request.words;
        setWords('', sentenceIndex, words);
        setWords('cc', sentenceIndex, words);
    }
    async function setWordForMainTextAndCC(request, sender, sendResponse) {
        try {
            let word = request.word;
            let wordIndex = request.wordIndex;
            let sentenceIndex = request.sentenceIndex;
            let prevLastNrWordTextNode = getLastPrevNrWordTextNode('', sentenceIndex, wordIndex);
            let ccPrevLastNrWordTextNode = getLastPrevNrWordTextNode('cc', sentenceIndex, wordIndex);
            await replaceNRTagsWithTextNodes('nr-word', false);
            await setWord('', word, wordIndex, sentenceIndex, prevLastNrWordTextNode);
            setCCWord(word, wordIndex, sentenceIndex);
            sentenceElems = Array.from(document.getElementsByClassName('nr-s' + sentenceIndex));
            sentenceElems.map(s => {
                s.normalize();
            });
            sendResponse();
        } catch (err) {
            sendResponse();
        }
    }
    async function setWords(type, sentenceIndex, words) {
        try {
            let index = 0;
            let sentenceName = 'nr-' + type + (type ? '-' : '') + 's' + sentenceIndex;
            await replaceNRTagsWithTextNodes('nr-word');
            let sentenceElems = Array.from(document.getElementsByClassName(sentenceName));
            let copiedWords = createDeepCopy(words);
            for (let i = 0; i < sentenceElems.length; i++) {
                let nrSentence = sentenceElems[i];
                nrSentence.normalize();
                let walk = document.createTreeWalker(nrSentence, NodeFilter.SHOW_TEXT, null, false);
                let n = null;
                while (n = walk.nextNode()) {
                    let result = await setWordsHelper(n, sentenceName, copiedWords, index);
                    if (!result || !result.node) {
                        break;
                    }
                    let nextIndex = result.index;
                    walk.currentNode = result.node;
                    if (index != nextIndex) {
                        index = nextIndex;
                        if (index > words.length - 1) {
                            break;
                        }
                    }
                }
            }
        } catch (err) {
        }
    }
    async function setWordsHelper(textNode, sentenceName, words, index) {
        try {
            if (index > words.length - 1) {
                return;
            }
            if (!(textNode.nodeValue && processHtmlText(textNode.nodeValue).trim() !== '')) {
                return {index: index, node: textNode};
            }
            let i = 0
            let start = 0;
            let nodeText = textNode.nodeValue;
            let end = nodeText.length;
            let ttsWord = words[index];
            let nextIndex = index
            let isStartFound = false;
            while (i < nodeText.length) {
                if (processTextForCharComparison(nodeText[i]) === processTextForCharComparison(ttsWord[0])) {
                    if (!isStartFound) {
                        start = i;
                        isStartFound = true;
                    }
                    ttsWord = ttsWord.substring(1);
                    if (ttsWord.length === 0) {
                        i++;
                        nextIndex++;
                        break;
                    }
                }
                i++;
            }
            if (!isStartFound) {
                return {index: index, node: textNode};
            }
            end = i;
            words[index] = ttsWord;
            let nrWord = document.createElement('nr-word');
            $(nrWord).addClass(sentenceName + 'w' + index);
            if (start !== 0) {
                textNode = textNode.splitText(start);
                end = end - start;
            }
            let remainder = textNode.splitText(end);
            $(textNode).wrap(nrWord)
            return {index: nextIndex, node: textNode};
        } catch (err) {
        }
    }
    function setWord(type, word, wordIndex, sentenceIndex, lastPrevNrWordTextNode) {
        return new Promise(async (resolve) => {
            let sentenceName = 'nr-' + type + (type ? '-' : '') + 's' + sentenceIndex;
            chrome.runtime.sendMessage({fn: 'getWidgetSettings'}, async (widgetSettings) => {
                if (chrome.runtime.lastError) { }
                if (widgetSettings.beHighlighted.includes('word')) {
                    let sentenceElems = [];
                    if (type === 'cc' && typeof nrExtWidget != 'undefined') {
                        const ccText = nrExtWidget.ccText;
                        sentenceElems = Array.from(ccText.getElementsByClassName(sentenceName));
                    } else {
                        sentenceElems = Array.from(document.getElementsByClassName(sentenceName));
                    }
                    for (let i = 0; i < sentenceElems.length; i++) {
                        let nrSentence = sentenceElems[i];
                        let walk = document.createTreeWalker(nrSentence, NodeFilter.SHOW_TEXT, null, false);
                        let n = null;
                        while (n = walk.nextNode()) {
                            let result = await setWordHelper(n, lastPrevNrWordTextNode, sentenceName, word, wordIndex);
                            if (!result.node) {
                                break;
                            }
                            word = result.word;
                            if (!word) {
                                break;
                            }
                            walk.currentNode = result.node;
                        }
                        if (!word) {
                            break;
                        }
                    }
                    resolve(word);
                } else {
                    resolve(word);
                }
            });
        })
            .catch((err) => {
            });
    }
    function setCCWord(word, wordIndex, sentenceIndex) {
        try {
            nrExtWidget.ccText.normalize();
            const className = 'nr-cc-s' + sentenceIndex + 'w' + wordIndex;
            if ($(nrExtWidget.ccText).find("nr-cc-word").length === 0) {
                let html = $(nrExtWidget.ccText).html();
                html = html.replace(new RegExp('(' + word + ')', 'i'), '<nr-cc-word class="' + className + '">$1</nr-cc-word>');
                $(nrExtWidget.ccText).html(html);
                nrExtWidget.ccText.normalize();
            } else {
                let next = nrExtWidget.ccText.lastChild;
                $(nrExtWidget.ccText).find('nr-cc-word').contents().unwrap();
                let nextHtml = next.nodeValue;
                nextHtml = nextHtml.replace(new RegExp('(' + word + ')', 'i'), '<nr-cc-word class="' + className + '">$1</nr-cc-word>');
                $(next).replaceWith(nextHtml);
            }
        } catch (err) {
        }
    }
    function getLastPrevNrWordTextNode(type, sentenceIndex, wordIndex) {
        let sentenceName = 'nr-' + type + (type ? '-' : '') + 's' + sentenceIndex;
        let prevWordName = sentenceName + 'w' + (wordIndex - 1);
        let prevWordElems = [];
        if (type === 'cc' && typeof nrExtWidget != 'undefined') {
            const ccText = nrExtWidget.ccText;
            prevWordElems = Array.from(ccText.getElementsByClassName(prevWordName));
        } else {
            prevWordElems = Array.from(document.getElementsByClassName(prevWordName));
        }
        let lastPrevWordElem = prevWordElems[prevWordElems.length - 1];
        let lastPrevNrWordTextNodes = getTextNodes(lastPrevWordElem);
        let lastPrevNrWordTextNode = lastPrevNrWordTextNodes[lastPrevNrWordTextNodes.length - 1];
        return lastPrevNrWordTextNode;
    }
    function setWordHelper(textNode, lastPrevNrWord = null, sentenceName, word, index) {
        word = word.trim();
        try {
            if (lastPrevNrWord && lastPrevNrWord.compareDocumentPosition(textNode) !== Node.DOCUMENT_POSITION_FOLLOWING) {
                return {node: textNode, word: word};
            }
            if (!(textNode.nodeValue && processHtmlText(textNode.nodeValue).trim() !== '')) {
                return {node: textNode, word: word};
            }
            let i = 0
            let start = 0;
            let nodeText = $(textNode).text();
            let end = nodeText.length;
            let isStartFound = false;
            while (i < nodeText.length) {
                if (processTextForCharComparison(nodeText[i]) === processTextForCharComparison(word[0])) {
                    if (!isStartFound) {
                        start = i;
                        isStartFound = true;
                    }
                    word = word.substring(1);
                    if (word.length === 0) {
                        i++;
                        break;
                    }
                }
                i++;
            }
            if (!isStartFound) {
                return {node: textNode, word: word};
            }
            end = i;
            let nrWord = document.createElement('nr-word');
            $(nrWord).addClass(sentenceName + 'w' + index);
            if (start !== 0) {
                textNode = textNode.splitText(start);
                end = end - start;
            }
            let remainder = textNode.splitText(end);
            $(textNode).wrap(nrWord)
            return {node: textNode, word: word};
        } catch (err) {
        }
    }
    init();
}
var nrTextProcessor = nrTextProcessor || new NRTextProcessor();
var ignoreTags = ignoreTags || "select, textarea, button, label, audio, video, dialog, embed, menu, nav, noframes, noscript, object, script, style, svg, aside, footer, #footer, .no-read-aloud, #nr-webreader, #nr-ext-widget, .nr-webreader-trigger-container, .nr-webreader-check, .nr-webreader-frame";
var paragraphSplitter = paragraphSplitter || /(?:\s*\r?\n\s*){2,}/;
function getInnerText(elem) {
    let text = elem.innerText;
    return text ? text.trim() : "";
}
function removeExtraSpace(text) {
    return text.replace(/\s{2,}/g, ' ').trim();
}
function isNotEmpty(text) {
    return text;
}
function fixParagraphs(texts) {
    let out = [];
    let para = "";
    for (let i = 0; i < texts.length; i++) {
        if (!texts[i]) {
            if (para) {
                out.push(para);
                para = "";
            }
            continue;
        }
        if (para) {
            if (/-$/.test(para)) para = para.substr(0, para.length - 1);
            else para += " ";
        }
        para += texts[i].replace(/-\r?\n/g, "");
        if (texts[i].match(/[.!?:)"'\u2019\u201d]$/)) {
            out.push(para);
            para = "";
        }
    }
    if (para) out.push(para);
    return out;
}
function tryGetTexts(getTexts, millis) {
    return waitMillis(500)
        .then(getTexts)
        .then(function(texts) {
            if (texts && !texts.length && millis - 500 > 0) return tryGetTexts(getTexts, millis - 500);
            else return texts;
        });
    function waitMillis(millis) {
        return new Promise(function(fulfill) {
            setTimeout(fulfill, millis);
        });
    }
}
function loadPageScript(url) {
    if (!$("head").length) $("<head>").prependTo("html");
    $.ajax({
        dataType: "script",
        cache: true,
        url: url
    });
}
function getLang() {
    var lang = document.documentElement.lang || $("html").attr("xml:lang");
    if (lang) lang = lang.split(",", 1)[0].replace(/_/g, '-');
    if (lang == "en" || lang == "en-US") lang = null;   
    return lang;
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
function processSentencesByLength(sentences) {
    let result = [];
    for (let i = 0; i < sentences.length; i++) {
        let blocks = splitIntoSentences(sentences[i]);
        blocks = mergeShort(blocks);
        result.push(...blocks);
    }
    return result;
}
function processHtmlText(text) {
    text = removeLineBreaks(text);
    text = replaceHTMLSpaces(text);
    text = removeExtraSpaces(text);
    text = removeDumbChars(text);
    return text;
}
function removeDumbChars(text) {
    return text && text.replace(/\u200c/g, '');
}
function removeLineBreaks(text) {
    return text.replace(/(\r\n|\n|\r)/gm, " ");
}
function replaceHTMLSpaces(text) {
    text = text.replace(/&nbsp;/gi, ' ');
    text = text.replace(/[\u200c|\u200b|\u200d|\ufeff]/gi, ' ');
    return text;
}
function removeExtraSpaces(text) {
    return text.replace(/\s+/g, ' ');
}
function getNlpSentences(text) {
    let sentences = nlp(text).sentences().data();
    return sentences.map(x => x.text.trim());
}
function processTextForCharComparison(text) {
    let processedText = processHtmlText(text);
    processedText = processedText.replace(/[\u2018|\u2019|\u2039|\u203A]/g, "'");
    processedText = processedText.replace(/[\u2014|\u2015]/g, '-');
    return processedText.toLowerCase();
}
function splitIntoSentences(str, maxLength = 200) {
    let result = [];
    let i = 0;
    while (str.length > 0) {
        let indexOfSplitPoint = getIndexOfSplitPoint(str, maxLength);
        let sentence = str.substring(i, indexOfSplitPoint + 1);
        result.push(sentence);
        str = str.substring(indexOfSplitPoint + 1);
    }
    return result;
}
function mergeShort(blocks) {
    let longText = "";
    let newBlocks = [];
    for (let j = 0; j != blocks.length; j++) {
        longText += blocks[j];
        let canAdd = true;
        if (j + 1 < blocks.length) {
            if ((longText + blocks[j + 1]).length > 250) {
                canAdd = false;
            }
            if (longText.length < 50) {
                canAdd = true;
            }
        }
        if (j == blocks.length - 1 || !canAdd) {
            newBlocks.push(longText);
            longText = "";
        }
    }
    return newBlocks;
}
function getIndexOfSplitPoint(text, length) {
    let endPunctuations = ["?", "!", "¿", "¡", "。", "～", "……", "！", "？"];
    let midPunctuations = [",", ";", ":", "，", "；", "："];
    let textWithinRange = text.substring(0, length);
    if (text.length <= length) {
        return text.length - 1;
    } else {
        let indexOfSplitPoint = Number.MAX_VALUE;
        for (let i = 0; i < endPunctuations.length; i++) {
            let index = textWithinRange.indexOf(endPunctuations[i]);
            if (index <= indexOfSplitPoint && index >= 0) {
                indexOfSplitPoint = index;
            }
        }
        if (indexOfSplitPoint === Number.MAX_VALUE) {
            indexOfSplitPoint = -1;
        }
        if (indexOfSplitPoint <= 0) {
            for (let j = 0; j < midPunctuations.length; j++) {
                indexOfSplitPoint = Math.max(textWithinRange.lastIndexOf(midPunctuations[j]), indexOfSplitPoint);
            }
            if (indexOfSplitPoint <= 0) {
                indexOfSplitPoint = textWithinRange.lastIndexOf(' ');
                if (indexOfSplitPoint <= 0) {
                    indexOfSplitPoint = textWithinRange.lastIndexOf('\u303f');
                }
            }
            if (indexOfSplitPoint <= 0) {
                return length - 1;
            } else {
                return indexOfSplitPoint;
            }
        } else {
            if (text[indexOfSplitPoint + 1] && text[indexOfSplitPoint + 1] === '"') {
                return indexOfSplitPoint + 1;
            } else {
                return indexOfSplitPoint;
            }
        }
    }
}
async function removeNRTags(request = null, sender = null, sendResponse = null) {
    let toNormalize = true;
    if (request && request.toNormalize !== undefined) {
        toNormalize = request.toNormalize;
    }
    try {
        await replaceNRTagsWithTextNodes('nr-word', toNormalize);
        await replaceNRTagsWithTextNodes('nr-sentence', toNormalize);
    } catch (err) {
    }
}
function replaceNRTagsWithTextNodes(tagName, toNormalize = true, target = null) {
    let promises = [];
    let parentNodes = new Set();
    return new Promise(async (resolve) => {
        let nodes = [];
        if (!target) {
            nodes = $(document.body).find(tagName).get();
        } else {
            nodes = $(target).find(tagName).get();
        }
        nodes.map(node => {
            if (toNormalize) {
                parentNodes.add(node.parentNode);
            }
            promises.push(unwrapNode(node));
        })
        resolve(promises);
    })
        .then((promises) => {
            return Promise.all(promises);
        })
        .then(() => {
            return new Promise((resolve) => {
                if (toNormalize) {
                    parentNodes = Array.from(parentNodes);
                    for (let i = 0; i < parentNodes.length; i++) {
                        parentNodes[i].normalize();
                    }
                }
                resolve();
            });
        })
        .catch((err) => {
        })
}
function unwrapNode(node) {
    $.when($(node).contents().unwrap())
        .then(() => {
            return Promise.resolve();
        });
}
function getTextNodes(node) {
    let textNodes = [];
    if (node && node instanceof Node) {
        let walk = document.createTreeWalker(node, NodeFilter.SHOW_TEXT, null, false);
        let n = null;
        while (n = walk.nextNode()) {
            textNodes.push(n);
        }
    }
    return textNodes;
}
function getSelectedNodes() {
    if (window.getSelection) {
        let sel = window.getSelection();
        if (!sel.isCollapsed) {
            let result = getRangeSelectedNodes(sel.getRangeAt(0));
            let pNodes = [];
            let textNodes = [];
            pNodes = result.filter(node => (node.nodeName.toLowerCase() === 'p' || node.nodeName.toLowerCase() === 'div'));
            pNodes = [...new Set(pNodes)];
            textNodes = result.filter(node => node.nodeType == 3 && $(node).text().trim() !== '' && node.parentNode.nodeName.toLowerCase() !== 'style');
            return {pNodes, textNodes, allNodes: result};
        }
    }
    return {'pNodes': [], 'textNodes': [], 'allNodes': []};
}
function getRangeSelectedNodes(range) {
    let node = range.startContainer;
    let endNode = range.endContainer;
    if (node == endNode) {
        return [node];
    }
    let rangeNodes = [];
    while (node && node != endNode) {
        let pParent = $(node).closest("p")[0];
        if (pParent) {
            rangeNodes.push(pParent);
        }
        rangeNodes.push(node = nextNode(node));
    }
    node = range.startContainer;
    while (node && node != range.commonAncestorContainer) {
        rangeNodes.unshift(node);
        node = node.parentNode;
    }
    return rangeNodes;
}
function nextNode(node) {
    if (node.hasChildNodes()) {
        return node.firstChild;
    } else {
        while (node && !node.nextSibling) {
            node = node.parentNode;
        }
        if (!node) {
            return null;
        }
        return node.nextSibling;
    }
}
function createDeepCopy(array) {
    let deepCopy = [];
    for (let i = 0; i < array.length; i++) {
        deepCopy.push(array[i]);
    }
    return deepCopy;
}
