var prod_url = "https://www.codegrepper.com/app/";
var prod_url_web = "https://www.codegrepper.com/";
var prod_api = "https://www.codegrepper.com/api";

var registerWindow=false;
var activateWindow=false;
var dontLoad = false;
var hideIcons = false;
var currentURL;
var currentTab;


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
function showBlacklistButtons(user){
    chrome.tabs.query({ active: true, currentWindow: true },function(tabs){
            currentTab = tabs[0];
            currentURL = currentTab.url;
        var b = document.createElement('a'); 
        b.href = currentURL;
        var currentHost = b.hostname;

    //don't show blacklist on google
    if(currentURL.indexOf("https://www.google.com") === 0){
        return;
    }

    chrome.storage.sync.get(['grepper_blacklists','hide_grepper_button'], function(all_items) {

        var blacklists = Array.isArray(all_items.grepper_blacklists) ? all_items.grepper_blacklists : []; 

        if(all_items.hide_grepper_button){
            hideIcons=true;
        }
        for(var i = 0;i<blacklists.length;i++){
            if (blacklists[i].blacklist_type === 1){
                  var a = document.createElement('a'); a.href = blacklists[i].url;
                    if(currentHost === a.hostname){ dontLoad = true; }
            }else if (blacklists[i].blacklist_type === 2){
                 var a = document.createElement('a'); a.href = blacklists[i].url;
                    if(currentHost === a.hostname){ hideIcons = true; }
            } else if (blacklists[i].blacklist_type === 3){
                  var a = document.createElement('a'); a.href = blacklists[i].url;
                    if(currentHost === a.hostname){ dontLoad = false; }
            }else if (blacklists[i].blacklist_type === 4){
                 var a = document.createElement('a'); a.href = blacklists[i].url;
                    if(currentHost === a.hostname){ hideIcons = false; }
            } else if (blacklists[i].blacklist_type === 5){
                    if(blacklists[i].url === currentURL){ dontLoad=true; }
            } else if (blacklists[i].blacklist_type === 6){
                 if(blacklists[i].url === currentURL){ hideIcons=true; }
            } else  if (blacklists[i].blacklist_type === 7){
                    if(blacklists[i].url === currentURL){ dontLoad=false; }
            } else if (blacklists[i].blacklist_type === 8){
                 if(blacklists[i].url === currentURL){ hideIcons=false; }
            }
        }

if(hideIcons){
 var taysPopupBlacklistHideShow = document.createElement("img");
     taysPopupBlacklistHideShow.classList.add("tays_popup_hide_grepper_button")
     taysPopupBlacklistHideShow.src="data:image/png;base64,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";
     //taysPopupBlacklist.title="Don't load Grepper on this domain (right click for this page only)";
     taysPopupBlacklistHideShow.title="Show Grepper buttons on this domain (right click for this page only)";

     taysPopupBlacklistHideShow.addEventListener('contextmenu', function(ev) {
            blackList(user,currentURL,8); ev.preventDefault(); return;
     });
     taysPopupBlacklistHideShow.addEventListener('click',function(e){
            blackList(user,currentURL,4);
     });

}else{
 var taysPopupBlacklistHideShow = document.createElement("img");
     taysPopupBlacklistHideShow.classList.add("tays_popup_hide_grepper_button")
     taysPopupBlacklistHideShow.src="data:image/png;base64,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";
     taysPopupBlacklistHideShow.title="Hide Grepper buttons on this domain (right click for this page only)";

     taysPopupBlacklistHideShow.addEventListener('contextmenu', function(ev) {
            blackList(user,currentURL,6); ev.preventDefault(); return;
     });
     taysPopupBlacklistHideShow.addEventListener('click',function(e){
            blackList(user,currentURL,2);
     });
}

if(dontLoad){
      var taysPopupBlacklist = document.createElement("div");
     taysPopupBlacklist.classList.add("tays_popup_block_grepper_button");
     taysPopupBlacklist.classList.add("tays_popup_block_grepper_button_checkmark");
     taysPopupBlacklist.innerHTML="&#x2713;";
     taysPopupBlacklist.title="Load Grepper on this domain (right click for this page only)";
     taysPopupBlacklist.addEventListener('contextmenu', function(ev) {
            blackList(user,currentURL,7); ev.preventDefault(); return;
     });
     taysPopupBlacklist.addEventListener('click',function(e){
            blackList(user,currentURL,3);
     });      
}else{
     var taysPopupBlacklist = document.createElement("div");
     taysPopupBlacklist.classList.add("tays_popup_block_grepper_button");
     taysPopupBlacklist.innerHTML="&#8416;";
     taysPopupBlacklist.title="Don't load Grepper on this domain (right click for this page only)";
     taysPopupBlacklist.addEventListener('contextmenu', function(ev) {
            blackList(user,currentURL,5); ev.preventDefault(); return;
     });
     taysPopupBlacklist.addEventListener('click',function(e){
            blackList(user,currentURL,1);
     });   
}





     document.getElementById("grepper_option_buttons").appendChild(taysPopupBlacklist);
     document.getElementById("grepper_option_buttons").appendChild(taysPopupBlacklistHideShow);

        //after that is set last add these guys
    });
});

}

