let brwsr;
let quickStarFolderId = window.localStorage.quickStartFolderId;

try {
	brwsr = browser || chrome;
} catch (error) {
	brwsr = chrome;
}

// Browser action icon
brwsr.tabs.onUpdated.addListener(function (tabId, info, tab) {
	if(info.status === 'complete' && quickStarFolderId){
		brwsr.bookmarks.search({url: tab.url}, function (bms) {
			for(let i = 0; i < bms.length; i++){
				if(bms[i].parentId === quickStarFolderId){
					brwsr.browserAction.setIcon({tabId: tab.id, path: 'icon/48.png'});
				}
			}
		});
	}
});

// Folders tree cache
brwsr.runtime.onInstalled.addListener(function (details) {
	if(details.reason === 'install'){
		brwsr.tabs.create({url: 'chrome://newtab/'}, function () {
			if(brwsr.runtime.lastError){
				console.log(brwsr.runtime.lastError.message);
			}
		});
	}
	// if(details.reason === 'update'){
	// 	let version = details.previousVersion.split('.');
	// 	version = version[1] + version[2] + (version[3] || '0');
	// }
	rebuildCache();
});
brwsr.bookmarks.onChildrenReordered.addListener(function (id, reorderInfo) {
	rebuildCache();
});
brwsr.bookmarks.onMoved.addListener(function (id, moveInfo) {
	rebuildCache();
});
brwsr.bookmarks.onCreated.addListener(function (id, bookmark) {
	rebuildCache();
});
brwsr.bookmarks.onRemoved.addListener(function (id, removeInfo) {
	rebuildCache();
});
brwsr.bookmarks.onChanged.addListener(function (id, changeInfo) {
	rebuildCache();
});
brwsr.bookmarks.onImportBegan.addListener(function () {
	rebuildCache();
});

// Build bookmarks folders tree cache
let bookmarks = [],
	saveTimeout,
	rebuildTimeout;

function rebuildCache() {
	window.clearTimeout(rebuildTimeout);
	rebuildTimeout = window.setTimeout(function () {
		bookmarks = [];
		brwsr.bookmarks.getTree(function (tree) {
			buildFoldersTree(tree[0]);
		});
	}, 500);
}
function buildFoldersTree(bookmark, parent) {
	if(!bookmark.hasOwnProperty('url')){
		let newBookmark = {
			title: bookmark.title,
			id: bookmark.id,
			index: bookmark.index,
			parentId: bookmark.parentId,
			dateAdded: bookmark.dateAdded,
			dateGroupModified: bookmark.dateGroupModified,
			children: []
		};
		if(!parent){
			bookmarks.push(newBookmark);
		} else {
			parent.push(newBookmark);
		}
		saveFoldersTree();
		for(let i = 0; i < bookmark.children.length; i++){
			buildFoldersTree(bookmark.children[i], newBookmark.children);
		}
	}
}
function saveFoldersTree() {
	window.clearTimeout(saveTimeout);
	saveTimeout = window.setTimeout(function () {
		window.localStorage.cachedTree = JSON.stringify(bookmarks);
		window.localStorage.cacheUpd = new Date();
	}, 300);
}