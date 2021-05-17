chrome.runtime.onMessage.addListener(
  function (request, sender, sendResponse) {

    if (request == "runContentScript") {
      chrome.tabs.executeScript({
        file: '/js/content_script.js'
      });
    }
    
});

chrome.storage.local.get("licenseStatus", function(res){
  if(typeof res.licenseStatus === "undefined"){
    chrome.storage.local.set({
      licenseStatus : {
        key: null,
        TRIAL_USAGE_COUNT: 0
      }
    })
  }
});