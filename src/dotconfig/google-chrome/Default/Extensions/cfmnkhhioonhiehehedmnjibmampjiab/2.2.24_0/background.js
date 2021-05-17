'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var Sanitizer = {
    entity: /[&<>"']/g,

    entities: {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        '\'': '&apos;'
    },

    getEntity: function getEntity(value) {
        return Sanitizer.entities[value];
    },
    escapeString: function escapeString(str) {
        var result = '';

        for (var i = 0; i < str.length; i++) {
            result += str[i].replace(Sanitizer.entity, Sanitizer.getEntity);
        }

        return result;
    }
};

var RequestManager = {
    controllers: {},

    createRequestController: function createRequestController(key) {

        var newController = new AbortController();

        RequestManager.controllers[key] = newController;

        return newController;
    },
    cancelRequest: function cancelRequest(key) {
        var controller = RequestManager.controllers[key];

        if (!controller) return;

        controller.abort();
    }
};

chrome.runtime.onInstalled.addListener(function (details) {
    registerContextMenus();

    switch (details.reason) {
        case 'install':
            return afterInstall();
        case 'update':
            return afterUpdate();
    }
});

var extensionBrowser = 'chrome';

chrome.runtime.setUninstallURL(Startme.primaryURL('/newtab_uninstall.html?browser=' + extensionBrowser));

// Adds context menu entries
function registerContextMenus() {
    getPermissionFor('contextMenus').then(function () {
        chrome.contextMenus.create({
            id: SM_CONTEXT_MENU_IMPORT,
            title: chrome.i18n.getMessage('import_bookmarks_from_chrome'),
            type: 'normal',
            contexts: ['browser_action']
        });
        chrome.contextMenus.create({
            id: SM_CONTEXT_MENU_SELECT_NEW_TAB_PAGE,
            title: chrome.i18n.getMessage('select_new_tab_page'),
            type: 'normal',
            contexts: ['browser_action']
        });
        chrome.contextMenus.create({
            id: SM_CONTEXT_MENU_HELP,
            title: chrome.i18n.getMessage('help'),
            type: 'normal',
            contexts: ['browser_action']
        });
        chrome.contextMenus.create({
            id: SM_CONTEXT_MENU_BOOKMARK_LINK,
            title: chrome.i18n.getMessage('add_to_startme'),
            type: 'normal',
            contexts: ['link'],
            targetUrlPatterns: ['http://*/*', 'https://*/*']
        });
        //#if BROWSER == 'firefox'
        chrome.contextMenus.create({
            id: SM_CONTEXT_MENU_OPTIONS,
            title: chrome.i18n.getMessage('preferences'),
            type: 'normal',
            contexts: ['browser_action']
        });
        //#endif

        // Make sure the menus work, too
        listenForContextMenus();
    }).catch(function (err) {});
}

/**
 * Handle context menu actions
 */
function listenForContextMenus() {
    if (listeningForContextMenus) return;
    getPermissionFor('contextMenus').then(function () {
        listeningForContextMenus = true;
        chrome.contextMenus.onClicked.addListener(function (info, tab) {
            switch (info.menuItemId) {
                case SM_MESSAGE_SHOW_WELCOME:
                    return welcome();
                case SM_CONTEXT_MENU_IMPORT:
                    return importBookmarks();
                case SM_CONTEXT_MENU_BOOKMARK_LINK:
                    return showBookmarkBar(info.linkUrl, null, tab && tab.id);
                case SM_CONTEXT_MENU_HELP:
                    return showHelp();
                case SM_CONTEXT_MENU_BLOG:
                    return showBlog();
                case SM_CONTEXT_MENU_OPTIONS:
                case SM_CONTEXT_MENU_SELECT_NEW_TAB_PAGE:
                    return showOptions();
            }
        });
    }).catch(function (err) {});
}
var listeningForContextMenus = false;
listenForContextMenus();

