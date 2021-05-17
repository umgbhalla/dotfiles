function Storage() {
    let self = this;
    self.set = set;
    let hasLastError = false;
    function init() {
        chrome.storage.local.get(null, (result) => {
            if (Object.keys(result).length > 0) {
                syncLocalToCloud();
            }
        });
    }
    function set(obj) {
        chrome.storage.sync.set(obj, () => {
            if (chrome.runtime.lastError) {
                hasLastError = true;
                chrome.storage.local.set(obj, () => void chrome.runtime.lastError);
                chrome.storage.sync.get(null, (result) => {
                    if(chrome.runtime.lastError){
                    }
                });
            } else {
                if (hasLastError) {
                    hasLastError = false;
                    syncLocalToCloud();
                }
            }
        });
    }
    function syncLocalToCloud() {
        chrome.storage.local.get(null, (result) => {
            if(chrome.runtime.lastError){
            }
            chrome.storage.sync.set(result, () => {
                if (chrome.runtime.lastError) {
                } else {
                    chrome.storage.local.clear(() => void chrome.runtime.lastError);
                }
            })
        });
    }
    init();
}
const storage = new Storage();