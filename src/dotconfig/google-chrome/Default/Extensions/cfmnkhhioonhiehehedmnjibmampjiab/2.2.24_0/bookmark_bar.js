'use strict';

document.querySelector('base').setAttribute('href', Startme.apiURL());

var getById = document.getElementById.bind(document);

if (optionsOpenedInTab()) document.documentElement.classList.add('open-in-tab');

var $homepageSection = getById('my-homepage');
var $homepageField = getById('homepage');
var $refresh = getById('refresh');
var $bookmarksImport = getById('import-bookmarks');

if (homepageSettingSupported()) {
    initPages();

    $homepageField.addEventListener('change', function (event) {
        setHomePage(event.target.value);
    });

    $refresh.addEventListener('click', function () {
        chrome.runtime.sendMessage({ message: SM_MESSAGE_CLEAR_CACHE });
        initPages();
    });
} else {
    $homepageSection.remove();
}

$bookmarksImport.addEventListener('click', function (event) {
    chrome.runtime.sendMessage({ message: SM_MESSAGE_IMPORT });
});

function initPages() {
    chrome.runtime.sendMessage({ message: SM_MESSAGE_GET_PAGES, noCache: true }, function (pages) {
        if (!pages) return;

        var homepageId = generatePages(pages);
        setHomePage(homepageId);
    });
}

function generatePages(pages) {

    var filteredPages = pages.filter(function (p) {
        return !p.is_archived;
    });

    $homepageField.innerHTML = "";

    var groups = groupPagesByTeams(filteredPages);

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

    if (!homepageId && filteredPages.length > 0) {
        homepageId = filteredPages[0].id;
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

var ID_REGEXP = /^(\d+)_(.+)/;

Startme.requireUser().then(function (user) {
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        var tab = tabs[0];
        if (tab) {
            var url = tab.url,
                title = tab.title,
                id = tab.id;

            initialize((url || '').replace(/\/+$/, ""), title, parseInt(id) || undefined);
        }
    });
});

