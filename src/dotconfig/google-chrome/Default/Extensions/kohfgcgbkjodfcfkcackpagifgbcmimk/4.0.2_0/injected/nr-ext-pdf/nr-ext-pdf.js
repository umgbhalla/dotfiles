function NRExtPdf() {
    let self = this;
    self.frame = null;
    self.barDocument = null;
    self.hasPdfBar = false;
    self.isAsyncFunction = isAsyncFunction;
    self.asyncFunctions = ['getHasPdfBar'];
    self.getHasPdfBar = getHasPdfBar;
    self.injectPdfBar = injectPdfBar;
    async function init() {
        try {
            await bindUIEvents();
        } catch (err) {
        }
    }
    function isAsyncFunction(fnName) {
        return self.asyncFunctions.includes(fnName);
    }
    function bindUIEvents() {
        return new Promise((resolve) => {
            let btnListenPdf = self.barDocument.getElementById('btnListenPdf');
            btnListenPdf.onclick = () => {
                chrome.runtime.sendMessage({fn: 'downloadPdf', url: window.location.href}, () => void chrome.runtime.lastError);
            }
            resolve();
        })
            .catch(err => {
            });
    }
    function injectPdfBar(request, sender, sendResponse) {
        let iframe = document.createElement('iframe');
        self.frame = iframe;
        self.frame.id = "nr-ext-pdf-bar";
        self.frame.style.background = "none";
        self.frame.style.backgroundColor = "transparent";
        self.frame.style.overflow = "hidden";
        self.frame.style.position = "fixed";
        self.frame.style.display = "none";
        self.frame.style.zIndex = "9000000000000000000";
        self.frame.style.borderStyle = "none";
        self.frame.style.width = '120px';
        self.frame.style.height = '60px';
        self.frame.style.top = '120px';
        self.frame.style.right = '26px';
        self.frame.style.borderRadius = '24px 0 0 24px'
        self.frame.style.boxShadow = 'none'
        document.body.appendChild(iframe);
        self.frame.onload = () => {
            frameContentOnLoad();
        }
        fetch(chrome.runtime.getURL("injected/nr-ext-pdf/nr-ext-pdf.html"))
            .then((response) => {
                return response.text();
            })
            .then((widget) => {
                try {
                    self.frame.contentDocument.write(widget);
                    self.barDocument = self.frame.contentDocument;
                    self.frame.contentDocument.close();
                    self.hasPdfBar = true;
                } catch (err) {
                    self.frame.contentDocument.close();
                };
            }).catch(err => {
            });
    }
    function getHasPdfBar(request, sender, sendResponse) {
        sendResponse(self.hasPdfBar);
    }
    async function frameContentOnLoad() {
        await loadResource(null, 'assets/css/material-icons.css');
        await loadResource(null, 'assets/css/font-awesome.min.css');
        await loadResource(null, chrome.runtime.getURL('assets/bootstrap-material-design-icons/css/material-icons.css'));
        await loadResource(null, chrome.runtime.getURL('assets/css/material-dashboard.css'));
        await loadResource(null, chrome.runtime.getURL('injected/nr-ext-pdf/nr-ext-pdf.css'));
        await loadResource(null, chrome.runtime.getURL('assets/js/core/jquery.min.js'));
        await loadResource(null, chrome.runtime.getURL('assets/js/core/popper.min.js'));
        await loadResource(null, chrome.runtime.getURL('assets/js/core/bootstrap-material-design.min.js'));
        await loadResource(null, chrome.runtime.getURL('assets/js/plugins/bootstrap-selectpicker.js'));
        await init();
        self.frame.style.display = 'block';
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
                self.barDocument.head.appendChild(tag);
            }
            else if (type === "js") {
                tag = document.createElement("script");
                tag.type = "text/javascript";
                tag.src = url;
                self.barDocument.body.appendChild(tag);
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
    chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
        if (self[request.fn]) {
            self[request.fn](request, sender, sendResponse);
            if (self.isAsyncFunction(request.fn)) {
                return true;
            }
        }
    });
}
var nrExtPdfBar = nrExtPdfBar || new NRExtPdf();