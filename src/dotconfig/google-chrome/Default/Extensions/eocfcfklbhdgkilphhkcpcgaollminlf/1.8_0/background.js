var debug = false;
var previousTime = 0;

chrome.runtime.onInstalled.addListener(function (details) {

    if (details.reason == "install") {
        chrome.tabs.create({
            url: 'options/options.html'
        });
        setAlarm();
        performBackup();
    }
});

function setAlarm() {
    chrome.storage.sync.get({
        frequency: "When Added"
    }, function (result) {
        if (debug)
            console.log(result);

        switch (result.frequency) {
            case "Every Day":
                chrome.alarms.create('backupBookmark', {
                    delayInMinutes: 1440,
                    periodInMinutes: 1440
                });
                break;
            case "Every Week":
                chrome.alarms.create('backupBookmark', {
                    delayInMinutes: 10080,
                    periodInMinutes: 10080
                });
                break;
            default:
                chrome.alarms.clear('backupBookmark');
                break;
        }
    });
}

function include(arr, obj) {
    return (arr.indexOf(obj) != -1);
}

function writeTreeToStorage() {

    chrome.bookmarks.getTree(function (tree) {

        if (tree[0].length <= 0)
            return;

        var date = new Date();
        var time = date.getTime();

        var text = JSON.stringify(tree);
        var number = text.split("url").length - 1;

        chrome.storage.local.get({
            localTree: []
        }, function (result) {
            var newTree = result.localTree;
            newTree.push({
                "date": time, "items": number, "tree": tree
            });
            chrome.storage.local.set({
                localTree: newTree
            });
        });
    });
}

chrome.bookmarks.onCreated.addListener(function (bookmark) {
    backupWhenModified();
});


chrome.bookmarks.onRemoved.addListener(function (id, removeInfo) {
    backupWhenModified();
});

function backupWhenModified() {
    chrome.storage.sync.get({
        frequency: "When Added"
    }, function (result) {

        if (debug)
            console.log(result);

        if (result.frequency == "When Added") {
            performBackup();
        }
    });
}

function performBackup() {
    if (new Date().getTime() - previousTime > 1000)
        writeTreeToStorage();

    previousTime = new Date().getTime();
}

chrome.alarms.onAlarm.addListener(function (alarm) {

    if (alarm.name == 'backupBookmark') {
        writeTreeToStorage();
    }
});

chrome.runtime.onMessage.addListener(
 function (request, sender, sendResponse) {

     if (request.status == "restoreStarting") {
         previousTime = new Date().getTime();
     }

     sendResponse({ toDo: true });
 });