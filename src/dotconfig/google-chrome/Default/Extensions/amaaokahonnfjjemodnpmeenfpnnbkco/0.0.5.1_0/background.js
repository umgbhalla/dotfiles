

//var user={};
//todo: determine when these gusy reload
/*
var history={};
    history.searches=[];
    history.results_clicked=[];

var cached_pages = [];
*/
//var lastSearchResultClicked = false;//{}
var isFirefox=false;

var lastSearch = {
      "action":"resultSearchAction",
      "search":"",
      "search_time": new Date().getTime(),
      "fallback":1,
      "results":[]
};




//this basically runs once
//  chrome.identity.getProfileUserInfo(function(info) { 
//      if(info.email){
//          user = info;
//      }else{
//          getChromeUserId().then(function(data){
//              user.email=data;    
//          });
//      }
//  });
/*
    function getHistoryIndex(s,stime){
        for(var i=0;i<history.searches.length;i++){
            if( history.searches[i].search === s &&
                history.searches[i].search_time === stime){
                    return i; 
                }
            
        }
        return false;
    }
    */

    function removeProtocal(s){
        s= ltrim(s,"https://");    
        s= ltrim(s,"http://");    
    }

    //basically we just use the most recent search
    //assuming that was less than 10 seconds ago
    //what if it was greater than 10?
    function getAssociatedSearch(url){

      return lastSearch;//super simple, just is always last search
      //return lastSearchResultClicked;//super simple, just is always last search

//   var ctd = new Date();
//   var ct = ctd.getTime();
//   if(history.results_clicked.length < 1 ){
//       return false;
//   }

//   //so we basically just look at the last result clicked
//   //and use that, if their are multiple tabs open we assume
//   //that it was the last clicked result 

//   //Because we don't try to pass the url originally clicked we should just always be able to look at last result
//    var lastClickedResult= history.results_clicked[history.results_clicked.length-1];
//    var tDiff= ct - lastClickedResult.click_time;

//    //give 15 seconds to load the page (tay don't change unless you are in smart mode)
//    if(tDiff < 15000){
//      cached_pages[url] = history.searches[lastClickedResult.history_search_index];
//      return history.searches[lastClickedResult.history_search_index];
//    }else{
//        if(cached_pages[url]){
//            return cached_pages[url];
//        }
//        return false;    
//    }

//   //why not just look at the time of the last results clicked and when this page loaded.
//   //It will pry be within 1-2 seconds right?
//   //

//    /*
//  for (var i = history.searches.length - 1; i >= 0; --i) {
//      for (var j = history.searches[i].results_clicked.length - 1; j >= 0; --j) {
//          var tDiff= ct - history.searches[i].results_clicked[j].click_time;
//          //less that 9 seconds,that is us
//          if(tDiff < 10000){
//              return history.searches[i];    
//          }
//      }
//  }
//  */
//   //   return false;

    }


//  function getCodeSearch(url){
//      var codeSearches=[];
//      for(var i=0;i<history.searches.length;i++){
//          for(var t=0;t<history.searches[i].results.length;t++){

//          // "http://stackoverflow.com/questions/19544452/remove-last-item-from-array"
//          // "https://stackoverflow.com/questions/19544452/remove-last-item-from-array"
//          // "https://www.stackoverflow.com/questions/19544452/remove-last-item-from-array"
//          // "http://www.stackoverflow.com/questions/19544452/remove-last-item-from-array"
//              if(removeProtocal(url) === removeProtocal(history.searches[i].results[t])){
//                  //if we have the same code
//                  codeSearches.push({
//                      search:history.searches[i].search,
//                      search_time:history.searches[i].search_time,
//                      results:history.searches[i].results
//                  });   
//              }
//          }
//      }
//      return codeSearches;
//  }

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {

    

      if (request.action == "runContentScript"){
        chrome.tabs.executeScript(sender.tab.id,{
          file:request.file 
        }, function() {
          sendResponse({ done: true });
        });
        return true; 
     }

     if(request.action === "getUserID" ){
        getGrepperUserId().then(function(id){
            sendResponse({user_id: id});
        });
     }
   if(request.action === "getAllUserData" ){
     
     chrome.storage.sync.get([ 'grepper_user_id','userid', 'access_token', 'email','notices','shortcut_key'], function(items){
          sendResponse(items);
      });
     return true;
   }

    //set everything not just emial
   if(request.action ==="userRegistered"){

    setUserData(
        request.user_data.email,
        request.user_data.user_id,
        request.user_data.access_token,
        request.user_data.email,
        request.user_data.blacklists,
        request.user_data.hide_grepper_button,
        request.user_data.shortcut_key
    );

//  chrome.storage.sync.set({access_token:request.user_data.access_token}, function() {});
//  chrome.storage.sync.set({email:request.user_data.email}, function() {});
   }
   
// if(request.action ==="pushHistorySearch"){
//     history.searches.push({
//          search:request.search,    
//          search_time:request.search_time,
//          results:request.results
//     });

// }

   if(request.action ==="resultSearchAction"){
       lastSearch = request;
   }
// if(request.action ==="resultClickAction"){

//      lastSearchResultClicked = request;

//  /*
//     var historyIndex=getHistoryIndex(
//     request.search,
//     request.search_time);

//     if(historyIndex !== false){
//          history.results_clicked.push({
//              click_time:request.click_time,
//              element_url:request.url,
//              history_search_index:historyIndex
//         });
//     }
//  */
// }
   if(request.action ==="answerCopied"){

   }
   if(request.action ==="getAssociatedSearch"){
      sendResponse(getAssociatedSearch(request.url));
   }

   if(request.action ==="reset_notifications"){
       reset_notifications();
   }
});

