chrome.contextMenus.removeAll();
chrome.contextMenus.create({
    id: 'nr-context-read-selection',
    title: "Read selection",
    contexts: ["selection"]
});
chrome.contextMenus.onClicked.addListener(function(info) {
    let menuItem = info.menuItemId;
    if (menuItem === 'nr-context-read-selection') {
        if (info.selectionText != '') {
            reader.readSelectionWithContextMenu(ttsText.processSentencesByLength(ttsText.getNlpSentences(info.selectionText)));
        }
    }
});