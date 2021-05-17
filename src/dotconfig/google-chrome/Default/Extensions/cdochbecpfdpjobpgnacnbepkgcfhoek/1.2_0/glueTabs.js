function TabGlue(){
	this.currentWindow = null;
	this.currentWindowId = null;
	this.tabCount = 0;
	this.glueMinimized = false;
	this.selectedTabId = null;
}
var tgp = TabGlue.prototype;

tgp.start= function(tab) {
	//restore_options();
	chrome.windows.getCurrent(TabGlue.prototype.getWindows);
};

TabGlue.prototype.storeSelected= function (selected){
	this.selectedTabId = selected.id;
};

TabGlue.prototype.getTabs=function (tabs) {
	this.tabCount = tabs.length;
	// We require all the tab information to be populated.
	chrome.windows.getAll({"populate" : true}, TabGlue.prototype.moveTabs);
};

tgp.getWindows=function (win) {
	this.currentWindow = win;
	this.currentWindowId = win.id;
	chrome.tabs.getSelected(this.currentWindowId, TabGlue.prototype.storeSelected)
	chrome.tabs.getAllInWindow(this.currentWindow.id, TabGlue.prototype.getTabs);
};

tgp.sortWindows = function (a, b){
	//sort by horizontal center.
	if(a.left + (a.width / 2) > b.left + (b.width /2)){
		return 1;
	} else {
		return -1;
	}
};
tgp.moveTabs=function (windows) {
	//iterate backwards to avoid skipping elements after removals.
	for(var i = windows.length - 1; i>= 0; i--){
		//remove windows that should not be merged.
		if(windows[i].type != "normal" || (tabGlue.glueMinimized==false && windows[i].state == "minimized"))
			windows.splice(i, 1);
	}
	windows.sort(TabGlue.prototype.sortWindows);
	
	var numWindows = windows.length;
	
	var nTargetWindow = windows[0];
	var nTop = nTargetWindow.top;
	var nLeft = nTargetWindow.left;
	var nRight = nTargetWindow.width + nLeft;
	var nBottom = nTargetWindow.height + nTop;
	var tabPosition = nTargetWindow.tabs.length;
	for (var i = 0; i < numWindows; i++) {
		var win = windows[i];
		if(win.id != nTargetWindow.id){
			if(win.top < nTop){
				nTop = Math.max(0, win.top);
			}
			if(win.left < nLeft){
				nLeft = win.left;
			}
			if(win.height + win.top > nBottom){
				nBottom = win.height + win.top;
			}
			if(win.width + win.left > nRight ){
				nRight = win.width + win.left;
			}
			var numTabs = win.tabs.length;
			for (var j = 0; j < numTabs; j++) {
				var tab = win.tabs[j];
				
				// Move the tab into the window is furthest to the left and not minimized?
				chrome.tabs.move(tab.id, 
				{"windowId": nTargetWindow.id, "index": tabPosition});
				
				tabPosition++;
			}
		}
	}
	//	Set the selected tab to tab that was selected
	//	in the window where call initiated.
	if(this.selectedTabId != null){
		chrome.tabs.update(this.selectedTabId, {"selected":true});
	}
	//resize the result window to include all the other windows' space.
	var nWidth = nRight - nLeft;
	var nHeight = nBottom - nTop;
	var windResizeObj = {"left": nLeft, "top":nTop, "width" : nWidth, "height": nHeight, "focused":true}; 
	chrome.windows.update(nTargetWindow.id, windResizeObj);
};
var tabGlue = new TabGlue();
function tabGlueAction(){
	tabGlue.glueMinimized = false;
	tabGlue.start();
}
function tabGlueAllAction(){
	tabGlue.glueMinimized = true;
	tabGlue.start();
}
function restoreOptions() {
	browserAction = localStorage["browser_action"];
	
	if(browserAction == "tab_glue"){
		chrome.browserAction.setTitle({title:"Glue tabs"})
		chrome.browserAction.setIcon({path:"glueIcon.png"});
	} else if (browserAction == "tab_glue_all"){
		chrome.browserAction.setTitle({title:"Glue all tabs"})
		chrome.browserAction.setIcon({path:"glueIcon.png"});
	} else if (browserAction == "tab_scissor_cut"){
		chrome.browserAction.setTitle({title:"Split at selected tab"})
		chrome.browserAction.setIcon({path:"icon10.png"});
	} else {
		chrome.browserAction.setTitle({title:"Split at selected tab"})
		chrome.browserAction.setIcon({path:"icon10.png"});
	}
	//TODO: create an option for always making the window fullscreen size
};
restoreOptions();
function browserActionHandler(){
	browserAction = localStorage["browser_action"];
	if(browserAction == "tab_glue"){
		tabGlueAction();
	} else if (browserAction == "tab_glue_all"){
		tabGlueAllAction();
	} else if (browserAction == "tab_scissor_cut"){
		start();
	} else {
		start();
	}
}
chrome.browserAction.onClicked.addListener(browserActionHandler);
// Set up a handler so that we can merge all the windows.
chrome.commands.onCommand.addListener(function(command) {
	  console.log('Command:', command);
	  if(command == "tab_glue"){
		tabGlueAction();
	  } else if (command == "tab_glue_all"){
		tabGlueAllAction();
	  } else if (command == "tab_scissor_cut"){
		start();
	  }
	});
//chrome.browserAction.setIcon({path:"glueIcon.png"});
//chrome.browserAction.onClicked.addListener(start);