// Check whether new version is installed
//todo: verify this run on update not just install
//we always want to hit that install so we can
//set the correct user
chrome.runtime.onInstalled.addListener(function(details){
//  setTimeout(function(){
    runOnInstallHook(details);
//  } ,5000);
});

function openWelcomePage(details,newUserData){
        if(newUserData.yearly_subscription_enabled && !newUserData.subscription_started_on){
         chrome.tabs.create({url: "https://www.codegrepper.com/checkout/checkout.php"}, function (tab) { });
         }else if(details.reason ==='install'){
         chrome.tabs.create({url: "https://www.codegrepper.com/welcome.php"}, function (tab) { });
        }
}


//IF a user uninstalls/reinstall any they are not logged in
//They loose there data
//That is just the way it is
function runOnInstallHook(details){
    //todo: run on update too
  if(details.reason == "install" || details.reason == "update"){
        chrome.identity.getProfileUserInfo(function(info) { 
           if(info.email){
                makeRequest('GET', "https://www.codegrepper.com/api/install2.php?is_email=1&u="+info.email).then(function(data){
                    var newUserData=JSON.parse(data);
                    setUserData(info.email,newUserData.id,newUserData.access_token,info.email,newUserData.blacklists,newUserData.hide_grepper_button,newUserData.shortcut_key);
                    openWelcomePage(details,newUserData);

                }.bind(this));
            }else{
                //if we can't get the user eamil
                getChromeUserId().then(function(data){
                    makeRequest('GET', "https://www.codegrepper.com/api/install2.php?u="+data).then(function(newData){
                    var newUserData=JSON.parse(newData);
                        setUserData(data,newUserData.id,undefined,undefined,newUserData.blacklists,newUserData.hide_grepper_button,newUserData.shortcut_key);
                        openWelcomePage(details,newUserData);
                    });
                });
            }
        });
    }
}
//  setTimeout(function(){
//     var k={};
//      k.details="install";
//        runOnInstallHook(k);
//  },5000);

 function setUserData(chromeUserID,grepperUserID,access_token,email,blacklists,hide_grepper_button,shortcut_key){
    chrome.storage.sync.set({userid: chromeUserID}, function() {});
    chrome.storage.sync.set({grepper_user_id: grepperUserID}, function() {});

    chrome.runtime.setUninstallURL("https://www.codegrepper.com/survey.php?gid="+grepperUserID+"&cid="+chromeUserID);

    if(typeof hide_grepper_button !== 'undefined'){
        chrome.storage.sync.set({hide_grepper_button: hide_grepper_button}, function() {});
    }
    if(typeof blacklists !== 'undefined'){
          chrome.storage.sync.set({grepper_blacklists: blacklists}, function() {});
    }
    if(typeof access_token !== 'undefined'){
        chrome.storage.sync.set({access_token: access_token}, function() {});
    }
    if(typeof email !== 'undefined'){
        chrome.storage.sync.set({email: email}, function() {});
    }
    if(typeof shortcut_key !== 'undefined'){
        chrome.storage.sync.set({shortcut_key: shortcut_key}, function() {});
    }
}


function getGrepperUserId(){
  return new Promise(function (resolve, reject) {
    chrome.storage.sync.get('grepper_user_id', function(items){
        var user_id = items.grepper_user_id;
        resolve(user_id);
    });
  });
}
//get old user id or create a new one
function getChromeUserId(){
  return new Promise(function (resolve, reject) {
    chrome.storage.sync.get('userid', function(items){
            var user_id = false;
            if(items){
                var user_id = items.userid;
            }
        if (!user_id) {
            var newUserId=getRandomToken();
            chrome.storage.sync.set({userid: newUserId}, function() {});
            resolve(newUserId);
        }else{
            resolve(user_id);
        }
    });
  });
}