// Listen for messages
chrome.runtime.onMessage.addListener(function (request, sender, respond) {
    switch (request.message) {
        case SM_MESSAGE_SIGN_IN:
            signIn(sender.tab && sender.tab.id).then(function () {
                return respond(true);
            }).catch(function (err) {
                return respond(false);
            });
            return true; // Keep the line open
        case SM_MESSAGE_SIGNED_IN:
            signedIn(sender.tab.id);
            return;
        case SM_MESSAGE_NOT_SIGNED_IN:
            Startme.clearCache({ keepHomepage: true });
            return;
        case SM_MESSAGE_IMPORT:
            importBookmarks(!!request.quiet).then(function (url) {
                return respond(url);
            });
            return true; // Allow for asynchronous response
        case SM_MESSAGE_CLOSE_OVERLAY:
            return closeOverlay(sender.tab, sender.frameId);
        case SM_MESSAGE_GET_PAGES:
            getPages(!!request.noCache).then(respond).catch(function (error) {
                return respond(false);
            });
            return true; // Allow for asynchronous response
        case SM_MESSAGE_GET_HOMEPAGE:
            getHomepage().then(respond).catch(function (error) {
                return respond(false);
            });
            return true; // Allow for asynchronous response
        case SM_MESSAGE_OPEN_OPTIONS_PAGE:
            chrome.runtime.openOptionsPage(function () {
                return respond(true);
            });
            return true; // Allow for asynchronous response
        case SM_MESSAGE_OPEN_URL:
            getHomepageUrl().then(function (url) {
                respond({ url: url });
            });
            return true;
        case SM_MESSAGE_CLEAR_CACHE:
            Startme.clearCache();
            return;
    }
});

// Listen for external messages
chrome.runtime.onMessageExternal.addListener(function (request, sender, respond) {
    switch (request.message) {
        case SM_MESSAGE_OPEN_URL:
            // Let extension open a specific URL (not openable from a plain HTML-page)
            if (request.openInNewWindow) {
                chrome.tabs.create({ url: request.url, active: !!request.active });
            } else {
                chrome.tabs.update({ url: request.url });
            }
            respond(true); // Send some feedback
            return;

        case SM_MESSAGE_CLEAR_CACHE:
            Startme.clearCache();
            return;

        case SM_MESSAGE_RESET_HOMEPAGE_ID:
            resetHomepageId(request.pageId);
            return;

        case SM_DELETE_PAGE:
            if (request.pageId === localStorage[SM_OPTION_HOMEPAGE_ID]) {
                delete localStorage[SM_OPTION_HOMEPAGE_ID];
                delete localStorage[SM_OPTION_HOMEPAGE_URL];
            }

            Startme.clearCache();

            return;
    }
});

/**
 * Listens for extension commands
 */
chrome.commands.onCommand.addListener(function (command) {
    switch (command) {
        case SM_COMMAND_OPEN_HOMEPAGE:
            chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
                var tab = tabs[0];
                chrome.tabs.update(tab.id, {
                    url: SM_PRIMARY_LOCATION
                });
            });
            break;
    }
});

/**
 * Handles clicking on browser action button
 */
// chrome.browserAction.onClicked.addListener(tab => {
//     showBookmarkBar(tab.url, tab.title, tab.id);
// })

/**
 * Reacts to tab changes
 */
chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
    enableExtension(tab.id);
});

/**
 * Listen omnibox on Enter hit
 */
chrome.omnibox.onInputEntered.addListener(function (text, disposition) {
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        if (tabs.length != 1) return;
        var url = void 0;

        if (SM_HTTP_URL_PATTERN.test(text)) url = text;else url = STARTME_SEARCH_PAGE_PATTERN.replace('{query}', encodeURIComponent(text));

        chrome.tabs.update(tabs[0].id, { url: url });
    });
});

/**
 * Listen omnibox on change
 */
chrome.omnibox.onInputChanged.addListener(function (text, suggest) {
    var userData = void 0;

    try {
        userData = JSON.parse(localStorage.cachedUser);
    } catch (e) {}

    if (!userData || !userData.user) {
        Startme.getUser(true /* Force check */).then(function () {
            initSearch(text, suggest);
        }).catch(function () {});
    } else {
        initSearch(text, suggest);
    }
});

function initSearch(text, suggest) {
    searchForBookmarks(text).then(function (bookmarks) {
        suggest(bookmarks);
    }).catch(function (err) {
        suggest([]);
    });
}

