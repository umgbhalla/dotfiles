var doc = doc && doc.type === 'htmlDoc' ? doc : new function() {
    let self = this;
    this.type = "htmlDoc";
    let textsToRead = [];
    let isSelected = false;
    self.docInnerText = '';
    this.op = 'all';
    self.getCurrentIndex = function() {
        return 0;
    }
    this.getTexts = function(op = 'all') {
        this.op = op;
        return new Promise(async (resolve, reject) => {
            try {
                await parse(op);
                resolve(textsToRead);
            } catch (err) {
                reject(err);
            }
        });
    }
    function reset() {
        return Promise.resolve()
            .then(() => {
                textsToRead = [];
            }).catch(err => {
            });
    }
    this.parseForConvertToPdf = function() {
        return getToRead()
            .then((toRead) => {
                let elements = [];
                for (let i = 0; i < toRead.length; i++) {
                    elements = elements.concat(getElementsForConvertToPdf(toRead[i]));
                }
                return elements;
            })
            .catch(err => {
            });
    }
    function getElementsForConvertToPdf(elem) {
        const elements = [];
        if ($(elem).data("read-aloud-multi-block")) {
            let children = $(elem).children(":visible").get();
            for (let i = 0; i < children.length; i++) {
                elements.push(children[i])
            };
        } else {
            if ($(elem).find("p, ul, ol, li").length > 0) {
                $(elem).data("read-aloud-multi-block", true);
                getElementsForConvertToPdf(elem);
            } else {
                elements.push(elem);
            }
        }
        return elements;
    }
    function parse(op = 'all') {
        if (op === 'all') {
            isSelected = false;
            return parseAll(op);
        } else if (op === 'selection') {
            isSelected = true;
            return parseSelection();
        } else if (op === 'convert') {
            isSelected = false;
            if (nrDomDetector.hasSelectionOnPage()) {
                return parseSelection(true, true, op);
            } else {
                return parseAll(op);
            }
        }
    }
    function parseAll(op = 'all') {
        let currInnerText = document.body.innerText.substring(0, 1000);
        if (self.docInnerText === currInnerText) {
            return Promise.reject('ERR_ALREADY_PARSED');
        } else {
            self.docInnerText = currInnerText;
            return new Promise(async (resolve) => {
                await reset();
                if (op !== 'convert') {
                    await removeNRTags();
                }
                resolve();
            })
                .then(() => {
                    return getToRead();
                })
                .then((toRead) => {
                    return new Promise(async (resolve) => {
                        if (op === 'all') {
                            for (let i = 0; i < toRead.length; i++) {
                                let toHide = $(toRead[i]).find(":visible").filter(dontRead).hide();
                                await getTexts(toRead[i], op);
                                toHide.show();
                            }
                        } else {
                            let temp = toRead.map(getTextsOnly);
                            let texts = flatten(temp).filter(isNotEmpty);
                            for (let j = 0; j < texts.length; j++) {
                                if (texts[j]) {
                                    textsToRead.push(texts[j]);
                                }
                            }
                        }
                        resolve(textsToRead);
                    });
                })
                .catch((err) => {
                });
        }
    }
    function parseSelection(toSplitFirstTextNode = true, toSplitLastTextNode = true, op) {
        let selectedNodes = {};
        let selectedText = '';
        self.docInnerText = '';
        return new Promise((resolve, reject) => {
            let selection = window.getSelection();
            let range = selection.getRangeAt(0);
            selectedNodes = getSelectedNodes();
            if (selectedNodes.textNodes.length > 0 && selectedNodes.allNodes.length > 0) {
                if (toSplitFirstTextNode && (selectedNodes.textNodes[0].isSameNode(selectedNodes.allNodes[0]) ||
                    selectedNodes.allNodes[0].contains(selectedNodes.textNodes[0]))) {
                    let temp = selectedNodes.textNodes[0].splitText(range.startOffset);
                    selectedNodes.textNodes[0] = temp;
                    selectedNodes.allNodes[0] = temp;
                }
                if (toSplitLastTextNode && (selectedNodes.textNodes[selectedNodes.textNodes.length - 1].isSameNode(selectedNodes.allNodes[selectedNodes.allNodes.length - 1]) ||
                    selectedNodes.allNodes[selectedNodes.allNodes.length - 1].contains(selectedNodes.textNodes[selectedNodes.textNodes.length - 1]))) {
                    selectedNodes.textNodes[selectedNodes.textNodes.length - 1].splitText(range.endOffset);
                }
            } else {
                selectedText = selection.toString();
                selectedNodes = null;
            }
            selection.removeAllRanges();
            resolve();
        })
            .then(() => {
                return new Promise(async (resolve) => {
                    await reset();
                    if (op !== 'convert') {
                        await removeNRTags({toNormalize: false});
                    }
                    resolve();
                });
            })
            .then(() => {
                return new Promise((resolve) => {
                    if (selectedNodes) {
                        let toRead = [];
                        let currNodesInP = [];
                        let textNodes = selectedNodes.textNodes;
                        let p = selectedNodes.pNodes.shift();
                        for (let i = 0; i < textNodes.length; i++) {
                            if (p && p.contains(textNodes[i])) {
                                currNodesInP.push(textNodes[i]);
                                if (i === textNodes.length - 1) {
                                    addNodesInP();
                                }
                            } else {
                                if (currNodesInP.length > 0) {
                                    addNodesInP();
                                }
                                p = selectedNodes.pNodes.shift();
                                if (p && p.contains(textNodes[i])) {
                                    currNodesInP.push(textNodes[i]);
                                    if (i === textNodes.length - 1) {
                                        addNodesInP();
                                    }
                                } else {
                                    toRead.push(textNodes[i]);
                                }
                            }
                        }
                        resolve(toRead);
                        function addNodesInP() {
                            let nodes = [];
                            for (let j = 0; j < currNodesInP.length; j++) {
                                nodes.push(currNodesInP[j]);
                            }
                            currNodesInP = [];
                            toRead.push(nodes);
                        }
                    } else {
                        resolve([]);
                    }
                })
                    .then(async (toRead) => {
                        if (toRead.length > 0) {
                            for (let i = 0; i < toRead.length; i++) {
                                if (Array.isArray(toRead[i])) {
                                    await processSentencesForTextNodesInNode(toRead[i], op);
                                } else {
                                    await processSentencesForTextNodesInNode([toRead[i]], op)
                                }
                            }
                            return Promise.resolve(textsToRead);
                        } else {
                            if (selectedText.trim()) {
                                textsToRead = processSentencesByLength(getNlpSentences(selectedText));
                            }
                            return Promise.resolve(textsToRead);
                        }
                    })
            })
            .catch((err) => {
            });
    }
    //    
    //        
    function getToRead() {
        return new Promise((resolve) => {
            let start = new Date();
            let textBlocks = findTextBlocks(100);
            let countChars = textBlocks.reduce(function(sum, elem) {return sum + getInnerText(elem).length}, 0);
            if (countChars < 1000) {
                textBlocks = findTextBlocks(3);
                let texts = textBlocks.map(getInnerText);
                let head, tail;
                for (let i = 3; i < texts.length && !head; i++) {
                    let dist = getGaussian(texts, 0, i);
                    if (texts[i].length > dist.mean + 2 * dist.stdev) head = i;
                }
                for (let i = texts.length - 4; i >= 0 && !tail; i--) {
                    let dist = getGaussian(texts, i + 1, texts.length);
                    if (texts[i].length > dist.mean + 2 * dist.stdev) tail = i + 1;
                }
                if (head || tail) {
                    textBlocks = textBlocks.slice(head || 0, tail);
                }
            }
            let toRead = [];
            for (let i = 0; i < textBlocks.length; i++) {
                toRead.push.apply(toRead, findHeadingsFor(textBlocks[i], textBlocks[i - 1]));
                toRead.push(textBlocks[i]);
            }
            resolve(toRead);
        })
            .catch((err) => {
            });
    }
    function findTextBlocks(threshold) {
        let skipTags = "h1, h2, h3, h4, h5, h6, p, a[href], " + ignoreTags;
        let isTextNode = function(node) {
            return node.nodeType == 3 && node.nodeValue.trim().length >= 3;
        };
        let isParagraph = function(node) {
            return node.nodeType == 1 && $(node).is("p:visible") && getInnerText(node).length >= threshold;
        };
        let hasTextNodes = function(elem) {
            return someChildNodes(elem, isTextNode) && getInnerText(elem).length >= threshold;
        };
        let hasParagraphs = function(elem) {
            return someChildNodes(elem, isParagraph);
        };
        let containsTextBlocks = function(elem) {
            let childElems = $(elem).children(":not(" + skipTags + ")").get();
            return childElems.some(hasTextNodes) || childElems.some(hasParagraphs) || childElems.some(containsTextBlocks);
        };
        let addBlock = function(elem, multi) {
            if (multi) $(elem).data("read-aloud-multi-block", true);
            textBlocks.push(elem);
        };
        let walk = function() {
            if ($(this).is("frame, iframe")) try {walk.call(this.contentDocument.body)} catch (err) { }
            else if ($(this).is("dl")) addBlock(this);
            else if ($(this).is("ol, ul")) {
                let items = $(this).children().get();
                if (items.some(hasTextNodes)) addBlock(this);
                else if (items.some(hasParagraphs)) addBlock(this, true);
                else if (items.some(containsTextBlocks)) addBlock(this, true);
            }
            else if ($(this).is("tbody")) {
                let rows = $(this).children();
                if (rows.length > 3 || rows.eq(0).children().length > 3) {
                    if (rows.get().some(containsTextBlocks)) addBlock(this, true);
                }
                else rows.each(walk);
            }
            else {
                if (hasTextNodes(this)) addBlock(this);
                else if (hasParagraphs(this)) addBlock(this, true);
                else $(this).children(":not(" + skipTags + ")").each(walk);
            }
        };
        let textBlocks = [];
        walk.call(document.body);
        return textBlocks.filter(function(elem) {
            return $(elem).is(":visible") && $(elem).offset().left >= 0;
        })
    }
    function getGaussian(texts, start, end) {
        if (start == undefined) start = 0;
        if (end == undefined) end = texts.length;
        let sum = 0;
        for (let i = start; i < end; i++) sum += texts[i].length;
        let mean = sum / (end - start);
        let letiance = 0;
        for (let i = start; i < end; i++) letiance += (texts[i].length - mean) * (texts[i].length - mean);
        return {mean: mean, stdev: Math.sqrt(letiance)};
    }
    async function getTexts(elem, op) {
        if ($(elem).data("read-aloud-multi-block")) {
            let children = $(elem).children(":visible").get();
            for (let i = 0; i < children.length; i++) {
                if ($(children[i]).find("p, ul, ol, li").length > 0) {
                    await getTexts(children[i], op);
                } else {
                    await setSentences(children[i], op);
                }
            };
        } else {
            if ($(elem).find("p, ul, ol, li").length > 0) {
                $(elem).data("read-aloud-multi-block", true);
                await getTexts(elem, op);
            } else {
                await setSentences(elem, op);
            }
        }
    }
    //                
    async function setSentences(node, op) {
        let res = getTextToReadAndTextNodesInNode(node, op);
        let textNodes = res.textNodes;
        let processedHtmlText = processHtmlText(res.text).trim();
        let sentences = processSentencesByLength(getNlpSentences(processedHtmlText));
        if (op === 'convert') {
            textsToRead.push(...sentences);
            return;
        } else {
            try {
                if (sentences.length > 0) {
                    node.normalize();
                    let copiedSentences = createDeepCopy(sentences);
                    let index = 0;
                    while (textNodes.length > 0) {
                        let node = textNodes.shift();
                        let res = await setSentencesHelper(node, copiedSentences, sentences, index);
                        let nextIndex = res.nextIndex;
                        let remainder = res.remainder;
                        if (remainder) {
                            textNodes.unshift(remainder);
                        }
                        if (index != nextIndex) {
                            index = nextIndex;
                        }
                    }
                }
            } catch (err) {
            }
        }
    }
    function getTextToReadAndTextNodesInNode(node, op) {
        let text = '';
        let textNodes = [];
        let walk = document.createTreeWalker(node, NodeFilter.SHOW_TEXT, null, false);
        let n = null;
        while (n = walk.nextNode()) {
            if (n) {
                if ($(n.parentNode).is(":visible")) {
                    text += getText(n);
                    textNodes.push(n);
                }
            }
        }
        return {text, textNodes};
    }
    function filterTextToReadAndTextNodes(nodes) {
        let text = '';
        let textNodes = [];
        for (let i = 0; i < nodes.length; i++) {
            if (nodes[i]) {
                if ($(nodes[i].parentNode).is(":visible")) {
                    text += getText(nodes[i]);
                    textNodes.push(nodes[i]);
                }
            }
        }
        return {text, textNodes};
    }
    async function processSentencesForTextNodesInNode(textNodes, op) {
        let res = filterTextToReadAndTextNodes(textNodes);
        textNodes = res.textNodes;
        let processedHtmlText = processHtmlText(res.text).trim();
        if (op === 'convert') {
            textsToRead.push(processedHtmlText);
            return;
        }
        let sentences = processSentencesByLength(getNlpSentences(processedHtmlText));
        let copiedSentences = createDeepCopy(sentences);
        let index = 0;
        while (textNodes.length > 0) {
            let node = textNodes.shift();
            let res = await setSentencesHelper(node, copiedSentences, sentences, index);
            let nextIndex = res.nextIndex;
            let remainder = res.remainder;
            if (remainder) {
                textNodes.unshift(remainder);
            }
            if (index != nextIndex) {
                index = nextIndex;
            }
        }
    }
    async function setSentencesHelper(textNode, sentences, originalSentences, index) {
        try {
            if (!($(textNode).text() && processHtmlText($(textNode).text()).trim() !== '')) {
                return {'nextIndex': index, 'remainder': null};
            }
            let nodeText = $(textNode).text();
            let ttsSentence = processHtmlText(sentences[index]).trim();
            let nextIndex = index;
            if (processHtmlText(nodeText).length <= ttsSentence.length) {
                ttsSentence = ttsSentence.substring(nodeText.length);
                sentences[index] = ttsSentence;
                let nrSentence = document.createElement('nr-sentence');
                $(nrSentence).addClass('nr-s' + textsToRead.length);
                nrSentence.id = 'nr-s' + textsToRead.length;
                nrSentence.setAttribute("page", 0);
                if (isSelected) {
                    $(nrSentence).addClass('nr-selected');
                }
                if (sentences[index].length === 0) {
                    textsToRead.push(originalSentences[index]);
                    nextIndex++;
                }
                $(textNode).wrap(nrSentence);
                return {nextIndex, remainder: null};
            } else {
                let i = nodeText.search(/\S|$/);
                let end = nodeText.length;
                while (i < nodeText.length) {
                    while (nodeText[i] && processHtmlText(nodeText[i]).trim() === '') {
                        i++;
                        if (!nodeText[i]) {
                            break;
                        }
                    }
                    if (!nodeText[i]) {
                        break;
                    }
                    while (ttsSentence[0] && processHtmlText(ttsSentence[0]).trim() === '') {
                        ttsSentence = ttsSentence.substring(1);
                        if (ttsSentence.length === 0) {
                            nextIndex++;
                            break;
                        }
                    }
                    if (ttsSentence.length === 0) {
                        break;
                    }
                    if (processHtmlText(nodeText[i]) === processHtmlText(ttsSentence[0])) {
                        ttsSentence = ttsSentence.substring(1);
                        if (ttsSentence.length === 0) {
                            i++;
                            nextIndex++;
                            break;
                        }
                    }
                    i++;
                }
                end = i;
                let nrSentence = document.createElement('nr-sentence');
                $(nrSentence).addClass('nr-s' + textsToRead.length);
                nrSentence.id = 'nr-s' + textsToRead.length;
                nrSentence.setAttribute("page", 0);
                if (isSelected) {
                    $(nrSentence).addClass('nr-selected');
                }
                sentences[index] = ttsSentence;
                if (sentences[index].length === 0) {
                    textsToRead.push(originalSentences[index]);
                }
                let remainder = textNode.splitText(end);
                if ($(remainder).text().trim() === '') {
                    remainder = null;
                }
                $(textNode).wrap(nrSentence);
                return {nextIndex, remainder};
            }
        } catch (err) {
        }
    }
    function addTextEnd() {
        let children = $(this).children();
        let text = children.length ? getInnerText(children.get(0)) : null;
        if (text && !text.match(/^[(]?(\d|[a-zA-Z][).])/))
            children.each(function(index) {
                $("<span>").addClass("nr-text-end").text(". ").prependTo(this);
            })
    }
    function dontRead() {
        let float = $(this).css("float");
        let position = $(this).css("position");
        return $(this).is(ignoreTags) || $(this).is("sup") || float == "right" || position == "fixed";
    }
    function getText(elem) {
        if (elem.innerText) {
            return elem.innerText;
        } else {
            return $(elem).text();
        }
    }
    function addMissingPunctuation(text) {
        return text.replace(/(\w)(\s*?\r?\n)/g, "$1.$2");
    }
    function findHeadingsFor(block, prevBlock) {
        let result = [];
        let firstInnerElem = $(block).find("h1, h2, h3, h4, h5, h6, p").filter(":visible").get(0);
        let currentLevel = getHeadingLevel(firstInnerElem);
        let node = previousNode(block, true);
        while (node && node != prevBlock) {
            let ignore = $(node).is(ignoreTags);
            if (!ignore && node.nodeType == 1 && $(node).is(":visible")) {
                let level = getHeadingLevel(node);
                if (level < currentLevel) {
                    result.push(node);
                    currentLevel = level;
                }
            }
            node = previousNode(node, ignore);
        }
        return result.reverse();
    }
    function getHeadingLevel(elem) {
        let matches = elem && /^H(\d)$/i.exec(elem.tagName);
        return matches ? Number(matches[1]) : 100;
    }
    function previousNode(node, skipChildren) {
        if ($(node).is('body')) return null;
        if (node.nodeType == 1 && !skipChildren && node.lastChild) return node.lastChild;
        if (node.previousSibling) return node.previousSibling;
        return previousNode(node.parentNode, true);
    }
    function someChildNodes(elem, test) {
        let child = elem.firstChild;
        while (child) {
            if (test(child)) return true;
            child = child.nextSibling;
        }
        return false;
    }
    function flatten(array) {
        return [].concat.apply([], array);
    }
    function getTextsOnly(elem) {
        var toHide = $(elem).find(":visible").filter(dontRead).hide();
        var texts = $(elem).data("read-aloud-multi-block")
            ? $(elem).children(":visible").get().map(getText)
            : getText(elem).split(paragraphSplitter);
        toHide.show();
        return texts;
    }
}
