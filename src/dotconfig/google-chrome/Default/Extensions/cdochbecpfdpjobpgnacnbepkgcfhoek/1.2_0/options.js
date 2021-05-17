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

// Saves options to localStorage.
function save_options() {
  var select = document.getElementById("key");
  var key = select.children[select.selectedIndex].value;
  localStorage["browser_action"] = key;

  // Update status to let user know options were saved.
  var status = document.getElementById("status");
  status.innerHTML = "Options Saved.";
  setTimeout(function() {
    status.innerHTML = "";
  }, 750);
  
  restoreOptions();
}

// Restores select box state to saved value from localStorage.
function restore_options() {
  var action = localStorage["browser_action"];
  if (!action) {
    action = "tab_scissor_cut";
  }
  var select = document.getElementById("key");
  for (var i = 0; i < select.children.length; i++) {
    var child = select.children[i];
    if (child.value == action) {
      child.selected = "true";
      break;
    }
  }
}
document.addEventListener('DOMContentLoaded', restore_options);
document.querySelector('#save').addEventListener('click', save_options);