function searchForBookmarks() {
    var query = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '';

    return new Promise(function (resolve, reject) {
        if (query.trim().length < 2) {
            resolve([]);
            return;
        }

        var userData = void 0;

        try {
            userData = JSON.parse(localStorage.cachedUser);
        } catch (e) {}

        if (!userData || !userData.user) {
            resolve([]);
            return;
        }

        RequestManager.cancelRequest('omnibox');
        var controller = RequestManager.createRequestController('omnibox');

        fetch(Startme.apiURL('/u/' + userData.user.public_id + '/extension_bookmarks.json?query=' + query.trim()), {
            method: 'GET',
            credentials: 'include',
            signal: controller.signal
        }).then(function (response) {
            response.json().then(function () {
                var data = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

                if (!data.bookmarks || !data.bookmarks.length) {
                    resolve([]);
                    return;
                }

                var suggestions = formSuggestions(data.bookmarks, query.trim());
                resolve(suggestions);
            }).catch(function () {
                resolve([]);
            });
        }).catch(function (err) {
            if (controller.signal.aborted) return;

            resolve([]);
        });
    });
}

function formSuggestions(bookmarks, query) {
    var formedBookmarks = bookmarks.sort(function (a, b) {
        return (a.title || '').toLowerCase() > (b.title || '').toLowerCase() ? 1 : -1;
    }).map(function (bookmark) {
        var description = '' + markMatches(Sanitizer.escapeString(bookmark.title), query) + wrapString(Sanitizer.escapeString(bookmark.url));

        return {
            content: bookmark.url,
            description: description
        };
    });

    return formedBookmarks;
}

function markMatches(text) {
    var query = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : '';

    //#if BROWSER == 'firefox'
    return text;
    //#else
    var re = new RegExp('(.*?)(' + query.trim() + ')(.*)', 'i');
    var results = re.exec(text);

    if (!results) return '<match>' + text + '</match>';

    var html = '';

    if (results[1]) html += results[1];
    html += '<match>' + results[2] + '</match>';
    if (results[3]) html += results[3];

    return html;
    //#endif
}

function wrapString(text) {
    //#if BROWSER == 'firefox'
    return ' - ' + text;
    //#else
    return wrapStringDim(text);
    //#endif
}

function wrapStringDim(text) {
    return '<dim> - ' + text + '</dim>';
}

var REGULAR_ICON = { "19": "icons/icon19.png", "38": "icons/icon38.png" };
var GREY_ICON = { "19": "icons/icon-grey19.png", "38": "icons/icon-grey38.png" };
var GOLD_ICON = { "19": "icons/icon-gold19.png", "38": "icons/icon-gold38.png" };

function enableExtension(id) {
    chrome.browserAction.enable(id);
    chrome.browserAction.setIcon({ path: REGULAR_ICON });
    chrome.browserAction.setTitle({ title: chrome.i18n.getMessage('add_to_startme') });
}

function signIn(tabId) {

    var tabsToNotifyAfterSignIn = [];
    try {
        tabsToNotifyAfterSignIn = JSON.parse(localStorage.tabsToNotifyAfterSignIn);
        if ((typeof tabsToNotifyAfterSignIn === 'undefined' ? 'undefined' : _typeof(tabsToNotifyAfterSignIn)) != 'object') tabsToNotifyAfterSignIn = [];
    } catch (e) {
        tabsToNotifyAfterSignIn = [];
    }
    tabsToNotifyAfterSignIn.push(tabId);
    localStorage.tabsToNotifyAfterSignIn = JSON.stringify(tabsToNotifyAfterSignIn);

    return showPopup(chrome.runtime.getURL('sign_in.html'), 750, 750);
}

