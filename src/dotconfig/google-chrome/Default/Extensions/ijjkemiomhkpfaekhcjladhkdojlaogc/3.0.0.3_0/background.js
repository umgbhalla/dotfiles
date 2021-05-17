chrome.browserAction.onClicked.addListener(function() {
    chrome.tabs.create({'url':"https://ide.goorm.io/my"})
});