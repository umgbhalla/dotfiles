/*
MIT License
Copyright (c) 2017 Dictus ApS
Permission is hereby granted, free of charge, to any person obtaining a copy of this software
and associated documentation files (the "Software"), to deal in the Software without restriction,
including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense,
and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so,
subject to the following conditions:
The above copyright notice and this permission notice shall be included in all copies or substantial
portions of the Software.
THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT
LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/
var googleDocsUtil = googleDocsUtil || (function() {
    var classNames = {
        paragraph: '.kix-paragraphrenderer',
        line: '.kix-lineview',
        selectionOverlay: '.kix-selection-overlay',
        wordNode: '.kix-wordhtmlgenerator-word-node',
        cursor: '.kix-cursor',
        cursorName: '.kix-cursor-name',
        cursorCaret: '.kix-cursor-caret',
    };
    function cleanDocumentText(text) {
        var cleanedText = text.replace(/\u200B\u200c/g, '');
        var nonBreakingSpaces = String.fromCharCode(160);
        var regex = new RegExp(nonBreakingSpaces, 'g');
        cleanedText = cleanedText.replace(regex, ' ');
        return cleanedText;
    }
    function getValidCharactersRegex() {
        return '\\wæøåÆØÅéáÉÁöÖ';
    }
    function isWordBoundary(character) {
        return character.match('[' + getValidCharactersRegex() + ']') == null;
    }
    function getGoogleDocument(toSplitFirstTextNode = false, toSplitLastTextNode = false, toAddSelectionStart = false) {
        var caret, caretRect;
        var caretIndex = 0;
        var caretLineIndex = 0;
        var caretLine = 0;
        var text = [];
        var nodes = [];
        var lineCount = 0;
        var globalIndex = 0;
        var selectedText = '';
        var exportedSelectionRect = undefined;
        var paragraphrenderers = document.querySelectorAll(classNames.paragraph);
        let selectedTextNodes = [];
        let selectedPNodes = [];
        let selectionStartIndex = 0;
        let selectionEndIndex = 0;
        let foundSelectionStart = false;
        if (containsUserCaretDom()) {
            caret = getUserCaretDom();
            caretRect = caret.getBoundingClientRect();
        }
        for (var i = 0; i < paragraphrenderers.length; i++) {
            var lineviews = paragraphrenderers[i].querySelectorAll(classNames.line);
            let isAddedToPNodes = false;
            for (var j = 0; j < lineviews.length; j++) {
                var lineText = '';
                var selectionOverlays = lineviews[j].querySelectorAll(classNames.selectionOverlay);
                var wordhtmlgeneratorWordNodes = lineviews[j].querySelectorAll(classNames.wordNode);
                for (var k = 0; k < wordhtmlgeneratorWordNodes.length; k++) {
                    var wordhtmlgeneratorWordNodeRect = wordhtmlgeneratorWordNodes[k].getBoundingClientRect();
                    if (caretRect) {
                        if (doesRectsOverlap(wordhtmlgeneratorWordNodeRect, caretRect)) {
                            var caretXStart =
                                caretRect.left - wordhtmlgeneratorWordNodeRect.left;
                            var localCaretIndex = getLocalCaretIndex(
                                caretXStart,
                                wordhtmlgeneratorWordNodes[k],
                                lineviews[j]
                            );
                            caretIndex = globalIndex + localCaretIndex;
                            caretLineIndex = lineText.length + localCaretIndex;
                            caretLine = lineCount;
                        }
                    }
                    var nodeText = cleanDocumentText(
                        wordhtmlgeneratorWordNodes[k].textContent
                    );
                    nodes.push({
                        index: globalIndex,
                        line: lineCount,
                        lineIndex: lineText.length,
                        node: wordhtmlgeneratorWordNodes[k],
                        lineElement: lineviews[j],
                        text: nodeText,
                    });
                    for (var l = 0; l < selectionOverlays.length; l++) {
                        var selectionOverlay = selectionOverlays[l];
                        var selectionRect = selectionOverlay.getBoundingClientRect();
                        if (selectionRect) exportedSelectionRect = selectionRect;
                        if (
                            doesRectsOverlap(
                                wordhtmlgeneratorWordNodeRect,
                                selectionOverlay.getBoundingClientRect()
                            )
                        ) {
                            if (!isAddedToPNodes) {
                                selectedPNodes.push(paragraphrenderers[i]);
                                isAddedToPNodes = true;
                            }
                            let textNodes = getTextNodes(wordhtmlgeneratorWordNodes[k]);
                            var tempSelectionStartIndex = getLocalCaretIndex(
                                selectionRect.left - wordhtmlgeneratorWordNodeRect.left,
                                wordhtmlgeneratorWordNodes[k],
                                lineviews[j]
                            );
                            var tempSelectionEndIndex = getLocalCaretIndex(
                                selectionRect.left +
                                selectionRect.width -
                                wordhtmlgeneratorWordNodeRect.left,
                                wordhtmlgeneratorWordNodes[k],
                                lineviews[j]
                            );
                            if (textNodes.length > 0) {
                                let startResult = getNodeAtSelectionEdge(tempSelectionStartIndex, textNodes);
                                let startNodeIndex = startResult.nodeIndex;
                                let startIndex = startResult.splitAt;
                                let endResult = getNodeAtSelectionEdge(tempSelectionEndIndex, textNodes);
                                let endNodeIndex = endResult.nodeIndex;
                                let endIndex = endResult.splitAt;
                                if (toSplitFirstTextNode) {
                                    let isSplitSuccess = false;
                                    while (!isSplitSuccess) {
                                        try {
                                            textNodes[startNodeIndex] = textNodes[startNodeIndex].splitText(startIndex);
                                            isSplitSuccess = true;
                                        } catch (err) {
                                            startIndex++;
                                        }
                                    }
                                }
                                if (toSplitLastTextNode) {
                                    let isSplitSuccess = false;
                                    while (!isSplitSuccess) {
                                        try {
                                            textNodes[endNodeIndex].splitText(endIndex);
                                            isSplitSuccess = true;
                                        } catch (err) {
                                            endIndex--;
                                        }
                                    }
                                }
                                textNodes = cleanTextNodes(textNodes, textNodes[startNodeIndex], textNodes[endNodeIndex]);
                            }
                            if (!foundSelectionStart) {
                                foundSelectionStart = true;
                                selectionStartIndex = tempSelectionStartIndex;
                            }
                            selectionEndIndex = tempSelectionEndIndex;
                            selectedText += nodeText.substring(
                                tempSelectionStartIndex,
                                tempSelectionEndIndex
                            );
                            selectedTextNodes = selectedTextNodes.concat(textNodes);
                        }
                    }
                    globalIndex += nodeText.length;
                    lineText += nodeText;
                }
                text.push(lineText);
                lineCount++;
            }
        }
        if (selectedTextNodes.length > 0) {
            if (toAddSelectionStart) {
                let nrSelectionStart = document.createElement('nr-selection-start');
                let textNode = document.createTextNode('nr selection start');
                nrSelectionStart.appendChild(textNode);
                $(nrSelectionStart).addClass('nr-selected');
                $(nrSelectionStart).insertBefore(selectedTextNodes[0]);
                nrSelectionStart.style.display = 'none';
            }
        }
        return {
            nodes: nodes,
            text: text,
            selectedText: selectedText,
            caret: {
                index: caretIndex,
                lineIndex: caretLineIndex,
                line: caretLine,
            },
            selectionRect: exportedSelectionRect,
            selectedNodes: {textNodes: selectedTextNodes, pNodes: selectedPNodes}
        };
    }
    function cleanTextNodes(textNodes, startNode, endNode) {
        textNodes = textNodes.filter(node => (cleanDocumentText(node.nodeValue).trim() !== '' && removeDumbChars(node.nodeValue)));
        textNodes = textNodes.filter(node => {
            return node.isSameNode(startNode) || node.isSameNode(endNode) ||
                (startNode.compareDocumentPosition(node) === Node.DOCUMENT_POSITION_FOLLOWING &&
                    endNode.compareDocumentPosition(node) === Node.DOCUMENT_POSITION_PRECEDING)
        });
        return textNodes;
    }
    function getNodeAtSelectionEdge(index, textNodes) {
        let currLength = 0;
        for (let i = 0; i < textNodes.length; i++) {
            let text = cleanDocumentText(textNodes[i].nodeValue);
            currLength += text.length;
            if (currLength > index) {
                let splitAt = text.length - (currLength - index);
                return {nodeIndex: i, splitAt: splitAt};
            }
        }
        return {nodeIndex: textNodes.length - 1, splitAt: cleanDocumentText(textNodes[textNodes.length - 1].nodeValue).length - (currLength - index)};
    }
    function getTextNodes(node) {
        let textNodes = [];
        let walk = document.createTreeWalker(node, NodeFilter.SHOW_TEXT, null, false);
        let n = null;
        while (n = walk.nextNode()) {
            textNodes.push(n);
        }
        return textNodes;
    }
    function getTextNodesWithoutEmptyNodes(node) {
        let textNodes = [];
        let walk = document.createTreeWalker(node, NodeFilter.SHOW_TEXT, null, false);
        let n = null;
        while (n = walk.nextNode()) {
            if (cleanDocumentText(n.nodeValue).trim() !== '' && removeDumbChars(n.nodeValue)) {
                textNodes.push(n);
            }
        }
        return textNodes;
    }
    function removeDumbChars(text) {
        return text && text.replace(/\u200c/g, '');
    }
    function doesRangesOverlap(x1, x2, y1, y2) {
        return x1 <= y2 && y1 <= x2;
    }
    function doesRectsOverlap(RectA, RectB) {
        return (
            RectA.left <= RectB.right &&
            RectA.right >= RectB.left &&
            RectA.top <= RectB.bottom &&
            RectA.bottom >= RectB.top
        );
    }
    function containsUserCaretDom() {
        var carets = document.querySelectorAll(classNames.cursor);
        for (var i = 0; i < carets.length; i++) {
            var nameDom = carets[i].querySelectorAll(classNames.cursorName);
            var name = nameDom[0].innerText;
            if (!name) return true;
        }
        return false;
    }
    function getUserCaretDom() {
        var carets = document.querySelectorAll(classNames.cursor);
        for (var i = 0; i < carets.length; i++) {
            var nameDom = carets[i].querySelectorAll(classNames.cursorName);
            var name = nameDom[0].innerText;
            if (!name) return carets[i].querySelectorAll(classNames.cursorCaret)[0];
        }
        throw 'Could not find the users cursor';
    }
    function getLocalCaretIndex(caretX, element, simulateElement) {
        var text = cleanDocumentText(element.innerText);
        var container = document.createElement('div');
        var letterSpans = [];
        for (var i = 0; i < text.length; i++) {
            var textNode = document.createElement('span');
            textNode.innerText = text[i];
            textNode.style.cssText = element.style.cssText;
            textNode.style.whiteSpace = 'pre';
            letterSpans.push(textNode);
            container.appendChild(textNode);
        }
        container.style.whiteSpace = "nowrap";
        simulateElement.appendChild(container);
        var index = 0;
        var currentMinimumDistance = -1;
        var containerRect = container.getBoundingClientRect();
        for (var i = 0; i < letterSpans.length; i++) {
            var rect = letterSpans[i].getBoundingClientRect();
            var left = rect.left - containerRect.left;
            var right = left + rect.width;
            if (currentMinimumDistance == -1) {
                currentMinimumDistance = Math.abs(caretX - left);
            }
            var leftDistance = Math.abs(caretX - left);
            var rightDistance = Math.abs(caretX - right);
            if (leftDistance <= currentMinimumDistance) {
                index = i;
                currentMinimumDistance = leftDistance;
            }
            if (rightDistance <= currentMinimumDistance) {
                index = i + 1;
                currentMinimumDistance = rightDistance;
            }
        }
        container.remove();
        return index;
    }
    function findWordAtCaret(googleDocument) {
        var line = googleDocument.text[googleDocument.caret.line];
        if (line.length == 0)
            return {
                word: '',
                startIndex: googleDocument.caret.index,
                endIndex: googleDocument.caret.index,
            };
        var startIndex = googleDocument.caret.lineIndex;
        var endIndex = googleDocument.caret.lineIndex;
        if (googleDocument.caret.lineIndex >= line.length) {
            startIndex = line.length - 1;
            endIndex = line.length - 1;
        }
        var character = line[startIndex];
        if (isWordBoundary(character) && startIndex > 0) {
            startIndex--;
            character = line[startIndex];
        }
        while (!isWordBoundary(character) && startIndex > 0) {
            startIndex--;
            character = line[startIndex];
        }
        character = line[endIndex];
        while (!isWordBoundary(character) && endIndex < line.length - 1) {
            endIndex++;
            character = line[endIndex];
        }
        var globalStartIndex =
            googleDocument.caret.index - googleDocument.caret.lineIndex + startIndex;
        var globalEndIndex =
            googleDocument.caret.index - googleDocument.caret.lineIndex + endIndex;
        return {
            word: line.substring(startIndex, endIndex).trim(),
            startIndex: globalStartIndex,
            endIndex: globalEndIndex,
        };
    }
    function highlight(startIndex, endIndex, googleDocument) {
        for (var i = 0; i < googleDocument.nodes.length; i++) {
            if (
                doesRangesOverlap(
                    startIndex,
                    endIndex,
                    googleDocument.nodes[i].index,
                    googleDocument.nodes[i].index + googleDocument.nodes[i].text.length
                )
            ) {
                var textToHighlight = getTextInNode(
                    startIndex,
                    endIndex,
                    googleDocument.nodes[i]
                );
                if (!textToHighlight.trim()) continue;
                var parentRect = googleDocument.nodes[i].lineElement.getBoundingClientRect();
                var nodeRect = googleDocument.nodes[i].node.getBoundingClientRect();
                var leftPosOffset = 0;
                var rightPosOffset = nodeRect.width;
                if (startIndex > googleDocument.nodes[i].index) {
                    var localIndex = startIndex - googleDocument.nodes[i].index;
                    leftPosOffset = getPositionOfIndex(
                        localIndex,
                        googleDocument.nodes[i].node,
                        googleDocument.nodes[i].lineElement
                    );
                }
                if (
                    endIndex <
                    googleDocument.nodes[i].index + googleDocument.nodes[i].text.length
                ) {
                    rightPosOffset = getPositionOfIndex(
                        endIndex - googleDocument.nodes[i].index,
                        googleDocument.nodes[i].node,
                        googleDocument.nodes[i].lineElement
                    );
                }
                createHighlightNode(
                    nodeRect.left - parentRect.left + leftPosOffset,
                    nodeRect.top - parentRect.top,
                    rightPosOffset - leftPosOffset,
                    nodeRect.height,
                    googleDocument.nodes[i].lineElement
                );
            }
        }
    }
    function getText(startIndex, endIndex, googleDocument) {
        var text = '';
        for (var i = 0; i < googleDocument.nodes.length; i++) {
            if (
                doesRangesOverlap(
                    startIndex,
                    endIndex,
                    googleDocument.nodes[i].index,
                    googleDocument.nodes[i].index + googleDocument.nodes[i].text.length
                )
            ) {
                var textInNode = getTextInNode(
                    startIndex,
                    endIndex,
                    googleDocument.nodes[i]
                );
                text += textInNode;
            }
        }
        return text;
    }
    function getTextInNode(startIndex, endIndex, node) {
        var start = 0;
        var end = node.text.length;
        if (startIndex > node.index) {
            start = startIndex - node.index;
        }
        if (endIndex < node.index + node.text.length) {
            end = endIndex - node.index;
        }
        return node.text.substring(start, end);
    }
    function createHighlightNode(left, top, width, height, parentElement) {
        var highlightNode = document.createElement('div');
        highlightNode.setAttribute('class', 'dictus_highlight_node');
        highlightNode.style.position = 'absolute';
        highlightNode.style.left = left + 'px';
        highlightNode.style.top = top + 'px';
        highlightNode.style.width = width + 'px';
        highlightNode.style.height = height + 'px';
        highlightNode.style.backgroundColor = '#D1E3FF';
        highlightNode.style.color = '#D1E3FF';
        highlightNode.style.boxShadow = '0px 0px 1px 1px #D1E3FF';
        parentElement.appendChild(highlightNode);
    }
    function removeHighlightNodes() {
        var highlightNodes = document.querySelectorAll(
            '.dictus_highlight_node'
        );
        while (highlightNodes.length > 0) highlightNodes[0].remove();
    }
    function getPositionOfIndex(index, element, simulateElement) {
        if (index == 0) {
            return 0;
        }
        var text = cleanDocumentText(element.innerText);
        var container = document.createElement('div');
        var letterSpans = [];
        for (var i = 0; i < index; i++) {
            var textNode = document.createElement('span');
            textNode.innerText = text[i];
            textNode.style.cssText = element.style.cssText;
            textNode.style.whiteSpace = 'pre';
            letterSpans.push(textNode);
            container.appendChild(textNode);
        }
        simulateElement.appendChild(container);
        var containerRect = container.getBoundingClientRect();
        var rect = letterSpans[index - 1].getBoundingClientRect();
        var leftPosition = rect.left + rect.width - containerRect.left;
        container.remove();
        return leftPosition;
    }
    function removeSelectionOverlay() {
        let selectionOverlays = document.querySelectorAll(classNames.selectionOverlay);
        Array.from(selectionOverlays, node => {
            node.remove();
        })
    }
    return {
        getGoogleDocument: function(toSplitFirstTextNode = false, toSplitLastTextNode = false, toAddSelectionStart = false) {
            return getGoogleDocument(toSplitFirstTextNode, toSplitLastTextNode, toAddSelectionStart);
        },
        findWordAtCaret: function(googleDocument) {
            return findWordAtCaret(googleDocument);
        },
        getText: function(startIndex, endIndex, googleDocument) {
            return getText(startIndex, endIndex, googleDocument);
        },
        highlight: function(startIndex, endIndex, googleDocument) {
            highlight(startIndex, endIndex, googleDocument);
        },
        removeHighlight: function() {
            removeHighlightNodes();
        },
        cleanDocumentText: function(text) {
            return cleanDocumentText(text);
        },
        removeSelectionOverlay: function() {
            return removeSelectionOverlay();
        },
        getTextNodes: function(node) {
            return getTextNodes(node);
        },
        removeDumbChars: function(text) {
            return removeDumbChars(text);
        },
        getTextNodesWithoutEmptyNodes: function(node) {
            return getTextNodesWithoutEmptyNodes(node);
        }
    };
})();