function signedIn(tabId) {

    chrome.tabs.remove(tabId);

    var tabsToNotifyAfterSignIn = [];

    try {
        tabsToNotifyAfterSignIn = JSON.parse(localStorage.tabsToNotifyAfterSignIn);
    } catch (error) {
        tabsToNotifyAfterSignIn = [];
    }

    delete localStorage.tabsToNotifyAfterSignIn;

    var _iteratorNormalCompletion = true;
    var _didIteratorError = false;
    var _iteratorError = undefined;

    try {
        for (var _iterator = tabsToNotifyAfterSignIn[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
            var _tabId = _step.value;

            chrome.tabs.sendMessage(_tabId, { message: SM_MESSAGE_SIGNED_IN });
        }
    } catch (err) {
        _didIteratorError = true;
        _iteratorError = err;
    } finally {
        try {
            if (!_iteratorNormalCompletion && _iterator.return) {
                _iterator.return();
            }
        } finally {
            if (_didIteratorError) {
                throw _iteratorError;
            }
        }
    }
}

function showBookmarkBar(url, title, tabId) {
    var message = { message: SM_MESSAGE_SHOW_BOOKMARK_BAR, url: url, title: title, tabId: tabId };
    sendMessageToActiveTab(message, true).catch(function (err) {

        showBookmarkBarInPopup(url, title, tabId);
    });
}

function showBookmarkBarInPopup(url, title, tabId) {
    showPopup(chrome.runtime.getURL('bookmark_bar.html'), 500, 530, 0.95);
}

function showHelp() {
    showPopup('https://support.start.me');
}

function showBlog() {
    showPopup('https://blog.start.me');
}

function showOptions() {
    chrome.runtime.openOptionsPage();
}

function closeOverlay(tab, frameId) {
    if (frameId > 0) {

        chrome.tabs.sendMessage(tab.id, { message: SM_MESSAGE_CLOSE_OVERLAY });
    } else {

        chrome.tabs.remove(tab.id);
    }
}

function afterInstall() {

    welcome();
}

function afterUpdate() {
    getPermissionFor('contextMenus').catch(function (err) {
        welcome();
    });
}

function showPopup(url) {
    var width = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0.8;
    var height = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 0.8;
    var centerX = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : 0.5;
    var centerY = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : 0.5;

    return new Promise(function (resolve, reject) {

        var options = {
            url: url,
            focused: true,
            type: chrome.windows.WindowType.POPUP
        };

        switch (width) {
            case 'fullscreen':
                options.state = chrome.windows.WindowState.FULLSCREEN;
                break;
            default:
                var screenWidth = screen.availWidth,
                    screenHeight = screen.availHeight;
                width = parseFloat(width) || 0.8;
                height = parseFloat(height) || 0.8;
                if (width <= 1) width = screenWidth * width;
                if (height <= 1) height = screenHeight * height;
                options.width = width = Math.round(Math.min(screenWidth, width));
                options.height = height = Math.round(Math.min(screenHeight, height));
                options.left = Math.round((screenWidth - width) * centerX);
                options.top = Math.round((screenHeight - height) * centerY);
        }

        chrome.windows.create(options, function (window) {
            chrome.tabs.query({ windowId: window.id, index: 0 }, function (tabs) {
                if (tabs.length > 0) {
                    resolve(tabs[0]);
                } else {
                    reject();
                }
            });
        });
    });
}

function newTab(url) {
    return new Promise(function (resolve, reject) {
        chrome.tabs.create({
            url: url
        }, function (tab) {
            if (chrome.runtime.lastError) return reject(chrome.runtime.lastError);
            resolve(tab);
        });
    });
}

function waitForTabToLoad(tab) {
    return new Promise(function (resolve, reject) {

        if (tab.status == chrome.tabs.TabStatus.COMPLETE) return resolve();

        var listener = function listener(tabId, changes, tab) {
            if (changes.status != chrome.tabs.TabStatus.COMPLETE) return;

            chrome.tabs.onUpdated.removeListener(listener);
            resolve(tab);
        };

        chrome.tabs.onUpdated.addListener(listener);
    });
}

function welcome() {
    showWelcomePage(false).then(function (_ref) {
        var isNewUser = _ref.isNewUser,
            openSignIn = _ref.openSignIn;

        if (openSignIn) {

            goToSignIn();
        } else if (isNewUser) {

            showTour();
        } else {

            openHomepage();
        }

        registerContextMenus();
    }).catch(function (err) {});
}

function showWelcomePage() {
    var fullScreen = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : true;

    return new Promise(function (resolve, reject) {
        showPopup(chrome.runtime.getURL('welcome.html'), fullScreen ? 'fullscreen' : undefined).then(function (tab) {
            return waitForTabToLoad(tab);
        }).then(function (tab) {
            chrome.tabs.sendMessage(tab.id, { message: SM_MESSAGE_SHOW_WELCOME }, function (data) {
                if (chrome.runtime.lastError) {
                    return reject();
                }

                resolve(data);
            });
        });
    });
}

function goToSignIn() {
    Startme.clearCache();
    return newTab(Startme.apiURL('/users/sign_out'));
}

function showTour() {
    return newTab(Startme.apiURL('/users/home#tour'));
}

function importBookmarks() {
    var quiet = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;

    return new Promise(function (resolve, reject) {
        if (quiet) {
            getPermissionFor('bookmarks').then(importBookmarkTree).then(function (importId) {
                return resolve(importId);
            }).catch(reject);
        } else {
            var importTabId = void 0;
            getPermissionFor('bookmarks').then(function () {
                return showPopup(chrome.runtime.getURL('import.html'), 1000, 600).then(function (tab) {
                    importTabId = tab.id;
                });
            }).then(importBookmarkTree).then(function (importId) {
                chrome.tabs.sendMessage(importTabId, { message: SM_MESSAGE_START_POLLING, importId: importId }, {}, function (importedPageUrl) {

                    chrome.tabs.remove(importTabId);

                    if (importedPageUrl) {
                        chrome.tabs.create({
                            url: importedPageUrl
                        });
                        resolve(importedPageUrl);
                    } else {
                        reject();
                    }
                });
            }).catch(reject);
        }
    });
}

function getActiveTab() {
    return new Promise(function (resolve, reject) {
        chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
            if (tabs.length != 1) return reject();
            resolve(tabs[0]);
        });
    });
}

