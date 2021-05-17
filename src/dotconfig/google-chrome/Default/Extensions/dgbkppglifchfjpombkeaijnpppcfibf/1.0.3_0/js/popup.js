let brwsr;
let isFirefox = false;
try {
	if(browser){
		brwsr = browser;
		isFirefox = true;
	} else {
		brwsr = chrome;
	}
} catch (error) {
	brwsr = chrome;
}

let currentTab = null,
	foldersWithCurrentTab = [],
	quickStartFolderId = window.localStorage.quickStartFolderId,
	quickStart = null,
	star = null,
	remove = null,
	quickStartBookmark = null,
	tree = null,
	maximizedFolder = ['0', '1'],
	maximizedStorageKeyName = 'popupTreeMaximizedFolders';

document.addEventListener("DOMContentLoaded", function () {
	star = document.getElementById('star');
	quickStart = document.getElementById('quickstart');
	remove = document.getElementById('remove');
	tree = document.getElementById('tree');

	quickStart.onclick = function () {
		if(currentTab && quickStartFolderId){
			if(foldersWithCurrentTab.indexOf(quickStartFolderId) === -1){
				brwsr.bookmarks.create({
					title: currentTab.title,
					url: currentTab.url,
					parentId: quickStartFolderId
				}, function (bookmark) {
					if(brwsr.runtime.lastError){
						console.log(brwsr.runtime.lastError.message);
					} else {
						foldersWithCurrentTab.push(bookmark.parentId);
						quickStart.classList.add('quick-start-highlight');
						brwsr.browserAction.setIcon({tabId: currentTab.id, path: 'icon/48.png'});
					}
				});
			} else {
				brwsr.bookmarks.search({url: currentTab.url}, function (bms) {
					for(let i = 0; i < bms.length; i++){
						if(bms[i].parentId === quickStartFolderId){
							brwsr.bookmarks.remove(bms[i].id, function () {
								if(brwsr.runtime.lastError){
									console.log(brwsr.runtime.lastError.message);
								} else {
									foldersWithCurrentTab.splice(foldersWithCurrentTab.indexOf(quickStartFolderId), 1);
									quickStart.classList.remove('quick-start-highlight');
									brwsr.browserAction.setIcon({tabId: currentTab.id, path: 'icon/96gray.png'});
								}
							})
						}
					}
				});
			}
		}
	};

	brwsr.tabs.query({currentWindow: true, active: true}, function(tabs){
		if(!brwsr.runtime.lastError && tabs.length){
			let tab = tabs[0];
			currentTab = tabs[0];
			if(quickStartFolderId){
				brwsr.bookmarks.search({url: tab.url}, function (bms) {
					for(let i = 0; i < bms.length; i++){
						foldersWithCurrentTab.push(bms[i].parentId);
						if(bms[i].parentId === quickStartFolderId){
							quickStart.classList.add('quick-start-highlight');
						}
					}
					initTree();
				});
			} else {
				console.log('Quick start folder not found');
			}
		}
	});
});

function initTree() {
	if(window.localStorage.hasOwnProperty(maximizedStorageKeyName)){
		maximizedFolder = JSON.parse(window.localStorage[maximizedStorageKeyName]);
	}
	if(window.localStorage.hasOwnProperty('cachedTree')){
		let bookmarks = JSON.parse(window.localStorage['cachedTree']);
		bookmarks[0].title = 'My bookmarks';
		genTree(bookmarks[0], tree);
	} else {
		brwsr.bookmarks.getTree(function (bookmarks) {
			bookmarks[0].title = 'My bookmarks';
			genTree(bookmarks[0], tree);
		});
	}
}

function genTree(bookmark, parentElm) {
	if(!bookmark.hasOwnProperty('url') && bookmark.id !== quickStartFolderId){
		let item = document.createElement('div');
		
		let folder = document.createElement('div');
		folder.classList.add('tree-folder');
		if(foldersWithCurrentTab.indexOf(bookmark.id) !== -1){
			folder.classList.add('tree-folder-highlight');
		}
		item.appendChild(folder);

		let arrow = document.createElement('div');
		folder.appendChild(arrow);
		if(maximizedFolder.indexOf(bookmark.id) > -1){
			folder.classList.add('tree-folder-maximized');
		}
		if(bookmark.hasOwnProperty('children') && bookmark.children.length){
			arrow.classList.add('tree-folder-arrow');
			arrow.addEventListener('click', function (e) {
				openFolder(folder, bookmark, maximizedFolder);
			});
		} else {
			arrow.classList.add('tree-folder-arrow-hidden');
		}

		let icon = document.createElement('div');
		icon.classList.add('tree-folder-icon');
		icon.setAttribute('title', 'Add/Remove Bookmark');
		icon.addEventListener('click', function () {
			if(foldersWithCurrentTab.indexOf(bookmark.id) === -1){
				brwsr.bookmarks.create({
					title: currentTab.title,
					url: currentTab.url,
					parentId: bookmark.id
				}, function (bookmark) {
					if(brwsr.runtime.lastError){
						console.log(brwsr.runtime.lastError.message);
					} else {
						foldersWithCurrentTab.push(bookmark.parentId);
						folder.classList.add('tree-folder-highlight');
					}
				})
			} else {
				brwsr.bookmarks.search({url: currentTab.url}, function (bms) {
					for(let i=0; i<bms.length; i++){
						if(bms[i].parentId === bookmark.id){
							brwsr.bookmarks.remove(bms[i].id, function () {
								if(brwsr.runtime.lastError){
									console.log(brwsr.runtime.lastError.message);
								} else {
									foldersWithCurrentTab.splice(foldersWithCurrentTab.indexOf(bookmark.id), 1);
									folder.classList.remove('tree-folder-highlight');
								}
							})
						}
					}
				}); // TODO double
			}
		});
		folder.appendChild(icon);

		let title = document.createElement('div');
		title.classList.add('tree-folder-title');
		title.textContent = bookmark.title;
		title.addEventListener('click', function (e) {
			openFolder(folder, bookmark, maximizedFolder);
		});
		folder.appendChild(title);

		if(bookmark.hasOwnProperty('children') && bookmark.children.length){
			let children = document.createElement('div');
			children.classList.add('tree-children');
			if(maximizedFolder.indexOf(bookmark.id) === -1){
				children.classList.add('hide');
			}
			item.appendChild(children);
			for(let i=0; i < bookmark.children.length; i++){
				genTree(bookmark.children[i], children);
			}
		}
		parentElm.appendChild(item);
	}
}

function openFolder(elm, bookmark, state) {
	if(bookmark.hasOwnProperty('children')){
		let folderChildren = elm.parentElement.querySelector('.tree-children');
		if(folderChildren){
			folderChildren.classList.toggle('hide');
		}
		if(state.indexOf(bookmark.id) === -1){
			state.push(bookmark.id);
			elm.classList.add('tree-folder-maximized');
		} else {
			state.splice(state.indexOf(bookmark.id), 1);
			elm.classList.remove('tree-folder-maximized');
		}
		window.localStorage[maximizedStorageKeyName] = JSON.stringify(state);
	}
}