function getRandomToken() {
    // E.g. 8 * 32 = 256 bits token
    var randomPool = new Uint8Array(32);
    crypto.getRandomValues(randomPool);
    var hex = '';
    for (var i = 0; i < randomPool.length; ++i) {
        hex += randomPool[i].toString(16);
    }
    // E.g. db18458e2782b2b77e36769c569e263a53885a9944dd0a861e5064eac16f1a
    return hex;
}

/*
chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
 // console.log(sender.tab ?
 //             "from a content script:" + sender.tab.url :
 //             "from the extension");
 // if (request.greeting == "hello")
 //   sendResponse({farewell: "goodbye"});

 if(request.action == "get_answers"){
    var tabId=sender.tab.id;
    var tabR=tabs.get(tabId); 

    sendResponse({answers:tabR.answers,search:tabR.search});
   // sendResponse({answers:false,search:"whaterver"});
 }

});


chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab){
var endpoint="https://www.commando.com";

if(changeInfo.status === "complete" && (tab.url.indexOf("https://www.google.com/search") === 0)){
    var d=new Date();
    console.log("completed at:");
    console.log(d.getTime());
    var tabR=tabs.get(tabId); 
    tabs.set(tabId,{loading:false,answers:tabR.answers,search:tabR.search});
    sendAnswersIfReady(tabId);
}

if(changeInfo.status === "loading" && (tab.url.indexOf("https://www.google.com/search") === 0)){


var d=new Date(); console.log("starting to load in background"); console.log(d.getTime());

        var s=getParameterByName("q",tab.url);
        tabs.set(tabId,{loading:true,answers:false,search:s});

        makeRequest('GET', endpoint+"/index.php?s="+s).then(function(data){
              var results=JSON.parse(data);
              var answers=false;
              if(results.answers.length > 0){
                 answers=results.answers;
              }
                var tabR=tabs.get(tabId);
                tabs.set(tabId,{loding:tabR.loading,answers:answers,search:tabR.search});
                sendAnswersIfReady(tabId);
        });
}



});

function sendAnswersIfReady(tabId){
    var tabR= tabs.get(tabId);
    console.log(tabR);
    if(tabR.loading === false && tabR.answers !==false){
          chrome.tabs.sendMessage(tabId,{ message:"answers_loaded", search:tabR.search,answers:tabR.answers});
          //we need to clear out the the answers here after we sent
    }
}


function getParameterByName(name, url) {
    if (!url) url = window.location.href;
    name = name.replace(/[\[\]]/g, '\\$&');
    var regex = new RegExp('[?&]' + name + '(=([^&#]*)|&|#|$)'),
        results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, ' '));
}

*/
function makeRequest (method, url, data, id, token) {
  return new Promise(function (resolve, reject) {
    var xhr = new XMLHttpRequest();
    xhr.open(method, url);

    if(typeof id !=='undefined'){
        xhr.setRequestHeader("x-auth-id", id);   
    }
    if(typeof token !=='undefined'){
        xhr.setRequestHeader("x-auth-token", token);   
    }

    xhr.onload = function () {
      if (this.status >= 200 && this.status < 300) {
        resolve(xhr.response);
      } else {
        reject({
          status: this.status,
          statusText: xhr.statusText
        });
      }
    };
    xhr.onerror = function () {
      reject({
        status: this.status,
        statusText: xhr.statusText
      });
    };
    if(method=="POST" && data){
        xhr.send(data);
    }else{
        xhr.send();
    }
  });
}


function reset_notifications(){
    chrome.browserAction.setBadgeText({text:""});
    chrome.storage.sync.set({notices:[]}, function() {});
}

function check_user_notifications(){
        chrome.storage.sync.get([ 'grepper_user_id','userid', 'access_token', 'email', ], function(items){
            if(items.access_token && items.grepper_user_id) {
             makeRequest('GET', "https://www.codegrepper.com/api/get_user_notifications.php",{},items.grepper_user_id,items.access_token).then(function(data){
                    var notices=JSON.parse(data);


                    if(notices.length){
                        chrome.browserAction.setBadgeText({text:""+notices.length});
                        chrome.browserAction.setBadgeBackgroundColor({color:"#f24141"});
                        chrome.storage.sync.set({notices: notices}, function() {});
                    }else{
                       reset_notifications();    
                    }
                });
            }else{
                      reset_notifications();    
            }
      });
    
}

chrome.alarms.create('check_user_notifications', { periodInMinutes: 180});
chrome.alarms.onAlarm.addListener(function(alarm){
    if(alarm.name=="check_user_notifications"){
       check_user_notifications(); 
    }
});
