'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

(function (chrome) {

    var startmeElement = document.getElementById(SM_STARTME_ID);
    if (startmeElement) {
        registerPresence(startmeElement);

        window.addEventListener('DOMContentLoaded', function (event) {
            if (document.body.classList.contains('not-logged-in')) {
                chrome.runtime.sendMessage({ message: SM_MESSAGE_NOT_SIGNED_IN });
            }
        });
    }

    function registerPresence(startmeElement) {

        var extensionName = BROWSER_CHROME;

        if (isBrowser(BROWSER_FIREFOX)) {
            extensionName = BROWSER_FIREFOX;
        } else if (isBrowser(BROWSER_OPERA)) {
            extensionName = BROWSER_OPERA;
        } else if (isBrowser(BROWSER_EDGE)) {
            extensionName = BROWSER_EDGE;
        }

        startmeElement.classList.add('has-' + extensionName + '-extension');

        var version = chrome.runtime.getManifest().version;
        startmeElement.setAttribute('data-' + extensionName + '-extension-version', version);

        startmeElement.setAttribute('data-' + extensionName + '-extension-id', chrome.runtime.id);
    }

    chrome.runtime.onMessage.addListener(function (request, sender, respond) {
        switch (request.message) {
            case SM_MESSAGE_SHOW_BOOKMARK_BAR:
                respond(true);
                showBookmarksBar(request);
                break;

            case SM_MESSAGE_REQUEST_TITLE:

                findTitleForUrl(request.url).then(function (title) {
                    respond(title);
                }).catch(function (err) {
                    return respond();
                });
                return true;
        }
    });

    window.addEventListener('message', function (event) {
        var message = _typeof(event.data) == 'object' ? event.data : { message: event.data };
        switch (message.message) {
            case SM_MESSAGE_SIGNED_IN:

                chrome.runtime.sendMessage({ message: SM_MESSAGE_SIGNED_IN });
                return;
        }
    });

    function showBookmarksBar(_ref) {
        var url = _ref.url,
            title = _ref.title,
            tabId = _ref.tabId;

        chrome.browserAction.openPopup();
    }

    function findTitleForUrl(url) {
        return new Promise(function (resolve, reject) {
            var anchors = document.querySelectorAll('a[href]'),
                anchorCount = anchors.length;
            for (var i = 0; i < anchorCount; i++) {
                var anchor = anchors[i],
                    title = void 0;
                if (anchor.href != url) continue;

                title = anchor.title.trim();

                if (!title) {
                    var tag = anchor.querySelector('[alt],[title]');
                    if (tag) title = tag.title.trim() || tag.alt.trim();
                }

                if (!title) {
                    title = anchor.innerText.toString().trim();
                    title = title.split("\n")[0].toString().trim();
                }

                return resolve(title);
            }

            reject();
        });
    }
})(chrome);
