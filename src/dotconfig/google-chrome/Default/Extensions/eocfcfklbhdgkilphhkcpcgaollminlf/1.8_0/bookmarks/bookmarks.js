var debug = false;
var number = 0;

document.addEventListener('DOMContentLoaded', function () {
    dumpBookmarks();
});

function dumpBookmarks() {

    chrome.storage.sync.get({
        currentItem: 0
    }, function (result) {

        var number = result.currentItem;

        chrome.storage.local.get({
            localTree: []
        }, function (result) {

            var newTree = result.localTree;
            newTree.reverse();
            $('#bookmarks').append(dumpTreeNodes(newTree[number].tree));

            console.log(dumpTreeNodes(newTree[number].tree));
        });
    });
}

function dumpTreeNodes(bookmarkNodes) {
    var list = $('<ul>');
    var i;
    for (i = 0; i < bookmarkNodes.length; i++) {
        list.append(dumpNode(bookmarkNodes[i]));
    }
    return list;
}

function dumpNode(bookmarkNode) {
    if (bookmarkNode.title) {
        var anchor = $('<a>');
        anchor.attr('href', bookmarkNode.url);
        anchor.text(bookmarkNode.title);

        var span = $('<span>');
        var options = bookmarkNode.children ?
          $('<span>[<a href="#" id="addlink">Add</a>]</span>') :
          $('<span>[<a id="editlink" href="#">Edit</a> <a id="deletelink" ' +
            'href="#">Delete</a>]</span>');
        var edit = bookmarkNode.children ? $('<table><tr><td>Name</td><td>' +
          '<input id="title"></td></tr><tr><td>URL</td><td><input id="url">' +
          '</td></tr></table>') : $('<input>');
        span.append(anchor);
    }
    var li = $(bookmarkNode.title ? '<li>' : '<div>').append(span);
    if (bookmarkNode.children && bookmarkNode.children.length > 0) {
        li.append(dumpTreeNodes(bookmarkNode.children));
    }
    return li;
}