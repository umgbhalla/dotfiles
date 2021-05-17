var debug = false;
var backgroundPage = null;
var copiesChanged = false;

$(document).ready(function () {
    init();
    setPreference();
    selectListener();
    setTimeText();
});

function restoreAllBookmarks(number) {

    chrome.storage.local.get({
        localTree: []
    }, function (result) {
        var newTree = result.localTree;
        newTree.reverse();
        var storedTree = newTree[number].tree;

        if (storedTree != undefined)
            outsideLoop(storedTree[0].children);
    });
}

function outsideLoop(deeperTree) {
    for (var i in deeperTree) {
        (function (j) {
            var toolbarTree = deeperTree[j].children;

            if (toolbarTree != undefined)
                innerLoop(toolbarTree)
        })(i);
    }
}

function innerLoop(toolbarTree) {
    for (var i in toolbarTree) {
        if (toolbarTree[i] == undefined)
            continue;

        (function (j) {
            setTimeout(function () {
                setTimeout(function () {

                    chrome.bookmarks.create({
                        'title': toolbarTree[j].title,
                        'parentId': toolbarTree[j].parentId,
                        'index': toolbarTree[j].index,
                        'url': toolbarTree[j].url
                    }, function (newEntry) {
                        if (newEntry == undefined || newEntry.url != undefined)
                            return;

                        if (toolbarTree[j].children != undefined)
                            secondLoop(toolbarTree[j].children, newEntry);
                    });

                }, 200 * j);
            }, Math.min(100 * toolbarTree.length - 200, 1000));
        })(i);
    }
}

function secondLoop(toolbarTree, newEntry) {
    for (var i in toolbarTree) {
        if (toolbarTree[i] == undefined)
            continue;

        (function (j) {
            chrome.bookmarks.create({
                'title': toolbarTree[j].title,
                'parentId': newEntry.id,
                'index': toolbarTree[j].index,
                'url': toolbarTree[j].url
            }, function (newEntry) {
                //console.log(newEntry);
                if (newEntry == undefined || newEntry.url != undefined)
                    return;

                if (toolbarTree[j].children != undefined)
                secondLoop(toolbarTree[j].children, newEntry);
            });
        })(i);
    }
}

function removeAllBookmarks() {
    chrome.bookmarks.getTree(function (Tree) {
        if (Tree[0].length <= 0)
            return;

        for (var h in Tree[0].children) {
            (function (h) {
                var toolbarTree = Tree[0].children[h].children;
                for (var i in toolbarTree) {
                    (function (i) {
                        setTimeout(function () {
                            chrome.bookmarks.removeTree(toolbarTree[i].id);
                        }, 100 * i);
                    }(i));
                }
            })(h);
        }
    });
}

// Initialize options.
function init() {

    initializeTabs();

    $('#nextBackup').hide();

    $('#backupList').trigger('click');

    $('#backupList').click(function () {

        if (copiesChanged) {
            copiesChanged = false;
            location.reload();
        }

    });
}

// Initialize tabs
function initializeTabs() {
    $('ul.menu li:first').addClass('tabActive').show();
    $('#options > div').hide();
    $('#basics').show();

    $("ul.menu").on("click", "li", function () {
        $('ul.menu li').removeClass('tabActive');
        $(this).addClass('tabActive');
        $('#options > div').hide();

        // Fade in the correct DIV.
        var activeTab = $($(this).find('a').attr('href')).fadeIn();
        return false;
    });
}

/**
  * Attaches listeners for different types of inputs that change option values.
  */
function attachListeners() {
    // Checkboxes.
    $("#basics").on("change", "input[type=checkbox]", function (e) {
        var name = e.target.name;
        var value = translateOptionValue(name, e.target.checked);
        backgroundPage.saveOption(name, value);
    })

    // Radio buttons.
    .on("change", "input[type=radio]", function (e) {
        var name = e.target.name;
        var value = translateOptionValue(name, e.target.value);
        backgroundPage.saveOption(name, value);
    })

    // Select boxes.
    .on("change", "select", function (e) {
        backgroundPage.saveOption(e.target.name, e.target.value);
    })

    // Textfields.
    .on("keyup", "input[type=text]", function (e) {
        if (e.target.name === 'shortcutKeyCharacter') {
            option = 'shortcutKey';
        } else {
            option = e.target.name;
        }
        backgroundPage.saveOption(option, translateOptionValue(option, e.target.value));
    })

    $(window).resize(function (e) {
        Options.modal.resize();
    });

    $('.tipsy').tipsy({
        gravity: 's',
        live: true
    });
}