function initialize(url, title) {
    var tabId = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;


    var bar = getById('bookmarkbar'),
        titleField = getById('link_title'),
        urlField = getById('link_url'),
        saveButton = getById('save'),
        switcherOptionsButton = getById('switcher'),
        switcherOptionsBackButton = getById('switcherBack'),
        newFieldLabel = getById('newFieldLabel'),
        doneIcon = getById('done'),
        errorIcon = getById('error'),
        settingsTab = getById('options-settings'),
        shortcutsTab = getById('options-shortcuts'),
        settingsTabContent = getById('options-settings-content'),
        shortcutsTabContent = getById('options-shortcuts-content'),
        browserActionShortcut = getById('browser-action-shortcut'),
        homepageShortcut = getById('start-me-homepage-shortcut'),
        refreshIcon = getById('refresh-icon');

    var closeButtons = Array.from(document.querySelectorAll('.js-close-button'));
    if (closeButtons.length) {
        closeButtons.forEach(function (cb) {
            cb.addEventListener('click', closeOverlay);
        });
    }

    var searchable = document.querySelector('.js-searchable');
    var searchableField = searchable.querySelector('.js-searchable-field');
    var searchableInput = searchable.querySelector('.js-searchable-input');
    var searchableInputNew = searchable.querySelector('.js-searchable-input-new');
    var searchableInputClear = searchable.querySelector('.js-searchable-input-clear');

    var searchResults = document.querySelector('.js-search-results');
    var searchableInputFilter = searchResults.querySelector('.js-searchable-input-filter');
    var searchableInputFilterClear = searchResults.querySelector('.js-searchable-input-filter-clear');
    var searchableList = searchResults.querySelector('.js-searchable-list');
    var searchableBack = searchResults.querySelector('.js-search-back');
    var shortcutChangers = Array.from(document.querySelectorAll('.js-shortcut-changer'));

    var regularLinks = document.querySelectorAll('#regular-link');

    titleField.value = title;
    urlField.value = url;

    titleField.select();
    setTimeout(function () {
        return titleField.focus();
    }, 1);

    if (!title) {
        titleField.value = Startme.titleFromUrl(url);
    };

    searchableBack.addEventListener('click', function (event) {
        closeSearchableList();
    });

    searchableField.addEventListener('click', function (event) {
        event.preventDefault();
        event.stopPropagation();

        searchableInput.setAttribute('placeholder', searchableInput.value || chrome.i18n.getMessage('select_a_widget'));
        searchableInput.value = '';

        searchResults.classList.add('searchable__container_revealed');
        scrollToSelected();
        setTimeout(function () {
            searchableInputFilter.focus();
        }, 500);
    });

    searchableInput.addEventListener('blur', function (event) {

        filterWidgets();

        var _searchable$dataset = searchable.dataset,
            widgetTitle = _searchable$dataset.widgetTitle,
            pageTitle = _searchable$dataset.pageTitle,
            widgetGroupTitle = _searchable$dataset.widgetGroupTitle;

        searchableInput.value = getSearchableInputValue(pageTitle, widgetTitle, widgetGroupTitle);
        searchable.classList.remove('searchable_active');
    });

    searchableInputFilter.addEventListener('input', function (event) {
        searchable.classList.add('searchable_active');
        filterWidgets((event.srcElement.value || '').toLowerCase());
    });

    searchableList.addEventListener('mousedown', function (event) {
        event.preventDefault();

        if (!event.target) return;

        var isWidget = event.target.matches('.js-searchable-widget');
        var isNewWidget = event.target.matches('.js-searchable-new-widget');
        var isWidgetGroup = event.target.matches('.js-searchable-widget-group');
        var isNewWidgetGroup = event.target.matches('.js-searchable-new-widget-group');

        if (!isWidget && !isNewWidget && !isWidgetGroup && !isNewWidgetGroup) {
            return;
        }

        var _event$target$dataset = event.target.dataset,
            pageTitle = _event$target$dataset.pageTitle,
            pageId = _event$target$dataset.pageId,
            widgetTitle = _event$target$dataset.widgetTitle,
            widgetId = _event$target$dataset.widgetId,
            widgetGroupId = _event$target$dataset.widgetGroupId,
            widgetGroupTitle = _event$target$dataset.widgetGroupTitle;


        if (isWidget) {
            searchableInput.value = getSearchableInputValue(pageTitle, widgetTitle);
            searchable.dataset.widgetTitle = widgetTitle;
            searchable.dataset.widgetId = widgetId;
            searchable.dataset.pageTitle = pageTitle;
            delete searchable.dataset.pageId;
            setTimeout(function () {
                searchableInput.blur();
                cancelSearchableError();
            }, 200);
        } else if (isNewWidget) {
            searchable.classList.add('searchable_mode_new');
            searchableInput.value = '';
            searchable.dataset.pageId = pageId;
            delete searchable.dataset.widgetId;
            delete searchable.dataset.pageTitle;
            setNewFieldLabel({ pageTitle: pageTitle });
            setTimeout(function () {
                return searchableInputNew.focus();
            }, 200);
        } else if (isWidgetGroup) {
            searchableInput.value = getSearchableInputValue(pageTitle, widgetTitle, widgetGroupTitle);
            searchable.dataset.widgetTitle = widgetTitle;
            searchable.dataset.widgetId = widgetId;
            searchable.dataset.pageTitle = pageTitle;
            searchable.dataset.widgetGroupId = widgetGroupId;
            searchable.dataset.widgetGroupTitle = widgetGroupTitle;
            delete searchable.dataset.pageId;
            setTimeout(function () {
                searchableInput.blur();
                cancelSearchableError();
            }, 200);
        } else if (isNewWidgetGroup) {
            searchable.classList.add('searchable_mode_new');
            searchableInput.value = '';
            searchableInputNew.setAttribute('placeholder', chrome.i18n.getMessage('title_for_new_group'));
            searchable.dataset.pageId = pageId;
            searchable.dataset.widgetId = widgetId;
            searchable.dataset.widgetGroupId = 'new';
            delete searchable.dataset.pageTitle;
            delete searchable.dataset.widgetGroupTitle;
            setNewFieldLabel({ pageTitle: pageTitle, widgetTitle: widgetTitle });
            setTimeout(function () {
                return searchableInputNew.focus();
            }, 200);
        }

        closeSearchableList();
    });

    function setNewFieldLabel(_ref) {
        var pageTitle = _ref.pageTitle,
            widgetTitle = _ref.widgetTitle;

        if (!pageTitle) {
            newFieldLabel.textContent = chrome.i18n.getMessage('save_in');
            return;
        }

        var name = pageTitle;

        if (widgetTitle) name += ' > ' + widgetTitle;

        name = '"' + name + '"';

        newFieldLabel.textContent = chrome.i18n.getMessage('save_in') + ' ' + name;
    }

    function resetNewFieldLabel() {
        setNewFieldLabel({});
    }

    function closeSearchableList() {
        searchResults.classList.add('searchable__container_hidden');

        setTimeout(function () {
            searchResults.classList.remove('searchable__container_revealed', 'searchable__container_hidden');
        }, 600);
    };

    var descriptionUrlWrapper = document.querySelector('.js-description-url-wrapper');
    var descriptionField = document.querySelector('.js-bookmark-description');
    var changeDescriptionUrlButton = document.querySelector('.js-change-description-url');

    var refreshPagesListButton = document.querySelector('.js-refresh-pages-list');

    descriptionField.setAttribute('style', 'height: ' + descriptionField.scrollHeight + 'px; overflow-y:hidden;');
    descriptionField.addEventListener('input', function () {
        descriptionField.style.height = 'auto';
        descriptionField.style.height = descriptionField.scrollHeight + 'px';
    }, false);

    changeDescriptionUrlButton.addEventListener('click', function (event) {
        event.preventDefault();

        descriptionUrlWrapper.classList.toggle('hidden');
        descriptionField.style.height = 'auto';
        descriptionField.style.height = descriptionField.scrollHeight + 'px';

        if (descriptionUrlWrapper.classList.contains('hidden')) {
            changeDescriptionUrlButton.textContent = chrome.i18n.getMessage('change_description_and_url');
        } else {
            changeDescriptionUrlButton.textContent = chrome.i18n.getMessage('hide_description_and_url');
        }
    });

    refreshPagesListButton.addEventListener('click', function (event) {
        event.preventDefault();
        event.stopPropagation();

        refreshIcon.classList.add('fa-spin');

        getPages(true).then(function (pages) {
            createWidgetsList(pages);
            refreshIcon.classList.remove('fa-spin');
        });
    });

    searchableInputNew.addEventListener('focus', function (event) {
        searchable.classList.add('searchable_active');
        cancelSearchableError();
    });

    searchableInputClear.addEventListener('mousedown', function (event) {
        event.preventDefault();
        event.stopPropagation();

        searchableInputNew.value = '';
        searchable.classList.remove('searchable_mode_new');
        resetNewFieldLabel();
        useLastSelectedWidget(localStorage[SM_OPTION_LAST_WIDGET_ID]);
    });

    searchableInputFilterClear.addEventListener('mousedown', function (event) {
        event.preventDefault();
        event.stopPropagation();

        searchableInputFilter.value = '';
        filterWidgets();
    });

    settingsTab.addEventListener('mousedown', function (event) {
        event.preventDefault();
        event.stopPropagation();

        activateSettingsTab();
    });

    shortcutsTab.addEventListener('mousedown', function (event) {
        event.preventDefault();
        event.stopPropagation();

        activateShortcutsTab();
    });

    getPages().then(createWidgetsList);

    bar.addEventListener('keydown', function (event) {
        switch (event.keyCode) {
            case 13:
                return save();
        }
    });
    saveButton.addEventListener('click', function (event) {
        return save();
    });

    switcherOptionsButton.addEventListener('click', function (event) {
        bar.setAttribute('data-mode', 'options');
        activateSettingsTab();
        setShortcuts();
    });

    switcherOptionsBackButton.addEventListener('click', function (event) {
        bar.setAttribute('data-mode', 'link');
    });

    shortcutChangers.forEach(function (changer) {
        changer.addEventListener('click', function (event) {
            chrome.tabs.create({ url: 'chrome://extensions/shortcuts' });

            closeOverlay();
        });
    });

    regularLinks.forEach(function (link) {
        link.addEventListener('click', function (event) {
            setTimeout(function () {
                closeOverlay();
            }, 100);
        });
    });

    bar.classList.add('bookmark-bar_revealed');

    function scrollToSelected() {
        var selected = searchResults.querySelector('.selected');
        var list = searchResults.querySelector('.js-searchable-content');

        if (!selected || !list) return;

        var _selected$getBounding = selected.getBoundingClientRect(),
            top = _selected$getBounding.top;

        list.scrollTop = top - 150;
    }

    function setSearchableError() {
        searchable.classList.add('error');
    }

    function cancelSearchableError() {
        searchable.classList.remove('error');
    }

    function setShortcuts() {
        chrome.commands.getAll(function () {
            var shortcuts = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];

            var browserActionShortcutObject = shortcuts.find(function (sc) {
                return sc.name === '_execute_browser_action';
            });
            var homepageShortcutObject = shortcuts.find(function (sc) {
                return sc.name === 'open_startme_homepage';
            });

            if (browserActionShortcutObject && browserActionShortcut) browserActionShortcut.value = browserActionShortcutObject.shortcut;
            if (homepageShortcutObject && homepageShortcut) homepageShortcut.value = homepageShortcutObject.shortcut;
        });
    }

    function activateSettingsTab() {
        shortcutsTab.classList.remove('active');
        shortcutsTabContent.classList.remove('active');

        settingsTab.classList.add('active');
        settingsTabContent.classList.add('active');
    }

    function activateShortcutsTab() {
        settingsTab.classList.remove('active');
        settingsTabContent.classList.remove('active');

        shortcutsTab.classList.add('active');
        shortcutsTabContent.classList.add('active');
    }

    function getSearchableInputValue(pageTitle, widgetTitle, widgetGroupTitle) {
        return pageTitle && widgetTitle && widgetGroupTitle ? pageTitle + ': ' + widgetTitle + ': ' + widgetGroupTitle : pageTitle && widgetTitle ? pageTitle + ': ' + widgetTitle : '';
    }

    function filterWidgets() {
        var value = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '';

        var pages = document.querySelectorAll('.js-searchable-group');

        pages.forEach(function (page) {
            var widgets = page.querySelectorAll('.js-searchable-widget.link');
            var hiddenWidgetsCount = 0;

            widgets.forEach(function (widget) {
                var widgetGroups = Array.from(widget.querySelectorAll('.js-searchable-widget-group'));
                var hasWidgetTitleMatch = typeof widget.dataset.widgetTitle === 'string' ? widget.dataset.widgetTitle.toLowerCase().includes(value.toLowerCase()) : false;
                var hasGroupTitleMatch = widgetGroups.length && widgetGroups.some(function (group) {
                    return typeof group.dataset.widgetGroupTitle === 'string' && group.dataset.widgetGroupTitle.toLowerCase().includes(value.toLowerCase());
                });
                var shouldBeVisible = hasWidgetTitleMatch || hasGroupTitleMatch;

                if (shouldBeVisible) {
                    widget.classList.remove('hidden');

                    if (widgetGroups) {
                        if (hasWidgetTitleMatch) {
                            widgetGroups.forEach(function (group) {
                                group.classList.remove('hidden');
                            });
                        } else {
                            widgetGroups.forEach(function (group) {
                                if (typeof group.dataset.widgetGroupTitle === 'string' && group.dataset.widgetGroupTitle.toLowerCase().includes(value.toLowerCase())) group.classList.remove('hidden');else group.classList.add('hidden');
                            });
                        }

                        var widgetHeader = widget.querySelector('.searchable__link');
                        if (widgetHeader) widgetHeader.classList.add('searchable__link_expanded');
                    }
                } else {
                    widget.classList.add('hidden');
                    hiddenWidgetsCount += 1;

                    var _widgetHeader = widget.querySelector('.searchable__link');
                    if (_widgetHeader) _widgetHeader.classList.remove('searchable__link_expanded');
                }

                if (widgetGroups) {
                    var newWidgetGroupOption = widget.querySelector('.js-searchable-new-widget-group');
                    if (newWidgetGroupOption && value) newWidgetGroupOption.classList.add('hidden');else if (newWidgetGroupOption) newWidgetGroupOption.classList.remove('hidden');
                }
            });

            var newWidgetOption = page.querySelector('.js-searchable-new-widget');
            if (newWidgetOption && value) {
                newWidgetOption.classList.add('hidden');
            } else if (newWidgetOption) {
                newWidgetOption.classList.remove('hidden');
            }

            if ((widgets.length === 0 || widgets.length === hiddenWidgetsCount) && value !== '') {
                page.classList.add('hidden');
            } else {
                page.classList.remove('hidden');

                if (value) {
                    var subheader = page.querySelector('.searchable__item_subheader');
                    if (subheader) subheader.classList.add('searchable__item_expanded');
                } else {
                    restorePagesCollapsedStatus();
                }
            }
        });
    }

    function restorePagesCollapsedStatus() {
        var pages = Array.from(document.querySelectorAll('.js-searchable-group'));
        var widgetHeaders = Array.from(document.querySelectorAll('.searchable__link'));
        widgetHeaders.forEach(function (wh) {
            return wh.classList.remove('searchable__link_expanded');
        });

        if (!pages.length) return;

        pages.forEach(function (page) {
            var subheader = page.querySelector('.searchable__item_subheader');
            if (!subheader) return;

            if (pages.length <= 2) {
                subheader.classList.add('searchable__item_expanded');

                return;
            }

            var chosenWidgetId = searchable.dataset.widgetId;
            var chosenWidget = page.querySelector('.js-searchable-widget[data-widget-id="' + chosenWidgetId + '"]');

            if (chosenWidget) {
                subheader.classList.add('searchable__item_expanded');

                var widgetHeader = chosenWidget.querySelector('.searchable__link');
                if (widgetHeader) widgetHeader.classList.add('searchable__link_expanded');

                return;
            }

            subheader.classList.remove('searchable__item_expanded');
        });
    }

    function createWidgetsList(pages) {
        searchableList.innerHTML = "";

        var personalPagesGroup = {
            title: chrome.i18n.getMessage('personal_pages'),
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

        var _iteratorNormalCompletion3 = true;
        var _didIteratorError3 = false;
        var _iteratorError3 = undefined;

        try {
            for (var _iterator3 = groups[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
                var group = _step3.value;
                var _iteratorNormalCompletion4 = true;
                var _didIteratorError4 = false;
                var _iteratorError4 = undefined;

                try {
                    var _loop = function _loop() {
                        var page = _step4.value;

                        var wrapper = document.createElement('div');
                        wrapper.classList.add('js-searchable-group');

                        var pageTitleContainer = Startme.crel(wrapper, 'span', 'searchable__item', 'searchable__item_subheader', {});
                        Startme.crel(pageTitleContainer, 'span', 'searchable__label-text', {}, group.title + ': ' + page.title);
                        Startme.crel(pageTitleContainer, 'i', 'searchable__label-icon', 'fa', 'fa-chevron-down', {});

                        pageTitleContainer.addEventListener('mousedown', function () {
                            pageTitleContainer.classList.toggle('searchable__item_expanded');
                        });

                        var pagesSection = Startme.crel(wrapper, 'section', 'searchable__widgets-group', 'js-searchable-page', { 'data-page-id': page.id });

                        var widgets = page.widgets.filter(function (widget) {
                            return widget.widget_type === 'urllist';
                        }).sort(function (a, b) {
                            return (a.title || '').localeCompare(b.title);
                        });

                        var widgetsSections = Startme.crel(pagesSection, 'section', 'js-searchable-widgets');

                        var _iteratorNormalCompletion5 = true;
                        var _didIteratorError5 = false;
                        var _iteratorError5 = undefined;

                        try {
                            var _loop2 = function _loop2() {
                                var widget = _step5.value;

                                if (widget.settings && widget.settings.g && widget.settings.g.length) {
                                    var widgetGroups = document.createElement('div');
                                    widgetGroups.classList.add('js-searchable-widget', 'link');
                                    widgetGroups.dataset.widgetTitle = widget.title;
                                    widgetGroups.dataset.widgetId = widget.id;

                                    var widgetTitle = Startme.crel(widgetGroups, 'span', 'link', 'mode-only', 'widget', 'searchable__link', 'searchable__item', 'searchable__item_inactive', {});

                                    Startme.crel(widgetTitle, 'span', 'searchable__label-text', {}, widget.title);

                                    Startme.crel(widgetTitle, 'i', 'searchable__label-icon', 'fa', 'fa-chevron-down', {});

                                    widgetTitle.addEventListener('mousedown', function () {
                                        widgetTitle.classList.toggle('searchable__link_expanded');
                                    });

                                    var widgetGroup = Startme.crel(widgetGroups, 'span', 'link', 'mode-only', 'searchable__link-group');

                                    widget.settings.g.forEach(function (group) {
                                        Startme.crel(widgetGroup, 'span', 'link', 'mode-only', 'widget', 'searchable__item', 'searchable__item_group', 'js-searchable-widget-group', {
                                            'data-widget-title': widget.title || '',
                                            'data-widget-id': widget.id,
                                            'data-widget-group-id': group.id,
                                            'data-page-title': page.title,
                                            'data-widget-group-title': group.name
                                        }, '- ' + group.name);
                                    });

                                    var newWidgetGroupOption = '+' + chrome.i18n.getMessage('create_new_group');
                                    Startme.crel(widgetGroup, 'span', 'searchable__item', 'searchable__item_group', 'js-searchable-new-widget-group', {
                                        'data-page-title': page.title,
                                        'data-widget-title': widget.title,
                                        'data-widget-id': widget.id,
                                        'data-page-id': page.id
                                    }, newWidgetGroupOption);

                                    widgetsSections.appendChild(widgetGroups);
                                } else {
                                    Startme.crel(widgetsSections, 'span', 'link', 'mode-only', 'widget', 'searchable__item', 'js-searchable-widget', {
                                        'data-widget-title': widget.title || '',
                                        'data-widget-id': widget.id,
                                        'data-page-title': page.title
                                    }, widget.title);
                                }
                            };

                            for (var _iterator5 = widgets[Symbol.iterator](), _step5; !(_iteratorNormalCompletion5 = (_step5 = _iterator5.next()).done); _iteratorNormalCompletion5 = true) {
                                _loop2();
                            }
                        } catch (err) {
                            _didIteratorError5 = true;
                            _iteratorError5 = err;
                        } finally {
                            try {
                                if (!_iteratorNormalCompletion5 && _iterator5.return) {
                                    _iterator5.return();
                                }
                            } finally {
                                if (_didIteratorError5) {
                                    throw _iteratorError5;
                                }
                            }
                        }

                        var newWidgetOption = '+' + chrome.i18n.getMessage('new_widget');
                        Startme.crel(widgetsSections, 'span', 'searchable__item', 'js-searchable-new-widget', {
                            'data-page-title': page.title,
                            'data-widget-title': newWidgetOption,
                            'data-page-id': page.id
                        }, newWidgetOption);

                        searchableList.appendChild(wrapper);
                    };

                    for (var _iterator4 = group.pages[Symbol.iterator](), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
                        _loop();
                    }
                } catch (err) {
                    _didIteratorError4 = true;
                    _iteratorError4 = err;
                } finally {
                    try {
                        if (!_iteratorNormalCompletion4 && _iterator4.return) {
                            _iterator4.return();
                        }
                    } finally {
                        if (_didIteratorError4) {
                            throw _iteratorError4;
                        }
                    }
                }
            }
        } catch (err) {
            _didIteratorError3 = true;
            _iteratorError3 = err;
        } finally {
            try {
                if (!_iteratorNormalCompletion3 && _iterator3.return) {
                    _iterator3.return();
                }
            } finally {
                if (_didIteratorError3) {
                    throw _iteratorError3;
                }
            }
        }

        useLastSelectedWidget(localStorage[SM_OPTION_LAST_WIDGET_ID]);
        markSelectedWidget();
        restorePagesCollapsedStatus();
    }

    function useLastSelectedWidget() {
        var widgetId = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '';

        if (!searchable) return;

        var parts = widgetId.match(ID_REGEXP);
        var lastSelectedWidgetId = void 0;
        var lastSelectedWidgetGroupId = void 0;
        var selector = void 0;
        var item = void 0;

        if (parts && parts[1] && parts[2]) {
            lastSelectedWidgetId = parseInt(parts[1]);
            lastSelectedWidgetGroupId = parts[2];
            selector = '.js-searchable-widget-group[data-widget-id="' + lastSelectedWidgetId + '"][data-widget-group-id="' + lastSelectedWidgetGroupId + '"]';
        } else {
            lastSelectedWidgetId = parseInt(widgetId);
            selector = '.js-searchable-widget[data-widget-id="' + lastSelectedWidgetId + '"]';
        }

        if (selector) item = document.querySelector(selector);

        if (item) {
            var _item$dataset = item.dataset,
                widgetTitle = _item$dataset.widgetTitle,
                pageTitle = _item$dataset.pageTitle,
                widgetGroupTitle = _item$dataset.widgetGroupTitle;

            searchableInput.value = getSearchableInputValue(pageTitle, widgetTitle, widgetGroupTitle);
            searchable.dataset.widgetId = lastSelectedWidgetId;
            searchable.dataset.widgetTitle = widgetTitle;
            searchable.dataset.pageTitle = pageTitle;
            searchable.dataset.widgetGroupId = lastSelectedWidgetGroupId;
            searchable.dataset.widgetGroupTitle = widgetGroupTitle;
        }
    }

    function markSelectedWidget() {
        var widgets = Array.from(document.querySelectorAll('.js-searchable-widget'));
        var groups = Array.from(document.querySelectorAll('.js-searchable-widget-group'));

        widgets.forEach(function (w) {
            w.classList.remove('selected');
        });
        groups.forEach(function (g) {
            g.classList.remove('selected');
        });

        if (!searchable || !searchable.dataset.widgetId) return;
        var selector = '.js-searchable-widget[data-widget-id="' + searchable.dataset.widgetId + '"]';

        if (searchable.dataset.widgetGroupId !== undefined && searchable.dataset.widgetGroupId !== 'undefined') selector = '.js-searchable-widget-group[data-widget-id="' + searchable.dataset.widgetId + '"][data-widget-group-id="' + searchable.dataset.widgetGroupId + '"]';

        var selected = document.querySelector(selector);

        if (!selected) return;

        selected.classList.add('selected');
    }

    function save() {
        if (!searchableInput.value && !searchableInputNew.value) {
            setSearchableError();
            return error() && false;
        }

        var _searchable$dataset2 = searchable.dataset,
            pageId = _searchable$dataset2.pageId,
            widgetId = _searchable$dataset2.widgetId;

        var widgetGroupId = searchable.dataset.widgetGroupId && searchable.dataset.widgetGroupId !== 'undefined' ? searchable.dataset.widgetGroupId : null;
        var widgetTitle = '';
        var widgetGroupTitle = '';

        if (!widgetId) {
            widgetId = null;
            widgetGroupId = null;
        }

        if (pageId && widgetId && widgetGroupId === 'new') {

            if (!searchableInputNew.checkValidity()) return error() && false;
            widgetGroupTitle = searchableInputNew.value.trim();
        } else if (pageId) {

            if (!searchableInputNew.checkValidity()) return error() && false;
            widgetTitle = searchableInputNew.value.trim();
        }

        var data = { widgetId: widgetId, pageId: pageId, widgetTitle: widgetTitle, widgetGroupId: widgetGroupId, widgetGroupTitle: widgetGroupTitle };
        saveBookmark(data);
    }

    function showButtonSpinner() {
        saveButton.classList.add('bookmark-bar__button_processing');
    }

    function hideButtonSpinner() {
        saveButton.classList.remove('bookmark-bar__button_processing');
    }

    function saveBookmark(_ref2) {
        var widgetId = _ref2.widgetId,
            pageId = _ref2.pageId,
            widgetTitle = _ref2.widgetTitle,
            widgetGroupId = _ref2.widgetGroupId,
            widgetGroupTitle = _ref2.widgetGroupTitle;

        if (!titleField.checkValidity() || !urlField.checkValidity()) return false;

        showButtonSpinner();

        var title = titleField.value.trim();
        var url = urlField.value.trim();
        var description = descriptionField.value || "";

        createNewIfNeeded({ title: widgetTitle, type: 'urllist', pageId: pageId, widgetId: widgetId, widgetGroupId: widgetGroupId, widgetGroupTitle: widgetGroupTitle }).then(function (_ref3) {
            var widgetId = _ref3.widgetId,
                groupId = _ref3.groupId;

            var id = widgetId;

            if (!groupId) localStorage[SM_OPTION_LAST_WIDGET_ID] = id;

            var requestData = { url: url, title: title, description: description, groupTitle: widgetGroupTitle };

            if (groupId && groupId !== 'undefined' && groupId !== 'null') requestData.groupId = groupId;

            addBookmark(widgetId, requestData).then(function (data) {
                if (data.group_id && data.group_id !== 'undefined' && data.group_id !== 'null') {
                    id = widgetId + '_' + data.group_id;
                    localStorage[SM_OPTION_LAST_WIDGET_ID] = id;
                }

                if (groupId === 'new') getPages(true);

                done();
            }).catch(error);
        }).catch(error);
    }

    function done() {

        doneIcon.classList.add('show');
        Startme.timeout(1000).then(function () {
            return closeOverlay();
        });
    }

    function error() {
        var message = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 'Error';


        errorIcon.classList.add('show');
        Startme.timeout(1000).then(function () {
            return errorIcon.classList.remove('show');
        });
        hideButtonSpinner();
    }

    function createNewIfNeeded(_ref4) {
        var pageId = _ref4.pageId,
            widgetId = _ref4.widgetId,
            title = _ref4.title,
            type = _ref4.type,
            widgetGroupId = _ref4.widgetGroupId,
            widgetGroupTitle = _ref4.widgetGroupTitle;

        return new Promise(function (resolve, reject) {
            if (widgetId) {
                return resolve({ widgetId: widgetId, groupId: widgetGroupId });
            }

            addWidget(pageId, { title: title, type: type }).then(function (widget) {

                getPages(true);

                resolve({ widgetId: widget.id, groupId: null });
            }).catch(reject);
        });
    }
}

function getPages() {
    var noCache = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;

    return new Promise(function (resolve) {
        chrome.runtime.sendMessage({
            message: SM_MESSAGE_GET_PAGES,
            noCache: !!noCache
        }, function () {
            var pages = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];

            resolve(pages.filter(function (page) {
                return !page.is_archived;
            }));
        });
    });
}

