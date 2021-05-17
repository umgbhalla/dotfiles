function ScriptInjector() {
    let self = this;
    self.getTextProcessorFilePathForDoc = getTextProcessorFilePathForDoc;
    self.executeScriptsForTextProcessor = executeScriptsForTextProcessor;
    self.canExecuteScript = canExecuteScript;
    self.executeScriptOnTab = executeScriptOnTab;
    function init() {
    }
    function canExecuteScript() {
        return executeScriptOnTab(null, {code: 'console.info(\'ok?\')'})
            .then(_ => {
                return Promise.resolve(true);
            })
            .catch(_ => {
                alertHandler.displayAlertMessage('ERR_NOT_READABLE');
                return Promise.reject(false);
            })
    }
    function getTextProcessorFilePathForDoc(tabId, docType) {
        if (!tabId) {
            return Promise.reject(new Error('ERR_NO_TABID'));
        }
        return new Promise((resolve) => {
            let resp = null;
            if (docType === 'html') {
                resp = ["injected/nr-ext-dom/nr-ext-text-processor/html-doc.js"];
            } else if (docType === 'google drive doc') {
                resp = ["injected/nr-ext-dom/nr-ext-text-processor/google-drive-doc.js"];
            } else if (docType === 'google doc') {
                resp = ["injected/nr-ext-dom/nr-ext-text-processor/google-doc-utils.js", "injected/nr-ext-dom/nr-ext-text-processor/google-doc.js"];
            } else if (docType === 'google drive preview') {
                resp = ["injected/nr-ext-dom/nr-ext-text-processor/google-drive-preview.js"];
            }
            else if (docType === null) {
                resp = null;
            } else {
                resp = ["injected/nr-ext-dom/nr-ext-text-processor/html-doc.js"];
            }
            resolve(resp);
        })
            .catch((err) => {
            });
    }
    function executeScriptOnTab(tabId, script, type = 'script') {
        return new Promise(function(resolve, reject) {
            if (type === 'script') {
                browser.tabs.executeScript(tabId, script, () => {
                    if (chrome.runtime.lastError) {
                        reject(new Error("ERR_NOT_READABLE"));
                    }
                    resolve(tabId)
                });
            } else {
                browser.tabs.insertCSS(tabId, script, () => {
                    if (chrome.runtime.lastError) {
                        reject(new Error("ERR_NOT_READABLE"));
                    }
                    resolve(tabId)
                });
            }
        });
    }
    function executeScriptsForTextProcessor(tabId, docType) {
        return executeScriptOnTab(tabId, {file: 'assets/js/jquery-3.6.0.min.js'})
            .then(() => {
                return executeScriptOnTab(tabId, {file: 'libs/compromise.min.js'});
            })
            .then(() => {
                return executeScriptOnTab(tabId, {file: 'injected/nr-ext-dom/nr-ext-dom-controller.js'});
            })
            .then(() => {
                return executeScriptOnTab(tabId, {file: 'injected/nr-ext-dom/nr-ext-text-processor/nr-ext-text-processor.js'});
            })
            .then(() => {
                return executeScriptOnTab(tabId, {file: 'injected/nr-ext-dom/nr-ext-dom.css'}, 'css');
            })
            .then(() => {
                return getTextProcessorFilePathForDoc(tabId, docType)
            })
            .then((filePaths) => {
                let promises = [];
                if (filePaths) {
                    for (let i = 0; i < filePaths.length; i++) {
                        promises.push(executeScriptOnTab(tabId, {file: filePaths[i]}));
                    }
                }
                return Promise.all(promises);
            })
            .catch((err) => {
                alertHandler.displayAlertMessage(err.message);
            });
    }
    init();
}
const scriptInjector = new ScriptInjector();
