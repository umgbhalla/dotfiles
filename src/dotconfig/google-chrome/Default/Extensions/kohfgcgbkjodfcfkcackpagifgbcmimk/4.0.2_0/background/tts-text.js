function TtsText() {
    self = this;
    self.textsForTts = [];
    self.clearTexts = clearTexts;
    self.previewTexts = {
        'en': 'Hi. I can read webpages or documents for you.',
        'es': '¡Hola! Puedo leer sus páginas web o documentos por usted.',
        'fr': 'Salut! Je peux lire vos pages Web ou documents pour vous.',
        'de': 'Hallo! Ich kann Ihre Webseiten oder Dokumente für Sie lesen.',
        'it': 'Ciao! Posso leggere le tue pagine web o documenti per te.',
        'pt': 'Olá! Posso ler suas páginas da web ou documentos para você.',
        'sv': 'Hej! Jag kan läsa dina webbsidor eller dokument åt dig.',
        'nl': 'Hallo! Ik kan uw webpagina\'s of documenten voor u lezen.',
        'ro': 'Salut! Îți pot citi paginile web sau documentele pentru tine.',
        'tr': 'Merhaba! Web sayfalarınızı veya belgelerinizi sizin için okuyabilirim.',
        'ru': 'Здравствуйте! Я могу читать ваши веб-страницы или документы для вас.',
        'pl': 'Cześć! Mogę dla ciebie czytać twoje strony internetowe lub dokumenty.',
        'no': 'Hallo! Jeg kan lese websidene eller dokumentene dine for deg.',
        'is': 'Halló! Ég get lesið vefsíður þínar eða skjöl fyrir þig.',
        'da': 'Hej! Jeg kan læse dine websider eller dokumenter for dig.'
    };
    self.getIndexOfNNextSentence = getIndexOfNNextSentence;
    self.getIndexOfNPrevSentence = getIndexOfNPrevSentence;
    self.getTextsForTts = getTextsForTts;
    self.asyncFunctions = ['getTextsForTts'];
    self.getTextChunks = getTextChunks;
    self.textChunks = [];
    self.processSentencesByLength = processSentencesByLength;
    self.getNlpSentences = getNlpSentences;
    self.processText = processText;
    function init() {
        browser.runtime.onMessage.addListener(function(request, sender, sendResponse) {
            if (self[request['fn']]) {
                self[request['fn']](request, sender, sendResponse);
                if (isAsyncFunction(request['fn'])) {
                    return true;
                }
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
    async function getIndexOfNNextSentence(n, index) {
        try {
            if (n === 0) {
                return index;
            } else if (n >= 1 && index >= ttsText.textsForTts.length - 1) {
                return -1;
            } else {
                index++;
                let text = ttsText.textsForTts[index].processed;
                if (!text || text.trim() === '') {
                    return getIndexOfNNextSentence(n, index);
                } else {
                    return getIndexOfNNextSentence(n - 1, index);
                }
            }
        } catch (err) {
        }
    }
    async function getIndexOfNPrevSentence(n, index) {
        try {
            if (n === 0) {
                return index;
            } else if (n > 0 && index <= 0) {
                return -1;
            } else {
                index--;
                let text = ttsText.textsForTts[index].processed;
                if (!text || text.trim() === '') {
                    return getIndexOfNPrevSentence(n, index);
                } else {
                    return getIndexOfNPrevSentence(n - 1, index);
                }
            }
        } catch (err) {
        }
    }
    function getTextsForTts(request, sender, sendResponse) {
        sendResponse(ttsText.textsForTts);
    }
    function getTextChunks(text) {
        let start = 0;
        let textChunks = [];
        while (text.trim()) {
            let end = getIndexOfSplitPointBySpace(text, 60);
            let textChunk = text.substring(0, end).trim();
            text = text.substring(end);
            textChunks.push({charIndex: start, text: textChunk});
            start += end;
        }
        return textChunks;
    }
    function getIndexOfSplitPointBySpace(text, length) {
        let textWithinRange = text.substring(0, length);
        if (text.length <= length) {
            return text.length;
        } else {
            let indexOfSplitPoint = Number.MAX_VALUE;
            let index = textWithinRange.lastIndexOf(' ');
            if (index <= indexOfSplitPoint && index >= 0) {
                indexOfSplitPoint = index;
            }
            if (indexOfSplitPoint === Number.MAX_VALUE) {
                indexOfSplitPoint = -1;
            }
            if (indexOfSplitPoint <= 0) {
                return length;
            }
            if (indexOfSplitPoint + 10 >= text.length) {
                return text.length;
            } else {
                return indexOfSplitPoint;
            }
        }
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
    function getNlpSentences(text) {
        let sentences = nlp(text).sentences().data();
        return sentences.map(x => x.text.trim());
    }
    function splitIntoSentences(str, maxLength = 500) {
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
    function clearTexts() {
        self.textsForTts = [];
    }
    function processText(text) {
        let processedText = replaceTextUsingPe(text);
        processedText = replaceSpecialChars(processedText);
        let temp = compromiseNormalize(processedText);
        if (temp.trim() && processedText) {
            processedText = temp;
        }
        return processedText;
    }
    function replaceTextUsingPe(text) {
        if (!pe.peList) {
            return text;
        }
        if (!text || text.trim().length === 0) {
            return '';
        }
        for (let i = 0; i < pe.peList.length; i++) {
            if (!pe.peList[i].hasSpecialChars) {
                let regex = new RegExp("\\b" + pe.peList[i].processedSource + "\\b", "gm");
                text = text.replace(regex, pe.peList[i].processedReplace);
            }
        }// test cases:
        const words = text.split(' ');
        const peMap = pe.peMap;
        for (let j = 0; j < words.length; j++) {
            if (peMap && peMap.has(words[j])) {
                words[j] = peMap.get(words[j]);
            }
        }
        const peReplacedText = words.join(' ');
        return peReplacedText;
    }
    function escapeTags(text) {
        text = text.replace(/</g, '&lt;').replace(/>/g, '&gt;');
        return text;
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
    function compromiseNormalize(text) {
        let nlpNormalizedText = nlp(text).normalize({
            case: false,
            punctuation: false,
            contractions: false,
            unicode: false,
            numbers: false
        }).out('text');
        return nlpNormalizedText;
    }
    init();
}
const ttsText = new TtsText();