'use strict';

var getById = document.getElementById.bind(document);

if (optionsOpenedInTab()) document.documentElement.classList.add('open-in-tab');

document.querySelector('main').style.visibility = 'visible';

var $homepageSection = getById('my-homepage');
var $homepageField = getById('homepage');
var $refresh = getById('refresh');
var $bookmarksImport = getById('import-bookmarks');
var $preferences = getById('preferences');
var $clearCacheButton = getById('clear-cache');

if (homepageSettingSupported()) {
    initPages();

    $homepageField.addEventListener('change', function (event) {
        setHomePage(event.target.value);
    });

    $refresh.addEventListener('click', initPages);
} else {
    $homepageSection.remove();
}

$bookmarksImport.addEventListener('click', function (event) {
    chrome.runtime.sendMessage({ message: SM_MESSAGE_IMPORT });
});

$preferences.addEventListener('click', function () {
    window.open(USER_PREFERENCES_LINK);
});

$clearCacheButton.addEventListener('click', function () {
    chrome.runtime.sendMessage({ message: SM_MESSAGE_CLEAR_CACHE });
});

function initPages() {
    chrome.runtime.sendMessage({ message: SM_MESSAGE_GET_PAGES, noCache: true }, function (pages) {
        if (!pages) return;

        var homepageId = generatePages(pages);
        setHomePage(homepageId);
    });
}

function generatePages(pages) {

    $homepageField.innerHTML = "";

    var groups = groupPagesByTeams(pages);

    var storedHomepageId = parseInt(localStorage[SM_OPTION_HOMEPAGE_ID]);
    var homepageId = null;

    var _iteratorNormalCompletion = true;
    var _didIteratorError = false;
    var _iteratorError = undefined;

    try {
        for (var _iterator = groups[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
            var group = _step.value;

            var groupOptions = document.createElement('optgroup');
            groupOptions.setAttribute('label', group.title);

            var _iteratorNormalCompletion2 = true;
            var _didIteratorError2 = false;
            var _iteratorError2 = undefined;

            try {
                for (var _iterator2 = group.pages[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
                    var page = _step2.value;

                    if (page.id == storedHomepageId) homepageId = page.id;
                    Startme.crel(groupOptions, 'option', { value: page.id }, page.title);
                }
            } catch (err) {
                _didIteratorError2 = true;
                _iteratorError2 = err;
            } finally {
                try {
                    if (!_iteratorNormalCompletion2 && _iterator2.return) {
                        _iterator2.return();
                    }
                } finally {
                    if (_didIteratorError2) {
                        throw _iteratorError2;
                    }
                }
            }

            $homepageField.appendChild(groupOptions);
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

    if (!homepageId && pages.length > 0) {
        homepageId = pages[0].id;
    };

    return homepageId;
}

function setHomePage(homepageId) {
    localStorage[SM_OPTION_HOMEPAGE_ID] = homepageId;
    delete localStorage[SM_OPTION_HOMEPAGE_URL];
    $homepageField.options.selectedIndex = $homepageField.querySelector('option[value="' + homepageId + '"]').index;

    notifyOptionChanged();
}

function notifyOptionChanged() {
    chrome.runtime.sendMessage({ message: SM_MESSAGE_OPTION_CHANGED });
}

function groupPagesByTeams(pages) {
    var personalPagesGroup = {
        title: 'Personal Pages',
        pages: pages.filter(function (page) {
            return page.organization_id === null;
        })
    };

    var teamsGroups = [];
    var teamPages = pages.filter(function (page) {
        return page.organization_id !== null;
    });

    teamPages.forEach(function (page) {
        var team = teamsGroups.find(function (item) {
            return item.title === page.organization_title;
        });

        if (team !== undefined) {
            var index = teamsGroups.findIndex(function (item) {
                return item.title === team.title;
            });
            teamsGroups[index].pages.push(page);

            return;
        }

        teamsGroups.push({ title: page.organization_title, pages: [page] });
    });

    var groups = [].concat(teamsGroups);

    if (personalPagesGroup.pages.length > 0) {
        groups.unshift(personalPagesGroup);
    }

    return groups;
}
