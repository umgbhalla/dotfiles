//Copyright 2019 and Patent Pending. 2019-12-30 14:54:36
rightClickHandler = function(word) {
  log("Rightclick handler: " + JSON.stringify(word));
  var link = null;
  if (word.linkUrl) {
    link = word.linkUrl;
  } else {
    if (word.selectionText) {
      var links = findUrls(word.selectionText);
      if (links && links.length > 0) {
        link = links[0];
      }
    }
  }
  if (link != null) {
    getBitlyForContextMenu(link, "BR");
  } else {
    alert("Invalid link/data");
  }
};
chrome.contextMenus.create({title:"Bitly Short Link", contexts:["link", "selection"], onclick:rightClickHandler});

