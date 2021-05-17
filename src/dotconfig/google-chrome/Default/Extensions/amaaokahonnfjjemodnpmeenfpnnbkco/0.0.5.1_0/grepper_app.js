

/*
chrome.extension.sendMessage({
  "action":"getAllUserData",
}, function(user) {
    if(document.getElementById('grepper_user_id')){
        document.getElementById('grepper_user_id').value=user.grepper_user_id;
    }
    if(document.getElementById('grepper_register_chrome_grepper_id')){
        document.getElementById('grepper_register_chrome_grepper_id').value=user.userid;
    }
});

*/

//todo:put this in one spot
function getAllLanguages(){
var options={
         "abap":{"name":"Abap","enabled":0},
         "actionscript":{"name":"ActionScript","enabled":0},
         "assembly":{"name":"Assembly","enabled":0},
         "basic":{"name":"BASIC","enabled":0},
         "dart":{"name":"Dart","enabled":0},
         "clojure":{"name":"Clojure","enabled":0},
         "c":{"name":"C","enabled":1},
         "cobol":{"name":"Cobol","enabled":0},
         "cpp":{"name":"C++","enabled":1},
         "csharp":{"name":"C#","enabled":1},
         "css":{"name":"CSS","enabled":1},
         "delphi":{"name":"Delphi","enabled":0},
         "elixir":{"name":"Elixir","enabled":0},
         "erlang":{"name":"Erlang","enabled":0},
         "fortran":{"name":"Fortran","enabled":0},
         "fsharp":{"name":"F#","enabled":0},
         "go":{"name":"Go","enabled":0},
         "groovy":{"name":"Groovy","enabled":0},
         "haskell":{"name":"Haskell","enabled":0},
         "html":{"name":"Html","enabled":1},
         "java":{"name":"Java","enabled":1},
         "javascript":{"name":"Javascript","enabled":1},
         "julia":{"name":"Julia","enabled":0},
         "kotlin":{"name":"Kotlin","enabled":0},
         "lisp":{"name":"Lisp","enabled":0},
         "lua":{"name":"Lua","enabled":0},
         "matlab":{"name":"Matlab","enabled":0},
         "objectivec":{"name":"Objective-C","enabled":1},
         "pascal":{"name":"Pascal","enabled":0},
         "perl":{"name":"Perl","enabled":0},
         "php":{"name":"PHP","enabled":1},
         "postscript":{"name":"PostScript","enabled":0},
         "prolog":{"name":"Prolog","enabled":0},
         "python":{"name":"Python","enabled":1},
         "r":{"name":"R","enabled":0},
         "ruby":{"name":"Ruby","enabled":0},
         "rust":{"name":"Rust","enabled":0},
         "scala":{"name":"Scala","enabled":0},
         "scheme":{"name":"Scheme","enabled":0},
         "shell":{"name":"Shell/Bash","enabled":1},
         "smalltalk":{"name":"Smalltalk","enabled":0},
         "sql":{"name":"SQL","enabled":1},
         "swift":{"name":"Swift","enabled":1},
         "typescript":{"name":"TypeScript","enabled":1},
         "vb":{"name":"VBA","enabled":0},
         "webassembly":{"name":"WebAssembly","enabled":0},
         "whatever":{"name":"Whatever","enabled":1}
    };   
    return options;
}

document.addEventListener("grepper_user_languages_updated", function(e) {
     //chrome.storage.sync.get(['grepper_user_langs'], function(all_items) {
     // if(!all_items.grepper_user_langs){
     // }else{
     //     var items=all_items.grepper_user_langs;
     // }

        var items=getAllLanguages();
        for(var i = 0;i<e.detail.length;i++){
            items[e.detail[i].lkey].enabled=e.detail[i].isChecked;
        }
        //items=e.detail;//rest to what we got from web
        //reset
        chrome.storage.sync.set({grepper_user_langs:items }, function() {});
    //});
});

document.addEventListener("grepper_hide_button_updated", function(e) {
    chrome.storage.sync.set({hide_grepper_button: e.detail.hide_grepper_button}, function() {});
});


document.addEventListener("grepper_user_shortcut_key_updated", function(e) {
    chrome.storage.sync.set({shortcut_key: e.detail.shortcut_key}, function() {});
});

document.addEventListener("user_registered", function(e) {
  chrome.runtime.sendMessage({
    "action":"userRegistered",
    "user_data":e.detail
  });
});

function init(){
  if(document.getElementById('grepper_user_id')){
        document.getElementById('grepper_user_id').value=localStorage.getItem("user_id");
    }
    if(document.getElementById('grepper_register_chrome_grepper_id')){
        document.getElementById('grepper_register_chrome_grepper_id').value=localStorage.getItem("chrome_id");
    }

}


document.addEventListener("is_grepper_user_authed", function(e) {
   chrome.runtime.sendMessage({
      "action":"getAllUserData",
    }, function(user) {
    var event = new CustomEvent("is_grepper_user_authed_response", {"detail":user});
        document.dispatchEvent(event);
   });
});

function auth(){
    chrome.runtime.sendMessage({
      "action":"getAllUserData",
    }, function(user) {
        localStorage.setItem("email",user.email);
        localStorage.setItem("chrome_id",user.userid);
        localStorage.setItem("user_id",user.grepper_user_id);
        localStorage.setItem("access_token",user.access_token);
   });
}
auth();

document.addEventListener("DOMContentLoaded", function(){
    init();
});
