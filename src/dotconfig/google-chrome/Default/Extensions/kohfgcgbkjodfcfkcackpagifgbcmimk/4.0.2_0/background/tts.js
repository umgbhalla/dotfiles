function WindowSpeechEngine() {
    let self = this;
    self.type = 'free';
    self.synth = window.speechSynthesis;
    self.utterThis = null;
    self.playTimeoutRef = null;
    self.isStoppedWhenProcessingPlay = false;
    self.isProcessingPlay = false;
    self.play = play;
    self.pause = pause;
    self.stop = stop;
    self.resume = resume;
    self.onEvent = null;
    self.resumeIntervalRef = null;
    function init() { }
    function play(text, index, onEvent) {
        if (!text || text.trim() === '' || !voices.voices['free'] || (voices['free'] && Object.keys(voices.voices['free']).length === 0)) {
            onEvent({type: 'end'});
            return;
        }
        return clearUtteranceAndCancel()
            .then(() => {
                return new Promise((resolve) => {
                    self.utterThis = new SpeechSynthesisUtterance();
                    self.utterThis.text = text;
                    let voiceKey = '';
                    if (reader.previewVoiceKey) {
                        voiceKey = reader.previewVoiceKey;
                        reader.previewVoiceKey = '';
                    } else {
                        voiceKey = widget.settings.voiceType === 'prem' ? widget.settings.premVoice : widget.settings.freeVoice;
                    }
                    self.utterThis.voice = voices.voices['free'][voiceKey].voice;
                    self.utterThis.volume = parseFloat(widget.settings.volume);
                    self.utterThis.rate = utils.calculateRate(widget.settings.speed);
                    self.onEvent = onEvent;
                    addEventListenerToUtterance(index, text);
                    resolve(voices.voices['free'][voiceKey]);
                });
            })
            .then((voice) => {
                setTimeout(function() {
                    self.synth.speak(self.utterThis);
                    if (voice.source === 'google') {
                        setResumeInterval();
                    }
                }, 0);
            })
            .catch((err) => {
            });
    }
    function addEventListenerToUtterance(index, text) {
        self.utterThis.onend = () => {
            if (self.resumeIntervalRef) {
                clearInterval(self.resumeIntervalRef);
            }
            if (self.onEvent) {
                self.onEvent({type: 'end'});
            }
        }
        self.utterThis.onerror = () => {
            if (self.resumeIntervalRef) {
                clearInterval(self.resumeIntervalRef);
            }
        }
        self.utterThis.onstart = () => {
            if (self.onEvent) {
                self.onEvent({type: 'start'});
            }
        }
        let wordIndex = 0;
        self.utterThis.onboundary = (e) => {
            if (e.name == 'word' && (typeof e.charLength !== "undefined" || typeof e.length !== "undefined")) {
                let word = text.substr(e.charIndex, (e.charLength || e.length));
                if (self.onEvent) {
                    self.onEvent({type: 'word', word, wordIndex: wordIndex, index});
                }
                wordIndex++;
            }
        };
    }
    function pause(isOnEvent = true) {
        self.stop(isOnEvent);
    }
    function stop(isOnEvent = true) {
        if (self.onEvent && isOnEvent) {
            self.onEvent({type: 'pause'});
        }
        if (self.synth.paused) {
            return Promise.resolve()
                .then(() => {
                    return new Promise((resolve) => {
                        self.synth.resume();
                        resolve();
                    });
                }).then(() => {
                    return clearUtteranceAndCancel();
                }).catch(function(err) {
                });
        } else {
            return clearUtteranceAndCancel();
        }
    }
    function resume(text, index) {
        play(text, index, false);
    }
    function clearUtteranceAndCancel() {
        return new Promise((resolve) => {
            if (self.resumeIntervalRef) {
                clearInterval(self.resumeIntervalRef);
                self.resumeIntervalRef = null;
            }
            if (self.utterThis) {
                self.utterThis.onend = null;
                self.utterThis.onboundary = null;
                self.utterThis.onerror = null;
                self.utterThis = null;
            }
            self.synth.cancel();
            resolve();
        });
    }
    function setResumeInterval() {
        self.resumeIntervalRef = setInterval(() => {
            if (!self.synth.speaking) {
                clearInterval(self.resumeIntervalRef);
            } else {
                self.synth.pause();
                self.synth.resume();
            }
        }, 5000);
    }
    init();
}
function ChromeTtsEngine() {
    let self = this;
    self.init = init;
    self.type = 'free';
    self.play = play;
    self.stop = stop;
    self.pause = pause;
    self.onEvent = null;
    self.stopIfAlreadySpeaking = stopIfAlreadySpeaking;
    self.resumeIntervalRef = null;
    let wordIndex = 0;
    function init() { }
    function stopIfAlreadySpeaking() {
        return new Promise(function(resolve) {
            if (self.resumeIntervalRef) {
                clearInterval(self.resumeIntervalRef);
                self.resumeIntervalRef = null;
            }
            browser.tts.isSpeaking(function(event) {
                if (event) {
                    browser.tts.stop();
                }
                resolve({isSpeaking: event});
            });
        })
    }
    function setResumeInterval() {
        self.resumeIntervalRef = setInterval(() => {
            browser.tts.isSpeaking(function(isSpeaking) {
                if (!isSpeaking) {
                    clearInterval(self.resumeIntervalRef);
                } else {
                    browser.tts.pause();
                    browser.tts.resume();
                }
            });
        }, 5000);
    }
    function play(text, index, onEvent) {
        if (!text || text.trim() === '' || !voices.voices['free'] || (voices.voices['free'] && Object.keys(voices.voices['free']).length === 0)) {
            onEvent({type: 'end'});
            return;
        }
        return stopIfAlreadySpeaking()
            .then(function(res) {
                self.onEvent = onEvent;
                wordIndex = 0;
                let rate = utils.calculateRate(widget.settings.speed);
                if (rate < 0.1) {
                    rate = 0.1;
                }
                let volume = parseFloat(widget.settings.volume);
                let voiceKey = '';
                if (reader.previewVoiceKey) {
                    voiceKey = reader.previewVoiceKey;
                    reader.previewVoiceKey = '';
                } else {
                    voiceKey = widget.settings.voiceType === 'prem' ? widget.settings.premVoice : widget.settings.freeVoice;
                }
                let voiceName = voices.voices['free'][voiceKey].voice.name || voices.voices['free'][voiceKey].voice.voiceName;
                setTimeout(() => {
                    browser.tts.speak(text, {
                        voiceName,
                        rate,
                        volume,
                        requiredEventTypes: ['start', 'end', 'word'],
                        desiredEventTypes: ['start', 'end', 'error', 'interrupted', 'word'],
                        onEvent: (event) => {utteranceOnEvent(event, text, index)}
                    });
                    if (voices.voices['free'][voiceKey].source === 'google') {
                        setResumeInterval();
                    }
                }, 0);
            }).catch((err) => {
            });
    }
    function stop(isOnEvent = true) {
        if (self.onEvent && isOnEvent) {
            self.onEvent({type: 'pause'});
        }
        browser.tts.stop();
    }
    function pause(isOnEvent = true) {
        self.stop(isOnEvent);
    }
    function utteranceOnEvent(event, text, index) {
        if (event.type == 'start') {
            if (self.onEvent) {
                self.onEvent({type: 'start'});
            }
        } else if (event.type == 'end') {
            if (self.resumeIntervalRef) {
                clearInterval(self.resumeIntervalRef);
            }
            if (self.onEvent) {
                self.onEvent({type: 'end'});
            }
        } else if (event.type == 'error') {
            if (self.resumeIntervalRef) {
                clearInterval(self.resumeIntervalRef);
            }
        } else if (event.type == 'word' && (typeof event.charLength !== "undefined" || typeof event.length !== "undefined")) {
            let word = text.substr(event.charIndex, (event.charLength || event.length));
            if (self.onEvent) {
                if (self.onEvent) {
                    self.onEvent({type: 'word', word, wordIndex: wordIndex, index});
                }
                wordIndex++;
            }
        }
    }
}
const freeTts = utils.getOS().os === 'mac' ? new WindowSpeechEngine() : new ChromeTtsEngine();
function OnlineTtsEngine() {
    class BlobObj {
        constructor(url, text, marks, err) { }
    }
    let self = this;
    self.type = 'online';
    self.ttsEndpoint = 'https://tuwz0i1tl0.execute-api.us-east-1.amazonaws.com/prod/tts';
    self.audioPlayer = null;
    self.errCount = 0;
    self.playId = undefined;
    self.numPreloads = {prev: 2, next: 4};
    self.preloads = {};
    self.previews = {};
    self.hasError = false;
    self.hasTooManyRequestsError = false;
    self.onEvent = null;
    self.wordMarkTimer = null;
    self.play = play;
    self.pause = pause;
    self.stop = stop;
    self.clearPreloads = clearPreloads;
    self.clearBlobsWithError = clearBlobsWithError;
    self.setNumPreloads = setNumPreloads;
    self.isProcessingPlay = false;
    self.isStoppedWhenProcessingPlay = false;
    self.playPromise = null;
    self.hasInvalidLicenseError = false;
    self.invalidLicenseErrorCount = 0;
    self.currentVoice = null;
    function init() {
        self.audioPlayer = document.createElement('AUDIO');
        setAudio();
    }
    async function clearBlobsWithError() {
        for (let key in self.preloads) {
            let preload = self.preloads[key];
            let blob = await preload.blob;
            if (blob.err === 'ERR_CONVERT_LIMIT' || blob.err == 1005 || blob.err === 1006 || blob.err === 'ERR_LICENSE_INVALID') {
                removePreload(preload.index);
            }
        }
    }
    function setAudio() {
        self.audioPlayer.src = "assets/media/silence.mp3";
        self.audioPlayer.volume = parseFloat(widget.settings.volume);
        let isAudioEngineOk = false;
        self.enableAudio = async () => {
            window.removeEventListener('click', self.enableAudio, false);
            if (!isAudioEngineOk) {
                try {
                    await self.audioPlayer.play();
                } catch (err) {
                }
                setTimeout(() => {
                    self.audioPlayer.pause();
                }, 50);
                isAudioEngineOk = true;
            }
        }
        window.addEventListener('click', self.enableAudio, false);
    }
    function play(text, index, onEvent) {
        self.playId = Date.now();
        let id = self.playId;
        if (!self.isStoppedWhenProcessingPlay) {
            return clearPlay()
                .then(() => {
                    self.onEvent = onEvent;
                    return playHelper(text, index, id);
                })
                .then(() => {
                    if (index !== null && id === self.playId) {
                        return preloadAudios(index, id);
                    }
                })
                .catch(err => {
                });
        } else {
            self.isProcessingPlay = false;
            self.isStoppedWhenProcessingPlay = false;
            return Promise.resolve();
        }
    }
    function clearPlay() {
        return Promise.resolve()
            .then(() => {
                if (self.playTimeoutRef) {
                    clearTimeout(self.playTimeoutRef);
                }
                if (self.wordMarkTimer) {
                    clearInterval(self.wordMarkTimer);
                }
                self.onEvent = null;
                if (self.playPromise) {
                    self.playPromise.then(() => {
                        self.audioPlayer.pause();
                    })
                        .catch((err) => {
                        })
                }
            })
            .catch(err => {
            });
    }
    async function playHelper(text, index, id) {
        try {
            if (!text || !text || text.trim() === '') {
                if (self.onEvent) {
                    self.onEvent({type: 'end'});
                }
                return;
            } else {
                let key = (index !== null) ? index + '' : widget.settings.premVoice + '_' + widget.settings.speed;
                let toPlay = (index !== null) ? self.preloads[key] : self.previews[key];
                if (toPlay) {
                    if (id !== self.playId) {
                        throw new Error('invalid playid');
                    }
                    try {
                        if (toPlay['blob'].isPending()) {
                            if (self.onEvent) {
                                self.onEvent({type: 'loading'});
                            }
                        }
                    } catch (err) {
                    }
                    let blob = await toPlay['blob'];
                    if (blob.text === text) {
                        checkBlob(toPlay, id);
                    } else {
                        removePreload(index);
                        playHelper(text, index, id);
                    }
                } else {
                    if (self.onEvent) {
                        self.onEvent({type: 'loading'});
                    }
                    return downloadUrl(text).then((blob) => {
                        self.preloads[key] = {
                            'text': text,
                            'blob': blob,
                            'index': index
                        };
                        checkBlob(self.preloads[key], id);
                    }).catch(function(err) {
                    });
                };
            }
        } catch (err) {
        }
    }
    async function checkBlob(toPlay, id) {
        try {
            if (id !== self.playId || !toPlay) {
                throw new Error('invalid playId');
            }
            let blob = await toPlay.blob;
            if (blob.err && blob.err !== '') {
                handleError(blob.err);
            } else {
                if (self.hasError) {
                    self.hasError = false;
                    self.hasInvalidLicenseError = false;
                    self.invalidLicenseErrorCount = 0;
                    self.isStoppedWhenProcessingPlay = false;
                    self.setNumPreloads(2, 4);
                }
                setPlay(toPlay, id);
            }
        } catch (err) {
        }
    }
    async function setPlay(toPlay, id) {
        try {
            self.errCount = 0;
            let blob = await toPlay.blob;
            self.audioPlayer.src = blob.url;
            if (self.currentVoice && self.currentVoice.source === 'aca') {
                self.audioPlayer.volume = parseFloat(widget.settings.volume * 0.5);
            } else {
                self.audioPlayer.volume = parseFloat(widget.settings.volume);
            }
            self.audioPlayer.load();
            addEventListenerToPlayer();
            if (!self.isStoppedWhenProcessingPlay) {
                try {
                    if (id !== self.playId || !toPlay) {
                        throw new Error('invalid playid');
                    }
                    self.playPromise = self.audioPlayer.play();
                    setWordMarkTimer(blob.text, blob.marks);
                } catch (err) {
                }
            } else {
                stop();
            }
        } catch (err) {
        }
        self.isProcessingPlay = false;
        self.isStoppedWhenProcessingPlay = false;
    }
    function removeSymbolEscape(s) {
        switch (s) {
            case "&quot;":
                return '"';
            case "&amp;":
                return "&";
            case "&apos;":
                return "'";
            case "&lt;":
                return "<";
            case "&gt;":
                return ">";
            default:
                return s;
        }
    }
    function setWordMarkTimer(text, marks) {
        self.audioPlayer.oncanplay = () => {
            try {
                if (self.wordMarkTimer) {
                    clearInterval(self.wordMarkTimer);
                }
                let wordIndex = 0;
                let startTime = performance.now();
                let textChunks = ttsText.getTextChunks(text);
                let textChunkIndex = 0;
                let elapsedTime = 0;
                if (marks && marks.length === 0) {
                    let words = text.split(" ");
                    let charIndicesOfWords = [];
                    let currIndex = 0;
                    for (let i = 0; i < words.length; i++) {
                        if (words[i]) {
                            charIndicesOfWords.push(currIndex);
                            currIndex = currIndex + words[i].length + 1;
                        } else {
                            currIndex++;
                        }
                    }
                    let wordIndex = 0;
                    let duration = self.audioPlayer.duration * 1000;
                    let oneCharTime = duration / text.length * 0.95;
                    self.wordMarkTimer = setInterval(() => {
                        let t1 = performance.now();
                        elapsedTime = t1 - startTime;
                        if (elapsedTime >= duration || duration <= 0 || isNaN(self.audioPlayer.duration)) {
                            clearInterval(self.wordMarkTimer);
                            return;
                        }
                        let numSpokenChars = Math.floor(elapsedTime / oneCharTime);
                        if (numSpokenChars > text.length) {
                            clearInterval(self.wordMarkTimer);
                            return;
                        }
                        if (numSpokenChars >= charIndicesOfWords[wordIndex]) {
                            if (self.onEvent) {
                                self.onEvent({type: 'word', word: words[wordIndex], wordIndex: wordIndex++});
                            }
                        }
                    }, 50);
                } else {
                    self.wordMarkTimer = setInterval(() => {
                        let t1 = performance.now();
                        elapsedTime = t1 - startTime;
                        if (elapsedTime > marks[wordIndex].time) {
                            if (self.onEvent) {
                                self.onEvent({type: 'word', word: marks[wordIndex].word, wordIndex: wordIndex++});
                                if (wordIndex >= marks.length) {
                                    clearInterval(self.wordMarkTimer);
                                }
                            }
                        }
                    }, 50);
                }
            } catch (err) {
            }
        };
    }
    function addEventListenerToPlayer() {
        self.audioPlayer.onended = () => {
            if (self.onEvent) {
                self.onEvent({type: 'end'});
            }
        };
        self.audioPlayer.onplay = () => {
            if (self.onEvent) {
                self.onEvent({type: 'start'});
            }
        };
        self.audioPlayer.onerror = () => {
            if (self.onEvent) {
                self.onEvent({type: "error", err: self.audioPlayer.error.message});
            }
        };
    }
    function pause(isOnEvent = true) {
        self.stop(isOnEvent);
    }
    function stop(isOnEvent) {
        if (self.onEvent && isOnEvent) {
            self.onEvent({type: 'pause'});
        }
        if (self.isProcessingPlay) {
            self.isStoppedWhenProcessingPlay = true;
        }
        return clearPlay();
    }
    async function preloadAudios(startIndex, id) {
        let currPreloadsInRange = {};
        currPreloadsInRange[startIndex + ''] = true;
        for (let i = 1; i < self.numPreloads.next + 1; i++) {
            if (!self.isStoppedWhenProcessingPlay) {
                try {
                    let nextIndex = await ttsText.getIndexOfNNextSentence(i, startIndex);
                    if (nextIndex === -1) {
                        break;
                    }
                    currPreloadsInRange[nextIndex + ''] = true;
                    preloadAudio(nextIndex, id);
                } catch (err) {
                    continue;
                }
            } else {
                break;
            }
        }
        for (let j = 1; j < self.numPreloads.prev + 1; j++) {
            if (!self.isStoppedWhenProcessingPlay) {
                try {
                    let prevIndex = await ttsText.getIndexOfNPrevSentence(j, startIndex);
                    if (prevIndex === -1) {
                        break;
                    }
                    currPreloadsInRange[prevIndex + ''] = true;
                } catch (err) {
                    continue;
                }
            } else {
                break;
            }
        }
        removePreloads(currPreloadsInRange);
    }
    async function preloadAudio(index, id) {
        try {
            if (id !== self.playId) {
                throw new Error('inavlid playId');
            }
            let key = index + '';
            if (self.preloads[key]) {
                return;
            } else {
                let text = ttsText.textsForTts[index].processed;
                if (!text || text.trim() === '') {
                    return;
                } else {
                    self.preloads[key] = {
                        'text': text,
                        'blob': makeQueryablePromise(downloadUrl(text)),
                        'index': index
                    };
                }
            }
        } catch (err) {
        }
    }
    function removePreloads(currPreloadsInRange) {
        for (let key in self.preloads) {
            let preload = self.preloads[key];
            if (!currPreloadsInRange[key]) {
                removePreload(preload.index);
            }
        }
    }
    function removePreload(index) {
        if (index !== null) {
            delete self.preloads[index + ''];
        }
    }
    function clearPreloads() {
        self.preloads = {};
    }
    function downloadUrl(text) {
        return new Promise(async (resolve, reject) => {
            let attemptCount = 3;
            let ret = new BlobObj('', '', [], '');
            while (attemptCount > 0) {
                let signedParams = await signRequest(text, widget.settings.userInfo);
                ret = await xhrAudioUrl(text, signedParams);
                if (ret.err !== '') {
                    if (shouldNotRetryForTheError(ret.err)) {
                        break;
                    }
                    if (ret.err === 'Too Many Requests') {
                        self.hasTooManyRequestsError = true;
                    }
                    attemptCount--;
                } else {
                    resolve(ret);
                    return;
                }
            }
            resolve(ret);
        })
            .catch((err) => {
            });
    }
    async function signRequest(text, userInfo) {
        let queryEndpoint = '';
        try {
            queryEndpoint = appendQueryParamsToTtsEndpoint(self.ttsEndpoint, userInfo);
            let path = queryEndpoint.split('naturalreaders.com')[1];
            urlTobeSigned = processUrl(queryEndpoint);
            currentCredentials = await amplify.Auth.currentCredentials();
            credTokens = await amplify.Auth.essentialCredentials(currentCredentials);
            let params = {
                headers: {
                    'Content-Type': 'application/json; charset=UTF-8',
                    'Accept': 'audio/mpeg'
                },
                data: JSON.stringify({
                    't': text
                }),
                method: 'POST',
                path,
                url: urlTobeSigned
            }
            let serviceInfo = {
                region: 'us-east-1', service: 'execute-api'
            }
            let accessInfo = {
                secret_key: credTokens.secretAccessKey,
                access_key: credTokens.accessKeyId,
                session_token: credTokens.sessionToken
            }
            const signed_params = amplify.Signer.sign(params, accessInfo, serviceInfo);
            delete signed_params.headers['host'];
            return Promise.resolve(signed_params);
        } catch (err) {
            throw err;
        }
    }
    function appendQueryParamsToTtsEndpoint(ttsEndpoint, userInfo) {
        let voice = '';
        if (reader.previewVoiceKey) {
            voice = voices.voices[widget.settings.voiceType][reader.previewVoiceKey];
            reader.previewVoiceKey = '';
        } else {
            voice = voices.voices[widget.settings.voiceType][widget.settings[widget.settings.voiceType + 'Voice']];
        }
        self.currentVoice = voice;
        if (!voice.id || !voice.source) {
            throw new Error('error');
        }
        let params = '';
        let voiceParams = '';
        if (voice !== null) {
            voiceParams = '&r=' + voice.id + '&s=' + widget.settings.speed + '&v=' + voice.source;
        } else {
            voiceParams = '&r=21&s=1&v=aca';
        }
        if (userInfo && userInfo['email'] && typeof userInfo['license'] !== 'undefined') {
            params = '?e=' + userInfo['email'] + '&l=' + userInfo['license'];
            if (userInfo.ownerEmail) {
                params += '&o=' + userInfo.ownerEmail;
            }
            params += voiceParams;
        } else {
            params = '?l=0' + voiceParams;
        }
        return ttsEndpoint + params;
    }
    function processUrl(rawUrl) {
        const {search, ...parsedUrl} = amplify.urlLib.parse(rawUrl, true, true);
        let processedUrl = amplify.urlLib.format({
            ...parsedUrl,
            query: {
                ...parsedUrl.query
            }
        });
        return processedUrl;
    }
    function shouldNotRetryForTheError(err) {
        if (err == 1002 ||
            err == 1005 ||
            err == 1001 ||
            err == 1003 ||
            err == 1004 ||
            err == 1006 ||
            err == 'ERR_LICENSE_INVALID' ||
            err == 'Limit Exceeded' ||
            err == 'ERR_INVALID_REQUEST' ||
            err == 'ERR_EMPTY_TEXT') {
            return true;
        } else {
            false;
        }
    }
    function xhrAudioUrl(text, signedParams) {
        return new Promise((resolve) => {
            if (self.hasTooManyRequestsError) {
                setTimeout(() => {
                    resolve();
                }, 500);
            } else {
                resolve();
            }
        }).then(() => {
            return new Promise(function(resolve, reject) {
                self.hasTooManyRequestsError = false;
                const xhr = new XMLHttpRequest();
                xhr.open('POST', signedParams.url);
                Object.entries(signedParams.headers).forEach(entry => {
                    xhr.setRequestHeader(entry[0], entry[1]);
                });
                xhr.responseType = 'blob';
                xhr.onreadystatechange = function() {
                    if (this.readyState === XMLHttpRequest.DONE && this.status >= 400) {
                        const res = xhr.response;
                        if (res && res['errorCode']) {
                            resolve({'url': '', text: text, marks: [], err: res['errorCode']});
                        }
                        if (xhr.status == 429) {
                            if (xhr.response.message == 'Limit Exceeded') {
                                resolve({'url': '', text: text, marks: [], err: 'Limit Exceeded'});
                            } else {
                                self.hasTooManyRequestsError = true;
                                resolve({'url': '', text: text, marks: [], err: 'Too Many Requests'});
                            }
                        }
                    }
                    if (this.readyState === XMLHttpRequest.DONE && this.status === 200) {
                        try {
                            const blob = xhr.response;
                            const blobUrl = window.URL.createObjectURL(blob);
                            if (blobUrl === '') {
                                resolve({'url': '', text: text, marks: [], err: 'ERR_UNKNOWN'});
                            } else {
                                const marks = processSpeechMarks(xhr.getResponseHeader('x-smark'));
                                const blobObj = {'url': blobUrl, 'text': text, 'marks': marks, 'err': ''};
                                resolve(blobObj);
                            }
                        } catch (err) {
                            resolve({'url': '', text: text, marks: [], err: 'ERR_UNKNOWN'});
                        }
                    }
                    if (this.readyState === 2) {
                        if (xhr.status === 200) {
                            xhr.responseType = 'blob';
                        } else {
                            xhr.responseType = 'json';
                        }
                    }
                };
                xhr.onerror = function(err) {
                    resolve({'url': '', text: text, marks: [], err: 'ERR_UNKNOWN'});
                };
                const body = JSON.stringify({t: text, s: self.speed, v: self.voice});
                try {
                    xhr.send(body);
                } catch (e) {
                    resolve({'url': '', text: text, marks: [], err: 'ERR_UNKNOWN'});
                }
            })
        })
            .catch(err => {
                if (self.onEvent) {
                }
            });
    }
    function b64DecodeUnicode(s) {
        return decodeURIComponent(atob(s).split('').map(function(c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));
    }
    function processSpeechMarks(s) {
        try {
            s = b64DecodeUnicode(s);
            let separator = s.substring(0, 2).trim();
            let data = s.substring(2).split(separator);
            let temp = [];
            for (let i = 0; i < data.length; i += 4) {
                let mark = {};
                mark['word'] = data[i];
                mark['start'] = parseInt(data[i + 1]);
                mark['end'] = parseInt(data[i + 2]);
                mark['time'] = parseInt(data[i + 3]);
                temp.push(mark);
            }
            let marks = [];
            for (let j = 0; j < temp.length; j++) {
                if (temp[j - 1]) {
                    if (temp[j - 1].start === temp[j].start || temp[j - 1].end === temp[j].end || temp[j].start < temp[j - 1].end) {
                        if (marks[marks.length - 1].end < temp[j].end || temp[j].start < marks[marks.length - 1].end) {
                            let overlappedLength = getOverlappedStringLength(marks[marks.length - 1].word, temp[j].word);
                            marks[marks.length - 1].word = marks[marks.length - 1].word.substring(0, marks[marks.length - 1].word.length - overlappedLength) + temp[j].word;
                            marks[marks.length - 1].end = temp[j].end;
                        }
                    } else {
                        let mark = {};
                        mark['word'] = temp[j]['word'];
                        mark['start'] = temp[j]['start'];
                        mark['end'] = temp[j]['end'];
                        mark['time'] = temp[j]['time'];
                        marks.push(mark);
                    }
                } else {
                    let mark = {};
                    mark['word'] = temp[j]['word'];
                    mark['start'] = temp[j]['start'];
                    mark['end'] = temp[j]['end'];
                    mark['time'] = temp[j]['time'];
                    marks.push(mark);
                }
            }
            return marks;
        } catch (err) {
            return [];
        }
    }
    function getOverlappedStringLength(s1, s2) {
        if (s1.length > s2.length) s1 = s1.substring(s1.length - s2.length);
        let t = computeBackTrackTable(s2);
        let m = 0;
        let i = 0;
        while (m + i < s1.length) {
            if (s2[i] == s1[m + i]) {
                i += 1;
            } else {
                m += i - t[i];
                if (i > 0) i = t[i];
            }
        }
        return i;
    }
    function computeBackTrackTable(s) {
        let t = new Array(s.length);
        let cnd = 0;
        t[0] = -1;
        t[1] = 0;
        let pos = 2;
        while (pos < s.length) {
            if (s[pos - 1] == s[cnd]) {
                t[pos] = cnd + 1;
                pos += 1;
                cnd += 1;
            } else if (cnd > 0) {
                cnd = t[cnd];
            } else {
                t[pos] = 0;
                pos += 1;
            }
        }
        return t;
    }
    function handleError(err) {
        self.errCount++;
        if (self.errCount >= 3 || !isTempError(err)) {
            self.hasError = true;
            self.setNumPreloads(2, 0);
            if (self.onEvent) {
                self.onEvent({type: 'error', err: err, isTempError: isTempError(err)});
            }
        } else {
            if (isSkipError(err) && self.errCount > 0) {
                self.errCount--;
            }
            if (self.onEvent) {
                self.onEvent({type: 'end'});
            }
        }
    }
    function isSkipError(err) {
        if (err === 1002 ||
            err === 1000) {
            return true;
        } else {
            return false;
        }
    }
    function isTempError(err) {
        if (err == 1001 ||
            err == 1003 ||
            err == 1004 ||
            err == 1005 ||
            err == 1006 ||
            err == 'ERR_LICENSE_INVALID' ||
            err == 'Limit Exceeded' ||
            err == 'ERR_EMPTY_TEXT') {
            return false;
        } else {
            return true;
        }
    }
    function setNumPreloads(prev, next) {
        self.numPreloads = {prev: prev, next: next};
    }
    function makeQueryablePromise(promise) {
        try {
            if (promise.isResolved) return promise;
            let isPending = true;
            let isRejected = false;
            let isFulfilled = false;
            let result = promise.then(
                function(v) {
                    isFulfilled = true;
                    isPending = false;
                    return v;
                },
                function(e) {
                    isRejected = true;
                    isPending = false;
                    throw e;
                }
            );
            result.isFulfilled = function() {return isFulfilled;};
            result.isPending = function() {return isPending;};
            result.isRejected = function() {return isRejected;};
            return result;
        } catch (err) {
            return promise;
        }
    }
    init();
}
const onlineTts = new OnlineTtsEngine();