//Wire up event event handlers
document.addEventListener("DOMContentLoaded", function(event) {

    //var resultsButton = document.getElementById("getResults");
   // resultsButton.onclick = getResults();

    /*
    var googleAuthButton = document.getElementById("google_auth_button");

    googleAuthButton.addEventListener("click", function(event) {
    window.open(prod_url+'google_auth.php','winname','directories=no,titlebar=no,toolbar=no,location=no,status=no,menubar=no,scrollbars=no,resizable=no,width=400,height=350');
    });
    */

var signinButton = document.getElementById("join_with_email");

    signinButton.addEventListener("click", function(event) {

    var url=prod_url+'register.php';
    if(isLogin){
        url+='?is_login=true'
    }
     registerWindow=window.open(url,'winname','directories=no,titlebar=no,toolbar=no,location=no,status=no,menubar=no,scrollbars=no,resizable=no,width=400,height=350');
    });

    var activateGrepperButton = document.getElementById("activate_menu");
    activateGrepperButton.addEventListener("click", function(event) {

    var url=prod_url_web+'/checkout/checkout.php';
 
     activateWindow=window.open(url,'winname','directories=no,titlebar=no,toolbar=no,location=no,status=no,menubar=no,scrollbars=no,resizable=no,width=1200,height=650');
    });

    checkLoginStatus();     
     //check status on load
});



chrome.runtime.onMessage.addListener(function(message){
   if(message.action ==="userRegistered"){
        checkLoginStatus();     
        if(registerWindow){
            registerWindow.close();
        }
   }
});

function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

function showRankPrivacy(p,user){
        if(!p){
            var rankPrivacyHTML="<i style='margin:0px;' class='icon hand pointer outline'></i>belt is public: <a id='grepperSetRankPrivateYes'>set private </a>";
            document.getElementById("rank_privacy").innerHTML=rankPrivacyHTML;
            document.getElementById("grepperSetRankPrivateYes").addEventListener("click", function(event) {
                grepperSetRankPrivate(1,user);
            });
        }else{
            var rankPrivacyHTML="<i  style='margin:0px;' class='icon hand pointer outline'></i>belt is private: <a id='grepperSetRankPrivateNo'>set public </a>";
            document.getElementById("rank_privacy").innerHTML=rankPrivacyHTML;
            document.getElementById("grepperSetRankPrivateNo").addEventListener("click", function(event) {
                grepperSetRankPrivate(0,user);
            });
      }

}