function sendMessageToActiveTab(message, expectedResponse) {
    return new Promise(function (resolve, reject) {
        getActiveTab().then(function (tab) {
            chrome.tabs.sendMessage(tab.id, message, function (response) {
                if (chrome.runtime.lastError) return reject(chrome.runtime.lastError);

                if (typeof expectedResponse != 'undefined' && response !== expectedResponse) return reject();

                resolve(response);
            });
        }).catch(reject);
    });
}

function checkPermissionFor(permissions) {
    return new Promise(function (resolve) {
        chrome.permissions.contains({ permissions: permissions }, resolve);
    });
}

function getPermissionFor() {
    for (var _len = arguments.length, permissions = Array(_len), _key = 0; _key < _len; _key++) {
        permissions[_key] = arguments[_key];
    }

    if (!chrome.permissions) return Promise.resolve();

    return new Promise(function (resolve, reject) {
        checkPermissionFor(permissions).then(function (hasPermissions) {
            if (hasPermissions) return resolve();

            chrome.permissions.request({
                permissions: permissions
            }, function (granted) {
                if (granted) {
                    resolve();
                } else {
                    reject(chrome.runtime.lastError);
                }
            });
        });
    });
}

function importBookmarkTree() {
    return new Promise(function (resolve, reject) {
        chrome.bookmarks.getTree(function (nodes) {
            var data = new FormData();
            data.append('page_id', '');
            data.append('title', 'Imported Bookmarks');
            data.append('import_content', buildImportFile(nodes));

            fetch(Startme.apiURL('/import'), {
                method: 'POST',
                credentials: 'include',
                body: data
            }).then(function (response) {
                if (response.status != 200) return reject();

                response.json().then(function (data) {
                    if (data.id > 0) resolve(data.id);else reject();
                }).catch(reject);
            });
        });
    });

    function buildImportFile(nodes) {
        var content = "<!DOCTYPE NETSCAPE-Bookmark-file-1>\n" + "<!-- This is an automatically generated file.\n" + "     It will be read and overwritten.\n" + "     DO NOT EDIT! -->\n" + "<META HTTP-EQUIV=\"Content-Type\" CONTENT=\"text/html; charset=UTF-8\">\n" + "<TITLE>Imported Bookmarks</TITLE>\n" + "<H1>Imported Bookmarks</H1>\n" + "<DL><p>\n";

        for (var i = 0; i < nodes.length; i++) {
            content += generateBookmark(nodes[i]);
        }

        content += "</DL><p>\n";
        var content = "<!DOCTYPE NETSCAPE-Bookmark-file-1>\n" + "<!-- This is an automatically generated file.\n" + "     It will be read and overwritten.\n" + "     DO NOT EDIT! -->\n" + "<META HTTP-EQUIV=\"Content-Type\" CONTENT=\"text/html; charset=UTF-8\">\n" + "<TITLE>Imported Bookmarks</TITLE>\n" + "<H1>Imported Bookmarks</H1>\n" + "<DL><p>\n";

        for (var i = 0; i < nodes.length; i++) {
            content += generateBookmark(nodes[i]);
        }

        content += "</DL><p>\n";
        return content;
    }

    function generateBookmark(node) {
        var content = "";

        if (node.children && node.children.length > 0) {
            content += "<DT><H3 ADD_DATE=\"" + node.dateAdded + "\" LAST_MODIFIED=\"" + node.dateGroupModified + "\">" + node.title + "</H3>\n" + "<DL><p>\n";

            for (var i = 0; i < node.children.length; i++) {
                content += generateBookmark(node.children[i]);
            }

            content += "</DL><p>\n";
        }

        if (node.url) {
            content += "<DT><A HREF=\"" + node.url + "\" ADD_DATE=\"" + node.dateAdded + "\">" + node.title + "</A>\n";
        }

        return content;
    }
}