function addBookmark(widgetId, _ref5) {
    var url = _ref5.url,
        title = _ref5.title,
        description = _ref5.description,
        groupId = _ref5.groupId,
        groupTitle = _ref5.groupTitle;

    return new Promise(function (resolve, reject) {
        fetch(Startme.apiURL('/widget/' + widgetId + '/item'), {
            method: 'post',
            credentials: 'include',
            body: Startme.formData({ url: url, title: title, description: description, groupId: groupId, groupTitle: groupTitle })
        }).then(function (response) {
            if (response.status != 201 /* Created */) reject();
            response.json().then(resolve).catch(reject);
        }).catch(reject);
    });
}

/**
 * Adds a widget to the given page
 * @param pageId
 * @returns {Promise}
 */
function addWidget(pageId, _ref6) {
    var title = _ref6.title,
        _ref6$type = _ref6.type,
        type = _ref6$type === undefined ? 'urllist' : _ref6$type,
        _ref6$column = _ref6.column,
        column = _ref6$column === undefined ? 0 : _ref6$column;

    return new Promise(function (resolve, reject) {
        fetch(Startme.apiURL('/page/' + pageId + '/widget'), {
            method: 'post',
            credentials: 'include',
            body: Startme.formData({ title: title, widget_type: type, column: column })
        }).then(function (response) {
            if (response.status != 201 /* Created */) reject();
            response.json().then(resolve).catch(reject);
        }).catch(reject);
    });
}

function closeOverlay() {
    window.close();
}