function showAccountDataSimple(stats,user){

    showBlacklistButtons(user);
    if(user.notices && user.notices.length){
    document.getElementById("grepper_profile_notices_holder").style.display="block";
    document.getElementById("grepper_profile_notices_amount").textContent=user.notices.length;
    if(user.notices.length === 1){
        document.getElementById("grepper_profile_notices_text").textContent="view 1 new notification";
        }else{
        document.getElementById("grepper_profile_notices_text").textContent="view "+user.notices.length+" new notifications";
        }
    }

    document.getElementById("login_menu").style.display="none";
    var gad= document.getElementById("grepper_account_data");
        gad.style.display="block";
        document.getElementById("profile_link").href="https://www.codegrepper.com/app/profile.php?id="+user.grepper_user_id;
        document.getElementById("grepper_profile_data_image_url").href="https://www.codegrepper.com/app/profile.php?id="+user.grepper_user_id;

       if(stats.profile_image){
            document.getElementById("grepper_profile_data_image").src=prod_url_web+"profile_images/"+stats.profile_image;
        }else{
            document.getElementById("grepper_profile_data_image").src=prod_url_web+"/app/img/default_profile.png";
        }
        showRankPrivacy(stats.is_rank_private,user);

    document.getElementById("devs_helped").textContent=stats.helped[0];
    document.getElementById("problems_helped").textContent=stats.helped[1];
    document.getElementById("recent_answers_holder").innerHTML ='';
    

 if(stats.earnings_allowed && !stats.earnings_enabled){
     document.getElementById("earnings_are_available").style.display ='block';
 }else if(stats.earnings_allowed && stats.earnings_enabled){
     document.getElementById("earnings_are_enabled").style.display ='block';
     document.getElementById("total_earnings").textContent="$"+currencyFormat(stats.earnings.total_earnings);
     document.getElementById("total_paid").textContent="$"+currencyFormat(stats.earnings.total_paid);
     document.getElementById("total_unpaid").textContent="$"+currencyFormat(stats.earnings.total_unpaid);
 }else if(stats.subscription_type === 0 || stats.subscription_type === 1 ){
    document.getElementById("subscription_notice").style.display ='block';

    var accountType="";
    if(stats.subscription_type === 0){
        accountType="Free";
    }else if(stats.subscription_type === 1){
        accountType="Free Trial";
    }else if(stats.subscription_type === 2){
        accountType="Yearly Subscription";
    }
    document.getElementById("subscription_account_type").textContent=accountType;
    if(!stats.earnings_allowed){
      document.getElementById("not_eligible_to_earn").style.display="inline"; 
    }
        
}

    var html="";
    for(var i=0;i<stats.recent_answers.length;i++){
        var t = stats.recent_answers[i].created_at.split(/[- :]/);
        var d = new Date(Date.UTC(t[0], t[1]-1, t[2], t[3], t[4], t[5]));
        var formattedDate=dateToNiceDayString(d);
        var a=document.createElement("a");
            a.target="_blank";
            a.href='https://www.google.com/search?tifgrpr=1&q='+stats.recent_answers[i].search_term;
        var a_div=document.createElement("div");
            a_div.textContent=stats.recent_answers[i].search_term;
        var a_span=document.createElement("span");
            a_span.className += " recent_answer_date";
            a_span.textContent =  formattedDate;
            a.appendChild(a_div);
            a_div.appendChild(a_span);
            document.getElementById("recent_answers_holder").appendChild(a);
        
    }


}


function showAccountData(stats){
document.getElementById("login_menu").style.display="none";
var gad= document.getElementById("grepper_account_data");
gad.style.display="block";

document.getElementById("overall_belt_color").textContent=capitalizeFirstLetter(stats.coding_belt[0]);
document.getElementById("overall_next_belt_color").textContent=capitalizeFirstLetter(stats.coding_belt[2]);
document.getElementById("percent_till_next").textContent=Math.round(stats.coding_belt[1]*100)+"%";

document.getElementById("next_belt_progress_bar").style.width=Math.round(stats.coding_belt[1]*100)+"%";
document.getElementById("next_belt_progress_bar").classList+=" " +stats.coding_belt[2]; 
document.getElementById("overallbelt").className+=" "+stats.coding_belt[0];


document.getElementById("belt_system_holder").style.display="block";
}




function showPaymentMenu(){
  document.getElementById("login_menu").style.display="none";
  document.getElementById("activate_menu").style.display="block";
}

function showLoginMenu(){

    document.getElementById("grepper_account_data").style.display="none";
    document.getElementById("login_menu").style.display="block";
}

var isLogin=false;

function switchToLogin(){
    isLogin = true;
    document.getElementById("join_with_email").textContent="Login with Email";
    
}