function getHomepage() {
    var homepageId = localStorage[SM_OPTION_HOMEPAGE_ID];
    return new Promise(function (resolve, reject) {
        getPages().then(function (pages) {
            var homepage = pages.filter(function (page) {
                return page.id == homepageId;
            }).shift();
            if (!homepage) homepage = pages.shift();
            if (homepage) resolve(homepage);else reject();
        }).catch(reject);
    });
}

function resetHomepageId(pageId) {
    var homepageId = parseInt(localStorage[SM_OPTION_HOMEPAGE_ID]);

    getPages(true).then(function (pages) {
        if (homepageId !== pageId) return;

        delete localStorage[SM_OPTION_HOMEPAGE_ID];
        delete localStorage[SM_OPTION_HOMEPAGE_URL];
        homepage = pages.shift();

        if (homepage) localStorage[SM_OPTION_HOMEPAGE_ID] = homepage.id;
    }).catch(function (err) {});
}

function getHomepageUrl() {
    return new Promise(function (resolve) {
        var homepageUrl = localStorage[SM_OPTION_HOMEPAGE_URL];
        if (homepageUrl) return resolve(homepageUrl);

        getHomepage().then(function (homepage) {

            localStorage[SM_OPTION_HOMEPAGE_ID] = homepage.id;
            localStorage[SM_OPTION_HOMEPAGE_URL] = homepage.url;

            resolve(homepage.url);
        }).catch(function (err) {
            return resolve(Startme.apiURL('/users/home'));
        });
    });
}

function getPages() {
    var noCache = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;

    return new Promise(function (resolve, reject) {

        var cachedPages = false;
        try {
            cachedPages = JSON.parse(localStorage.cachedPages);
            if ((typeof cachedPages === 'undefined' ? 'undefined' : _typeof(cachedPages)) != 'object') cachedPages = false;
        } catch (e) {
            cachedPages = false;
        }

        if (!noCache && cachedPages && 'pages' in cachedPages) {
            resolve(cachedPages.pages);

            if (!cachedPages || Startme.now() - cachedPages.timestamp > 2 * Startme.MINUTE) {
                fetchAndCache().catch(function (err) {});
            }
        } else {
            fetchAndCache().then(resolve).catch(reject);
        }

        function fetchAndCache() {
            return new Promise(function (resolve, reject) {
                fetchPages().then(function (pages) {
                    localStorage.cachedPages = JSON.stringify({
                        pages: pages,
                        timestamp: Startme.now()
                    });
                    resolve(pages);
                }).catch(function (err) {

                    delete localStorage.cachedPages;
                    reject();
                });
            });
        }
    });

    function fetchPages() {
        return new Promise(function (resolve, reject) {
            fetch(Startme.apiURL('/pages/tree_extension.json'), { credentials: 'include' }).then(function (response) {
                if (response.status != 200) return reject();
                response.json().then(function (pages) {
                    if (pages.notLoggedIn) reject();else resolve(pages);
                });
            });
        });
    }
}

function openOrCreateTab(tabId, url) {
    if (tabId) {

        chrome.tabs.update(tabId, { url: url });
    } else {
        chrome.tabs.create({ url: url });
    }
}

function openHomepage() {
    var tabId = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;

    getHomepageUrl().then(function (url) {
        openOrCreateTab(tabId, url);
    }).catch(function (err) {
        openOrCreateTab(tabId, Startme.apiURL('/users/home'));
    });
}
