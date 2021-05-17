function NRCC() {
    let self = this;
    self.frame = null;
    self.ccDocument = null;
    self.isInjectingCC = false;
    self.hasCC = false;
    self.injectCC = injectCC;
    self.toggleCC = toggleCC;
    self.getHasCC = getHasCC;
    self.isVisible = false;
    self.isCC = false;
    self.setCCVisibility = setCCVisibility;
    self.isAsyncFunction = isAsyncFunction;
    self.asyncFunctions = ['getHasCC', 'injectCC'];
    function toggleCC(toShow) {
        if (toShow || self.frame.style.display === 'none') {
            setCCVisibility(true);
        } else {
            setCCVisibility(false);
        }
    }
    function setCCVisibility(val) {
        if (val) {
            self.frame.style.display = 'block';
        } else {
            self.frame.style.display = 'none';
        }
        self.isVisible = val;
    }
    async function init() {
        try {
            await initCCElements();
        } catch (err) {
        }
    }
    function initCCElements() {
    }
    function bindUIEvents() {
    }
    function setCCUI() {
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
                self.ccDocument.head.appendChild(tag);
            }
            else if (type === "js") {
                tag = document.createElement("script");
                tag.type = "text/javascript";
                tag.src = url;
                self.ccDocument.body.appendChild(tag);
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
        await loadResource(null, chrome.runtime.getURL('assets/css/bootstrap.min.css'));
        await loadResource(null, chrome.runtime.getURL('injected/nr-ext-cc/nr-ext-cc.css'));
        await loadResource(null, chrome.runtime.getURL('assets/js/jquery-3.6.0.min.js'));
        await loadResource(null, chrome.runtime.getURL('assets/js/bootstrap.bundle.min.js'));
        await init();
        self.isInjectingCC = false;
        self.hasCC = true;
    }
    function injectCC(request, sender, sendResponse) {
        self.isVisible = request.toShow ? request.toShow : false;
        self.isCC = request.isCC ? request.isCC : false;
        if (!self.isInjectingCC && !self.hasCC) {
            self.isInjectingCC = true;
            let iframe = document.createElement('iframe');
            self.frame = iframe;
            self.frame.id = "nr-ext-cc";
            self.frame.style.position = "fixed";
            self.frame.style.bottom = '0';
            self.frame.style.left = '0';
            self.frame.style.display = "none";
            self.frame.style.width = '100%';
            self.frame.style.height = '200px';
            self.frame.scrolling = "no";
            self.frame.style.zIndex = "9000000000000000000";
            self.frame.style.borderStyle = "none";
            self.frame.style.background = 'none';
            self.frame.style.backgroundColor = 'transparent';
            document.body.appendChild(iframe);
            self.frame.onload = async () => {
                frameContentOnLoad();
                sendResponse(true);
            }
            fetch(chrome.runtime.getURL("injected/nr-ext-cc/nr-ext-cc.html"))
                .then((response) => {
                    return response.text();
                })
                .then((cc) => {
                    try {
                        self.frame.contentDocument.write(cc);
                        self.ccDocument = self.frame.contentDocument;
                        self.frame.contentDocument.close();
                    } catch (err) {
                        self.frame.contentDocument.close();
                    }
                });
        }
    }
    function resizeFrame() {
    }
    function getHasCC(request, sender, sendResponse) {
        sendResponse(self.hasCC);
    }
    chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
        if (request.fn in nrCC) {
            nrCC[request.fn](request, sender, sendResponse);
            if (nrCC.isAsyncFunction(request.fn)) {
                return true;
            }
        } else if (request.message === 'injectCC') {
            injectCC(request, sender, sendResponse);
            return true;
        }
    });
    function isAsyncFunction(fn) {
        if (self.asyncFunctions.includes(fn)) {
            return true;
        } else {
            return false;
        }
    }
}
var nrCC = nrCC || new NRCC();