function translateOptionValue(name, value) {
    switch (name) {
        case 'sync': return (value === 'true') ? true : false;
        case 'shortcutKey': return $('[name=shortcutKey]').attr('value');
    }

    return value;
}

function selectListener() {

    var frequencySelect = document.getElementById("frequencySelect");
    var copiesSelect = document.getElementById("copiesSelect");

    chrome.storage.sync.get({
        frequency: "When Added",
        copies: 90
    }, function (result) {
        if (debug)
            console.log(result);
        frequencySelect.value = result.frequency;
        copiesSelect.value = parseInt(result.copies);
    });

    copiesSelect.onchange = function () {

        chrome.storage.sync.set({
            copies: parseInt(copiesSelect.value)
        }, function () {
            copiesChanged = true;
        });
    };

    frequencySelect.onchange = function () {

        switch (frequencySelect.value) {
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

        chrome.storage.sync.set({
            frequency: frequencySelect.value
        });

        $('#nextBackup').hide(500);
        setTimeText();

    };

}

function setTimeText() {

    chrome.alarms.get("backupBookmark", function (result) {
        if (debug)
            console.log(result);

        if (result && result.scheduledTime) {
            setTimeout(function () {
                $('#inputBackup').val(moment(result.scheduledTime).format('LLL'));
                $('#nextBackup').show(500);
            }, 100);
        }
    });

}

function setPreference() {
    chrome.storage.local.get({ localTree: [] }, function (result) {
        var newTree = result.localTree;
        newTree.reverse();

        if ($.isEmptyObject(newTree)) {
            firstTimeWrite();
            return;
        }

        chrome.storage.sync.get({
            copies: 90
        }, function (result) {
            if (debug)
                console.log(result);

            while (newTree.length > result.copies) {
                newTree.pop();
            }

            for (var i in newTree) {

                if (newTree[i].items == 0)
                    continue;

                var date = moment(newTree[i].date).format('LLL');
                insertNewRow(date, newTree[i].items, newTree[i].tree, i);
            }
        });
    });
}

function insertNewRow(date, item, tree, number) {
    var table = document.getElementById("tableBody");
    var row = table.insertRow();

    var cell1 = row.insertCell(0);
    var cell2 = row.insertCell(1);
    var cell3 = row.insertCell(2);
    var cell4 = row.insertCell(3);

    cell1.innerHTML = (table.rows.length).toString();
    cell2.innerHTML = date;
    cell3.innerHTML = item;

    var btn = document.createElement("BUTTON");
    var btn2 = document.createElement("BUTTON");
    var view = document.createTextNode("View");
    var restore = document.createTextNode("Restore");

    var blank = document.createTextNode(" ");

    btn.appendChild(view);
    btn2.appendChild(restore);

    btn.addEventListener("click", function () {
        openBookmarks(number);
    });

    btn2.addEventListener("click", function () {
        var r = confirm("Are you sure you want to continue?");
        if (r == true) {
            chrome.runtime.sendMessage({ status: "restoreStarting" },
            function (response) {
                if (response.toDo) {
                    removeAllBookmarks();
                    restoreAllBookmarks(number);
                }
            });

        }
    });

    cell4.appendChild(btn);
    cell4.appendChild(blank);
    cell4.appendChild(btn2);
}

function openBookmarks(number) {

    chrome.storage.sync.set({
        currentItem: number
    }, function () {
        chrome.tabs.create({ url: '../bookmarks/Bookmarks.html' });
    });
}

function firstTimeWrite() {
    chrome.bookmarks.getTree(function (Tree) {

        if (Tree[0].length <= 0)
            return;

        var date = new Date();
        var time = date.getTime();

        var text = JSON.stringify(tree);
        var number = text.split("url").length - 1;

        chrome.storage.local.get({ localTree: [] }, function (result) {

            var newTree = result.localTree;
            newTree.push({ "date": time, "items": number, "tree": Tree });
            chrome.storage.local.set({ localTree: newTree }, function () {
                location.reload();
            });
        });
    });
}
