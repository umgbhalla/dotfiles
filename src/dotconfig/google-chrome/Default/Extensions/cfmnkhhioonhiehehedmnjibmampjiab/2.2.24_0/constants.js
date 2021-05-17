'use strict';

var SM_STARTME_ID = 'startme';
var SM_OVERLAY_ID = 'startme-overlay';
var SM_OVERLAY_MARKER_ATTRIBUTE = 'data-startme-overlay';

var BROWSER_CHROME = 'chrome';
var BROWSER_TORCH = 'torch';
var BROWSER_VIVALDI = 'vivaldi';
var BROWSER_IRON = 'iron';
var BROWSER_FIREFOX = 'firefox';
var BROWSER_OPERA = 'opera';
var BROWSER_EDGE = 'edge';

var PRIMARY_DOMAIN = 'start.me';
var CURRENT_BROWSER = function () {
    if (isBrowser(BROWSER_VIVALDI)) {
        return BROWSER_VIVALDI;
    } else if (isBrowser(BROWSER_IRON)) {
        return BROWSER_IRON;
    } else if (isBrowser(BROWSER_OPERA)) {
        return BROWSER_OPERA;
    } else if (isBrowser(BROWSER_EDGE)) {
        return BROWSER_EDGE;
    }
    return BROWSER_CHROME;
}();
var SM_PRIMARY_LOCATION = function () {
    switch (CURRENT_BROWSER) {
        case BROWSER_TORCH:
            return 'https://torch.' + PRIMARY_DOMAIN;
        case BROWSER_IRON:
            return 'https://iron.' + PRIMARY_DOMAIN;
        case BROWSER_VIVALDI:
            return 'https://vivaldi.' + PRIMARY_DOMAIN;
        default:
            return 'https://' + PRIMARY_DOMAIN;
    }
}();
var SM_API_LOCATION = SM_PRIMARY_LOCATION;

var SM_HTTP_URL_PATTERN = /^https?:\/\//;
var STARTME_SEARCH_PAGE_PATTERN = 'https://start.me/search/google-startme?q={query}';
var USER_PREFERENCES_LINK = 'https://start.me/users/edit';

var SM_OPTION_HOMEPAGE_ID = 'homepageId';
var SM_OPTION_HOMEPAGE_URL = 'homepageUrl';
var SM_OPTION_LAST_WIDGET_ID = 'lastWidgetId';
var SM_OPTION_LAST_WIDGET_ID_RSS = 'lastWidgetIdRSS';

var SM_MESSAGE_SIGN_IN = 'signIn';
var SM_MESSAGE_SIGNED_IN = 'signedInToStartme';
var SM_MESSAGE_NOT_SIGNED_IN = 'signedOut';
var SM_MESSAGE_OPTION_CHANGED = 'optionChanged';
var SM_MESSAGE_SHOW_WELCOME = 'showWelcomePage';
var SM_MESSAGE_IMPORT = 'importBookmarks';
var SM_MESSAGE_START_POLLING = 'startPolling';
var SM_MESSAGE_SHOW_BOOKMARK_BAR = 'showStartmeBookmarkBar';
var SM_MESSAGE_CLOSE_OVERLAY = 'closeStartmeOverlay';
var SM_MESSAGE_GET_PAGES = 'getPages';
var SM_MESSAGE_GET_HOMEPAGE = 'getHomepage';
var SM_MESSAGE_RESET_HOMEPAGE_ID = 'resetHomepageId';
var SM_MESSAGE_OPEN_OPTIONS_PAGE = 'openOptionsPage';
var SM_MESSAGE_OPEN_URL = 'openUrl';
var SM_MESSAGE_CLEAR_CACHE = 'clearCache';

var SM_CONTEXT_MENU_IMPORT = 'contextMenuImport';
var SM_CONTEXT_MENU_HELP = 'contextMenuHelp';
var SM_CONTEXT_MENU_SELECT_NEW_TAB_PAGE = 'contextMenuSelectNewTabPage';
var SM_CONTEXT_MENU_BLOG = 'contextMenuBlog';
var SM_CONTEXT_MENU_BOOKMARK_LINK = 'contextMenuBookmarkLink';
var SM_CONTEXT_MENU_OPTIONS = 'contextMenuSettings';

var SM_COMMAND_OPEN_HOMEPAGE = 'open_startme_homepage';
var SM_DELETE_PAGE = 'deletePage';

function isBrowser(browser) {
    if (!window || !window.navigator) return false;

    if (browser == BROWSER_EDGE) {
        return !!window.StyleMedia || navigator.userAgent.indexOf('Edg/') > -1;
    }

    var reOptions = 'gi';

    if (browser == BROWSER_OPERA) {
        browser = 'OPR';
        reOptions = 'g';
    }

    var re = new RegExp(browser, reOptions);
    if (re.test(window.navigator.userAgent)) return true;
    return false;
}

function homepageSettingSupported() {
    return !isBrowser(BROWSER_VIVALDI);
}

function optionsOpenedInTab() {
    return chrome.runtime.getManifest().options_ui.open_in_tab;
}
