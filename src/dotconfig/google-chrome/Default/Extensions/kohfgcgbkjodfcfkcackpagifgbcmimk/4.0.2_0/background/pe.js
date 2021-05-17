function Pe() {
    let self = this;
    self.getPeListForUser = getPeListForUser;
    self.setPeAndTts = setPeAndTts;
    self.peList = [];
    self.peMap = new Map();
    function init() {
        chromeRuntimeMsgExternal.setFilter('setPeData', setPeDataFromPw.bind(this));
        chrome.storage.sync.get(['peList'], function(res) {
            setPeAndTts(res.peList ? res.peList : []);
        });
    }
    function getPeListForUser() {
        let userInfo = widget.settings.userInfo;
        if (widget.settings.loggedIn && userInfo) {
            getPeListFromServer(userInfo.id);
        }
    }
    function getPeListFromServer(userId) {
        const xhr = new XMLHttpRequest();
        let url = new URL(peEndpoint);
        const params = new URLSearchParams();
        params.set('apikey', pythonServerApiKey);
        params.set('userid', userId);
        url.search = params.toString();
        xhr.open('GET', url);
        xhr.onreadystatechange = function() {
            if (this.readyState === XMLHttpRequest.DONE && this.status >= 400) {
                setPeAndTts([]);
            }
            if (this.readyState === XMLHttpRequest.DONE && this.status === 200) {
                setPeAndTts(processPeList(JSON.parse(xhr.response).pe));
            }
        }
        xhr.onerror = function(err) {
            setPeAndTts([]);
        };
        try {
            xhr.send();
        } catch (e) {
        }
    }
    function processPeList(peList) {
        let res = peList ? peList.map(processWordPair.bind(this)) : [];
        return res;
    }
    function processWordPair(wordPair) {
        let processedSourceRes = escapeSpecialChars(wordPair.source);
        let processedReplaceRes = {hasSpecialChars: false, processedText: wordPair.replace};
        const processedWordPair = {
            ...wordPair,
            processedSource: wordPair.source,
            processedReplace: processedReplaceRes.processedText,
            hasSpecialChars: processedSourceRes.hasSpecialChars || processedReplaceRes.hasSpecialChars
        };
        return processedWordPair;
    }
    function escapeSpecialChars(text) {
        const regSymbols = /[\*\.\?\+\$\^\[\]\(\)\{\}\|\\\/\:\<\>\=\-]/g;
        const nonPrintableAscii = /[^ -~]/g;
        const ascii = /[ -~]/g;
        let processedText = text;
        let hasSpecialChars = false;
        if (regSymbols.test(text) || nonPrintableAscii.test(text)) {
            hasSpecialChars = true;
            processedText = text.replace(regSymbols, function(char) {
                return '\\' + char;
            });
        }
        return {hasSpecialChars, processedText};
    }
    function createPeMap(peList) {
        let peMap = peList.reduce((accumulator, wordPair) => {
            accumulator.set(wordPair['source'], wordPair['replace']);
            return accumulator;
        }, new Map());
        return peMap;
    }
    function setPeDataFromPw(data) {
        setPeAndTts(data.peList);
    }
    function setPeAndTts(pe) {
        self.peList = pe;
        self.peMap = createPeMap(self.peList);;
        chrome.storage.sync.set({'peList': self.peList});
        if (ttsText.textsForTts) {
            for (let i = 0; i < ttsText.textsForTts.length; i++) {
                ttsText.textsForTts[i].processed = ttsText.processText(ttsText.textsForTts[i].original);
            }
        }
        if (typeof reader != 'undefined' && reader.tts && reader.tts['clearPreloads']) {
            reader.tts.clearPreloads();
        }
    }
    init();
}
const pe = new Pe();