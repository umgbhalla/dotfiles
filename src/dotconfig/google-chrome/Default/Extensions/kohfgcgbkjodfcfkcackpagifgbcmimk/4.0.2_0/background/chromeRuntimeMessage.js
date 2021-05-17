function ChromeRuntimeMessageExternal() {
    let self = this;
    self.filterTargetMap = {};
    self.setFilter = setFilter;
    self.init = init;
    function init() {
        chrome.runtime.onMessageExternal.addListener(function(request, sender, sendResponse) {
            let targetFn = self.filterTargetMap[request['target']];
            if (!targetFn) 
                return;
            targetFn['fn'](request, sender, sendResponse);
            if (targetFn['isAsync'])
                return true;
        });
    }
    function setFilter(target, targetFn, isAsync=false) {
        self.filterTargetMap[target] = { fn: targetFn, isAsync};     
    }
}
const chromeRuntimeMsgExternal = new ChromeRuntimeMessageExternal();
chromeRuntimeMsgExternal.init();