function switchToRegister(){
    isLogin = false;
    document.getElementById("join_with_email").textContent="Join with Email";
}

/*
function getUserStats(user){
    makeRequest('GET',prod_api+"/get_user_stats.php",null,user.grepper_user_id,user.access_token).then(function(d){
        var stats = JSON.parse(d);
        if(!stats.success){
            showLoginMenu();
        }else{
            showAccountData(stats);    
        }
    });
}
*/

function checkUserAuth(user){
    makeRequest('GET',prod_api+"/check_auth.php",null,user.grepper_user_id,user.access_token).then(function(d){
        var stats = JSON.parse(d);
        if(!stats.success){
             if(stats.yearly_subscription_enabled && !stats.subscription_started_on){
                showPaymentMenu();
             }else{
                showLoginMenu();
             }
        }else{
            if(stats.yearly_subscription_enabled && !stats.subscription_started_on){
                showPaymentMenu();
             }else{
                showAccountDataSimple(stats,user); //stats here ie helped states 
                showAccountData(stats.belt_stats);  //stats here is there belt
                //getUserStats(user);
            }
        }
    });
}
/*
document.getElementById("logout").addEventListener("click", function(event) {
    logout();
});
*/

function logout(){
 chrome.storage.sync.set(
 {access_token:""},
 function() {});
 checkLoginStatus();
}

function checkLoginStatus(){
    chrome.runtime.sendMessage({
      "action":"getAllUserData",
    }, function(user) {
        //console.log(user);
        //if the user has an email,
        //we can assume they have created account...
        
        if(user.email){
            switchToLogin();
            checkUserAuth(user);
        }else{
            switchToRegister();
            showLoginMenu();
            checkUserAuth(user);
        }

    });
}

function dateToNiceDayString(myDate){
  var month=new Array();
  month[0]="Jan";
  month[1]="Feb";
  month[2]="Mar";
  month[3]="Apr";
  month[4]="May";
  month[5]="Jun";
  month[6]="Jul";
  month[7]="Aug";
  month[8]="Sep";
  month[9]="Oct";
  month[10]="Nov";
  month[11]="Dec";
  var hours = myDate.getHours();
  var minutes = myDate.getMinutes();
  var ampm = hours >= 12 ? 'pm' : 'am';
  hours = hours % 12;
  hours = hours ? hours : 12;
  minutes = minutes < 10 ? '0'+minutes : minutes;
  var strTime = hours + ':' + minutes + ampm;
  //return myDate.getDate()+" "+month[myDate.getMonth()]+" "+myDate.getFullYear()+" "+strTime;
  return month[myDate.getMonth()]+" "+myDate.getDate()+" "+myDate.getFullYear();
}

function grepperSetRankPrivate(p,user){
    makeRequest('GET',prod_api+"/update_rank_privacy.php?is_rank_private="+p,null,user.grepper_user_id,user.access_token).then(function(d){
        showRankPrivacy(p,user);
    });
}
function currencyFormat(m){
    return parseFloat(m).toFixed(2); 
}

function blackList(user, url, blacklist_type) {
    var data={};
        data.url=url;
        data.blacklist_type = blacklist_type;
    makeRequest('POST', prod_api+"/blacklist.php",JSON.stringify(data),user.grepper_user_id,user.access_token).then(function(responseData){
            var dataR=JSON.parse(responseData); 
            //if we could save to backend,just rest to whatever is on the backend 
            if(dataR.success){
                chrome.storage.sync.set({grepper_blacklists: dataR.blacklists}, function() {
                   location.reload();
                   chrome.tabs.update(currentTab.id, {url: currentTab.url});
                   //currentTab.reload();
                });
            }else{
            //    alert("Ooops, You need to login to complete this action. Click the Grepper icon in the top right of your browser ↗ ");
            }
    });

}



/*
function resetNotifications(){
    chrome.browserAction.setBadgeText({text:""});
    chrome.storage.sync.set({notices: []}, function() {});
     window.open("https://www.codegrepper.com/app/notifications.php", '_blank');
}

document.getElementById("grepper_profile_notices").addEventListener("click", resetNotifications);
*/




