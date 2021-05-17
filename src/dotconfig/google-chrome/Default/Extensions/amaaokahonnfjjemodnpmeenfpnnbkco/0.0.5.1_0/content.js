//this page load a half second before
//tab.status is complete

//  var d=new Date(); console.log("page loaded"); console.log(d.getTime());
//  chrome.runtime.sendMessage({action: "get_answers"}, function(response) {
//  var co=new commando();
//  var d=new Date(); console.log("loading answers"); console.log(d.getTime());
//        console.log(response);
//        co.loadAnswers(response);
//  });

//  setTimeout(function(){

//  var d=new Date(); console.log("testing later send start"); console.log(d.getTime());
//  chrome.runtime.sendMessage({action: "get_answers"}, function(response) {
//  var d=new Date(); console.log("testing later send end"); console.log(d.getTime());

//  });

//  }, 3000);


//  chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
//    // listen for messages sent from background.js
//  //  console.log(request);
//      if (request.message === 'answers_loaded') {
//           // alert(request.url);
//            var co=new commando();
//                co.loadAnswers(request);
//      }
//  });

function commando() {

  //this.endpoint="https://staging.codegrepper.com/api";
  //this.web_endpoint="https://staging.codegrepper.com";
  this.endpoint="https://www.codegrepper.com/api";
  this.web_endpoint="https://www.codegrepper.com";

  this.listenForFeedbackOnAnswer = true; 
  this.search = getParameterByName("q");
  this.tifgrpr = (getParameterByName("tifgrpr")) ? "&tifgrpr=1" : "";//this is from grpr
  this.user_id=false;
  this.answers=[];
  this.products=[];
  //this.doneLoadingAnswersDom=false;
  this.languageGuess="whatever";
  this.isWrittingAnswer=false;
  this.copyClickedTimes=0;
  this.bounty=0;
  this.needsResults1ToDisplayOnDomLoaded=false;
  var currentDate = new Date();
  this.currentTime = currentDate.getTime();
  this.resultsURLS=[];
  this.loadedCodeMirrorModes=[];
  this.moreAnswers=[];
  this.moreResultsInitiated=false;
  this.moreAnswersTotalCount=0;
   //if this get past 15 we have been running for 150 millo seconds and dom has not loaded, something is wrong so finish
  this.stateDomLoadedNoResults=0;
  this.mHasBeenClicked=false;
  this.oHasBeenClicked=false;
  this.stream;
  this.recorder;
  this.videoHolder = false;
  this.uploadedVideoName = false;
}

//commando.prototype.loadAnswers=function(request){
//      this.search=request.search;
//      this.answers=request.answers;
//      this.user_id="efa1a5314f0e863dd7615224573953eeb512b6a97481b330a38d74d2731e";
//      this.displayResults();
//}

commando.prototype.init=function(){
    //get the user id

    this.getUserId().then(function(){
        this.listenForStatDomLoaded();
      //var d=new Date(); console.log("user id got"); console.log(d.getTime());
        this.getAnswers().then(function(){
          if(this.answers.length > 0){
              //this.getAndDisplayVotes();
          }
        }.bind(this));
    }.bind(this));

    //push onto history
  this.settupKeyBindings();

   chrome.runtime.sendMessage({
      "action":"resultSearchAction",
      "search":this.search,
      "search_time": this.currentTime,
      "fallback":1,
      "results":[]
    }); 
}

commando.prototype.setupCopyListener=function(){

   this.copyClickedTimes=0;
   window.grepperControlDown=false;

   document.addEventListener('keydown', function(event) {
        if(event.key ==="Meta" || event.key==="Control"){
           window.grepperControlDown=true;
        }
   });
 document.addEventListener('keyup', function(event) {
      if(event.key ==="Meta" || event.key==="Control"){
        //they were pry trying to copy regulatlry
        setTimeout(function(){
             window.grepperControlDown=false;
        }, 500);
      }
 });
   
   document.addEventListener('keyup', function(event) {
       //hmm, what to do with this??? 
        var tag = document.activeElement.tagName;
        if(tag==="INPUT" || tag === "TEXTAREA"){
            return;    
        }    

        if(event.key=="c"){
            if(window.grepperControlDown){
                return;
            }

            if(this.copyClickedTimes >= this.answers.length){
                this.copyClickedTimes=0;    
            }

            this.selectCode(this.answers[this.copyClickedTimes].codeResults);
            this.copyClickedTimes++;
            event.stopPropagation();
            return;
        }
    }.bind(this));

}

commando.prototype.selectCode=function(e){
	// Source: http://stackoverflow.com/a/11128179/2757940
		if (document.body.createTextRange) { // ms
			var range = document.body.createTextRange();
			range.moveToElementText(e);
			range.select();
		} else if (window.getSelection) { // moz, opera, webkit
			var selection = window.getSelection();
			var range = document.createRange();
			range.selectNodeContents(e);
			selection.removeAllRanges();
			selection.addRange(range);
		}
      document.execCommand("copy");
}
commando.prototype.settupKeyBindings=function(){
    document.addEventListener('keyup', function(event) {
        var tag = false;
        if(document.activeElement){
             tag = document.activeElement.tagName;
        }
        if(tag==="INPUT" || tag === "TEXTAREA"){
            return;    
        }    
        if(event.key=="a"){
            this.injectScript('codemirror/lib/codemirror.js', 'body',function(){
               this.displayAnswerBox();
            }.bind(this));
            event.stopPropagation();
            return;
        }
        if(event.key=="m"){
            if(this.mHasBeenClicked){ return; }
            this.mHasBeenClicked=true;
            this.loadMyMoreResults(0);
            event.stopPropagation();
            return;
        }
        if(event.key=="o"){
            if(this.oHasBeenClicked){ return; }
            this.oHasBeenClicked=true;
            this.loadMyMoreResults(1);
            event.stopPropagation();
            return;
        }
       
        
    }.bind(this));
}

//  commando.prototype.getUserId=function(){
//      return new Promise(function (resolve, reject) {
//          chrome.extension.sendMessage({"action":"getUser"}, function(response) {
//              this.user_id=response.user.email;
//              resolve();
//          }.bind(this));
//      }.bind(this));
//  }


//here we try and use localStorage, if we dont
//have it then we use chrome.storage.sync
//so this resolves twice, first wins - it will always reset the local storage
commando.prototype.getUserId=function(){

  return new Promise(function (resolve, reject) {
    this.user_id=localStorage.getItem("grepper_user_id");
    if(this.user_id && this.user_id > 0){
        resolve();
        //return;//So wa want to alwas reset the local storage for nex time
    }

    chrome.storage.sync.get(['grepper_user_id','access_token'], function(items) {
        this.user_id = items.grepper_user_id;
        localStorage.setItem("grepper_user_id",this.user_id);
        if(items.access_token){
            localStorage.setItem("grepper_access_token",items.access_token);
        }else{
            localStorage.setItem("grepper_access_token","");
        }
        resolve();
    }.bind(this));

  }.bind(this));
}

//consider using muttations oberver
commando.prototype.listenForStatDomLoaded=function(){

//this is just for search div to be loaed
 this.statsDomInterval = setInterval(function(){
    if(this.getStatsDom()){
        clearInterval(this.statsDomInterval);
        if(this.needsResults1ToDisplayOnDomLoaded){
            this.displayResults();
            this.displayProducts();
        }
    }
 }.bind(this), 10);

//this is just for all results to be loaded 
 this.statsDomResultsLoadedInterval = setInterval(function(){
    if(this.getStatsDomAfterAllResults()){
        clearInterval(this.statsDomResultsLoadedInterval);
        this.getAnswers2();
        this.setUpResultsClickListeners();//we still need this
    }
 }.bind(this), 100);


  //don't poll for more than 3 seconds
  setTimeout(function(){
        clearInterval(this.statsDomResultsLoadedInterval);
        clearInterval(this.statsDomInterval);
  }.bind(this), 3000);

}


commando.prototype.getAnswers=function(){
  return new Promise(function (resolve, reject) {
    makeRequest('GET', this.endpoint+"/get_answers_1.php?v=2&s="+encodeURIComponent(this.search)+"&u="+this.user_id+this.tifgrpr,{},true).then(function(data){
    
        var results=JSON.parse(data);
        this.answers=results.answers;
        this.products=results.products;
        this.moreAnswers= results.more_answers;
        if(this.getStatsDom()){
            this.displayResults();
            this.displayProducts();
        }else{
            this.needsResults1ToDisplayOnDomLoaded=true;
        }
        resolve();
    }.bind(this));
  }.bind(this));
};

/*
commando.prototype.listenForStatDomAnswersLoaded=function(data){
 this.doneLoadingAnswersDomInterval = setInterval(function(){
    if(this.doneLoadingAnswersDom){
        clearInterval(this.doneLoadingAnswersDomInterval);
        //this.displayVotes(data);
    }
 }.bind(this,data), 10);

  setTimeout(function(){
        clearInterval(this.doneLoadingAnswersDomInterval);
  }, 9000);
}
*/


/*
commando.prototype.setupFeedBackListenersForExtra=function () {
    if(!this.answers.length){ return; }

    //setup copy events on answers
    for(let i=0;i<this.answers.length;i++){
          this.answers[i].codeResults.addEventListener("copy", function(){
            makeRequest('POST', this.endpoint+"/feedback.php?vote=2&search_answer_result_id="+this.answers[i].search_answer_result_id+"&u="+this.user_id).then(function(data){});
          }.bind(this));
    }
}
*/

commando.prototype.setupFeedBackListeners=function () {
    if(!this.answers.length){ return; }

    //hook into on handleResultClick
    this.listenForFeedbackOnAnswer = true; 
    //setup copy events on answers
    for(let i=0;i<this.answers.length;i++){
          this.answers[i].codeResults.addEventListener("copy", function(){
            makeRequest('POST', this.endpoint+"/feedback.php?vote=2&search_answer_result_id="+this.answers[i].search_answer_result_id+"&u="+this.user_id).then(function(data){
                    var dataR=JSON.parse(data); 
                    if(dataR.subscription_expired){
                        this.showNeedsPaymentBox(dataR.subscription_expired_text);
                    }
                }.bind(this));
          }.bind(this));
    }
}

/*
commando.prototype.getAndDisplayVotes=function () {
var answer_ids="";
for(var i=0;i<this.answers.length;i++){
    answer_ids+=this.answers[i].id+",";
}
    answer_ids=answer_ids.substring(0, answer_ids.length - 1);

 makeRequest('GET', this.endpoint+"/vote.php?answer_ids="+answer_ids+"&u="+this.user_id+"&term="+this.search).then(function(data){
        //here we need to wait for to be doneLoadingAnswers
        if(this.doneLoadingAnswersDom){
           this.displayVotes(data);
        }else{
           this.listenForStatDomAnswersLoaded(data);
        }
 }.bind(this));
}
*/


commando.prototype.taysRemoveListeners =function(el) {
   var elClone = el.cloneNode(true);
       el.parentNode.replaceChild(elClone, el);
}

commando.prototype.doProductDownvote =function(progressEvent,product,mouseEvent) {

    var currentVal= mouseEvent.target.parentElement.getElementsByClassName("commando-voting-number")[0].textContent;
      var postData={};
          postData.id=product.id;
          postData.term=this.search;

     if(mouseEvent.target.classList.contains("commando_voted")){
           mouseEvent.target.parentElement.getElementsByClassName("commando-voting-number")[0].textContent=(parseInt(currentVal)+1);
           mouseEvent.target.classList.remove("commando_voted");
           makeRequest('POST', this.endpoint+"/product_feedback.php?delete=1&vote=4&product_result_id="+product.product_result_id+"&u="+this.user_id,JSON.stringify(postData)).then(function(data1){
           }.bind(this));
       }else{

           if(mouseEvent.target.parentElement.getElementsByClassName("arrow-up")[0].classList.contains("commando_voted")){
               mouseEvent.target.parentElement.getElementsByClassName("commando-voting-number")[0].textContent=(parseInt(currentVal)-2);
           }else{
               mouseEvent.target.parentElement.getElementsByClassName("commando-voting-number")[0].textContent=(parseInt(currentVal)-1);
           };
       mouseEvent.target.classList.add("commando_voted");
       mouseEvent.target.parentElement.getElementsByClassName("arrow-up")[0].classList.remove("commando_voted");
       makeRequest('POST', this.endpoint+"/product_feedback.php?vote=4&product_result_id="+product.product_result_id+"&u="+this.user_id,
       JSON.stringify(postData)).then(function(data1){
          var data=JSON.parse(data1);
                product.product_result_id=data.id;    
       }.bind(this));
   }

}

commando.prototype.doProductUpvote =function(progressEvent,product,mouseEvent) {
      var currentVal= mouseEvent.target.parentElement.getElementsByClassName("commando-voting-number")[0].textContent;

      var postData={};
          postData.id=product.id;
          postData.term=this.search;

       if(mouseEvent.target.classList.contains("commando_voted")){
           mouseEvent.target.classList.remove("commando_voted");
           mouseEvent.target.parentElement.getElementsByClassName("commando-voting-number")[0].textContent=(parseInt(currentVal)-1);
           makeRequest('POST', this.endpoint+"/product_feedback.php?delete=1&vote=1&product_result_id="+product.product_result_id+"&u="+this.user_id, JSON.stringify(postData)).then(function(data1){
 
           }.bind(this));
       }else{
          //add one if other we are not already down
           if(mouseEvent.target.parentElement.getElementsByClassName("arrow-down")[0].classList.contains("commando_voted")){
               mouseEvent.target.parentElement.getElementsByClassName("commando-voting-number")[0].textContent=(parseInt(currentVal)+2);
           }else{
               mouseEvent.target.parentElement.getElementsByClassName("commando-voting-number")[0].textContent=(parseInt(currentVal)+1);
           };
           mouseEvent.target.classList.add("commando_voted");
           mouseEvent.target.parentElement.getElementsByClassName("arrow-down")[0].classList.remove("commando_voted");
           makeRequest('POST', this.endpoint+"/product_feedback.php?vote=1&product_result_id="+product.product_result_id+"&u="+this.user_id, JSON.stringify(postData)).then(function(data1){

              var data=JSON.parse(data1);
                product.product_result_id=data.id;    
           }.bind(this));
      }
}


commando.prototype.doUpvote =function(progressEvent,answer,mouseEvent) {
      var currentVal= mouseEvent.target.parentElement.getElementsByClassName("commando-voting-number")[0].textContent;

      var postData={};
          postData.id=answer.id;
          postData.term=this.search;
          postData.isRequestedExtraAnswer=answer.isRequestedExtraAnswer;
          postData.isExtraAnswer=answer.isExtraAnswer;
          postData.results = this.resultsURLS;

       if(mouseEvent.target.classList.contains("commando_voted")){
           mouseEvent.target.classList.remove("commando_voted");
           mouseEvent.target.parentElement.getElementsByClassName("commando-voting-number")[0].textContent=(parseInt(currentVal)-1);
           makeRequest('POST', this.endpoint+"/feedback.php?delete=1&vote=1&search_answer_id="+answer.search_answer_id+"&search_answer_result_id="+answer.search_answer_result_id+"&u="+this.user_id, JSON.stringify(postData)).then(function(data1){
           var data=JSON.parse(data1);
               answer.search_answer_result_id=data.id;   
                  if(data.subscription_expired){
                        this.showNeedsPaymentBox(data.subscription_expired_text);
                  }
 
           }.bind(this));
       }else{
          //add one if other we are not already down
           if(mouseEvent.target.parentElement.getElementsByClassName("arrow-down")[0].classList.contains("commando_voted")){
               mouseEvent.target.parentElement.getElementsByClassName("commando-voting-number")[0].textContent=(parseInt(currentVal)+2);
           }else{
               mouseEvent.target.parentElement.getElementsByClassName("commando-voting-number")[0].textContent=(parseInt(currentVal)+1);
           };

           mouseEvent.target.classList.add("commando_voted");
           mouseEvent.target.parentElement.getElementsByClassName("arrow-down")[0].classList.remove("commando_voted");
           makeRequest('POST', this.endpoint+"/feedback.php?vote=1&search_answer_id="+answer.search_answer_id+"&search_answer_result_id="+answer.search_answer_result_id+"&u="+this.user_id, JSON.stringify(postData)).then(function(data1){
               
        var data=JSON.parse(data1);
            answer.search_answer_result_id=data.id;    
             if(data.subscription_expired){
                this.showNeedsPaymentBox(data.subscription_expired_text);
             }
           }.bind(this));
      }
}

commando.prototype.doDownvote =function(progressEvent,answer,mouseEvent) {
      var currentVal= mouseEvent.target.parentElement.getElementsByClassName("commando-voting-number")[0].textContent;

      var postData={};
          postData.id=answer.id;
          postData.term=this.search;
          postData.isRequestedExtraAnswer=answer.isRequestedExtraAnswer;
          postData.isExtraAnswer=answer.isExtraAnswer;

     if(mouseEvent.target.classList.contains("commando_voted")){
           mouseEvent.target.parentElement.getElementsByClassName("commando-voting-number")[0].textContent=(parseInt(currentVal)+1);
           mouseEvent.target.classList.remove("commando_voted");
           makeRequest('POST', this.endpoint+"/feedback.php?delete=1&vote=4&search_answer_id="+answer.search_answer_id+"&search_answer_result_id="+answer.search_answer_result_id+"&u="+this.user_id,JSON.stringify(postData)).then(function(data1){

        var data=JSON.parse(data1);
            answer.search_answer_result_id=data.id;    
           //not on downvotes
           //if(data.subscription_expired){
           //   this.showNeedsPaymentBox(data.subscription_expired_text);
           //}
           }.bind(this));
       }else{

          //add one if other we are not already down
           if(mouseEvent.target.parentElement.getElementsByClassName("arrow-up")[0].classList.contains("commando_voted")){
               mouseEvent.target.parentElement.getElementsByClassName("commando-voting-number")[0].textContent=(parseInt(currentVal)-2);
           }else{
               mouseEvent.target.parentElement.getElementsByClassName("commando-voting-number")[0].textContent=(parseInt(currentVal)-1);
           };
       mouseEvent.target.classList.add("commando_voted");
       mouseEvent.target.parentElement.getElementsByClassName("arrow-up")[0].classList.remove("commando_voted");
       makeRequest('POST', this.endpoint+"/feedback.php?vote=4&search_answer_id="+answer.search_answer_id+"&search_answer_result_id="+answer.search_answer_result_id+"&u="+this.user_id,
      JSON.stringify(postData)).then(function(data1){
        var data=JSON.parse(data1);
            answer.search_answer_result_id=data.id;    

           //not on downvotes
           //if(data.subscription_expired){
           //   this.showNeedsPaymentBox(data.subscription_expired_text);
           //}
       }.bind(this));
   }
}

commando.prototype.getStatsDom =function() {
    if(!this.statsDom){
        this.statsDom=document.getElementById("search");
    }
    if(!this.statsDom){
        return false;    
    }
    return this.statsDom;
}

commando.prototype.getStatsDomAfterAllResults =function() {
    if(!this.statsDom){
        this.statsDom=document.getElementById("search");
    }

    //we need this otherwise count will continue w/out statsDom
    if(!this.statsDom){
        return false;    
    }

    //just finish it
    if(this.stateDomLoadedNoResults > 15){
        return this.statsDom;   
    }

    //var results = document.querySelectorAll("div#search div.g div.r>a");
    //this lets us know when dom is done 
    //this hosuld match other querySelector All in get Answers 2
    var results = document.querySelectorAll("div#search div.g div.yuRUbf>a");

    if(!results){
        this.stateDomLoadedNoResults+=1;
        return false;
    }
    //6 or more results
    if(results.length < 7){
        this.stateDomLoadedNoResults+=1;
        return false;    
    }
  //if(!this.statsDom){
  //    this.statsDom=document.getElementById("res");
  //}
    return this.statsDom;
}


//Ithiswill now guess the language and Load the needed modes javascript
commando.prototype.languangeNametoTaysCodeMirrorName =function(l,callback) {
  var mode ="javascript"

  if(l === "javascript"){ l="text/javascript" ; mode=["javascript"];}
  if(l === "php"){ l="text/x-php" ; mode=["clike","javascript","htmlmixed","css","php"];}
  if(l === "java"){ l="text/x-java" ;mode=["clike"];  }
  if(l === "csharp"){ l="text/x-csharp" ;mode=["clike"];  }
  if(l === "python"){ l="text/x-python" ;mode=["python"];  }
  if(l === "swift"){ l="text/x-swift" ;mode=["swift"];  }
  if(l === "objectivec"){ l="text/x-objectivec" ;mode=["clike"];}
  if(l === "cpp"){ l="text/x-c++src" ;mode=["clike"];  }
  if(l === "c"){ l="text/x-csrc" ;mode=["clike"];  }
  if(l === "css"){ l="text/css" ;mode=["css"];  }
  if(l === "html"){ l="text/html" ;mode=["xml","javascript","css","htmlmixed"];  }
  if(l === "shell"){ l="text/x-sh";mode=["shell"];  }
  if(l === "sql"){ l="text/x-mysql";mode=["sql"];  }
  if(l === "typescript"){ l="application/typescript";mode=["javascript"];  }
  if(l === "ruby"){ l="text/x-ruby" ;mode=["ruby"];  }
  if(l === "kotlin"){ l="text/x-kotlin" ;mode=["clike"];  }
  if(l === "go"){ l="text/x-go";mode=["go"];  }
  if(l === "assembly"){ l="text/x-gas";mode=["gas"]; }
  if(l === "r"){ l="text/x-rsrc";mode=["r"]; }
  if(l === "vb"){ l="text/x-vb";mode=["vb"]; }
  if(l === "scala"){ l="text/x-scala";mode=["clike"]; }
  if(l === "rust"){ l="text/x-rust";mode=["rust"]; }
  if(l === "dart"){ l="text/x-dart";mode=["dart"]; }
  if(l === "elixir"){ l="text/javascript";mode=["javascript"]; }
  if(l === "clojure"){ l="text/x-clojure";mode=["clojure"]; }
  if(l === "webassembly"){ l="text/javascript";mode=["javascript"]; }
  if(l === "fsharp"){ l="text/x-fsharp";mode=["mllike"]; }
  if(l === "erlang"){ l="text/x-erlang";mode=["erlang"]; }
  if(l === "haskell"){ l="text/x-haskell";mode=["haskell"]; }
  if(l === "matlab"){ l="text/javascript";mode=["javascript"]; }
  if(l === "cobol"){ l="text/x-cobol";mode=["cobol"]; }
  if(l === "fortran"){ l="text/x-fortran";mode=["fortran"]; }
  if(l === "scheme"){ l="text/x-scheme";mode=["scheme"]; }
  if(l === "perl"){ l="text/x-perl";mode=["perl"]; }
  if(l === "groovy"){ l="text/x-groovy";mode=["groovy"]; }
  if(l === "lua"){ l="text/x-lua";mode=["lua"]; }
  if(l === "julia"){ l="text/x-julia";mode=["julia"]; }
  if(l === "delphi"){ l="text/javascript";mode=["javascript"]; }
  if(l === "abap"){ l="text/javascript";mode=["javascript"]; }
  if(l === "lisp"){ l="text/x-common-lisp";mode=["commonlisp"]; }
  if(l === "prolog"){ l="text/javascript";mode=["javascript"]; }
  if(l === "pascal"){ l="text/x-pascal";mode=["pascal"]; }
  if(l === "postscript"){ l="text/javascript";mode=["javascript"]; }
  if(l === "smalltalk"){ l="text/x-stsrc";mode=["smalltalk"]; }
  if(l === "actionscript"){ l="text/javascript";mode=["javascript"]; }
  if(l === "basic"){ l="text/javascript";mode=["javascript"]; }


    var total=0;
    for(var i=0;i<mode.length;i++){
        this.injectScript('codemirror/mode/'+mode[i]+'/'+mode[i]+'.js', 'body', function(){
            total++;
            if(total === mode.length){
                callback(l);     
            }
        });
    }
  
}


commando.prototype.displayAnswerBox =function(editingAnswer) {
    //prompt user if they have put in answer and are leaving w/out saving 
    window.onbeforeunload = function(){
        var answer=this.myTaysCodeMirror.getValue();
        if(editingAnswer || answer || this.uploadedVideoName){
            return 'Unsaved Grepper answer, are you sure you want to leave?';
        }
    }.bind(this);

    var isEditing=false;
    if((typeof editingAnswer) !== 'undefined'){
       isEditing=true; 
    }

    if(this.isWrittingAnswer){
        return;    
    }

    this.isWrittingAnswer=true;
    this.codeResults = document.createElement("textarea");

    if(isEditing){
        this.codeResults.textContent=editingAnswer.answer;    
    }
    
    //this.codeResults.setAttribute("id","commando_code_block_answer");
    this.statsDom.insertBefore(this.codeResults,this.statsDom.childNodes[0]);

    this.guessCodeLanguage(function(languageGuessRaw){

    if(isEditing && editingAnswer.language){
        languageGuessRaw = editingAnswer.language;
    }

    this.languangeNametoTaysCodeMirrorName(languageGuessRaw,function(mimeType){
   
    this.myTaysCodeMirror = TaysCodeMirror.fromTextArea(this.codeResults,{
                lineNumbers: true,
                theme:"prism-okaidia",
                //theme:"midnight",
                mode: mimeType,
                viewportMargin: Infinity
    });


    this.languageGuessDisplayHolder = document.createElement("div");
    this.languageGuessDisplayHolder.setAttribute("id","languange_guess_display_holder");
    this.languageToSelect(languageGuessRaw);
    this.languageGuessDisplayHolder.appendChild(this.editorCurrentLanguageSelect);

    this.codeResults.parentNode.insertBefore(this.languageGuessDisplayHolder, this.codeResults);

    //myTaysCodeMirror.setSize(null, 100);
    this.codeResultsSave = document.createElement("button");
    this.codeResultsSave.textContent="Save";
    this.codeResultsSave.setAttribute("id","commando_save_answer");

    //add the team options 
    this.teams=[];
    
    //handle when updating too
    var teamAnswerId="";
    if(isEditing){
        teamAnswerId="&answer_id="+editingAnswer.id;
    }
    makeRequest('GET', this.endpoint+"/get_my_teams.php?u="+this.user_id+teamAnswerId).then(function(data){
     this.teams=JSON.parse(data);
     if(this.teams.length > 0){

         this.teamsHolder = document.createElement("div");
         this.teamsHolder.setAttribute("id","grepper_teams_icon_holder");
         this.teamIcons=[];
         for(var i=0;i<this.teams.length;i++){
         this.teamIcons[i]= document.createElement("div");
         this.teamIcons[i].classList.add("grepper_team_select_icon_holder");
         this.teamIcons[i].setAttribute("grepper_team_name",this.teams[i].name);
         this.teamIcons[i].setAttribute("grepper_team_id",this.teams[i].id);

         if(this.teams[i].add_to_team){
             this.teamIcons[i].classList.add("grepper_team_icon_active");
             this.teamIcons[i].title="Adding answer to team "+this.teams[i].name;
         }else{
             this.teamIcons[i].title="Select to add answer to team "+this.teams[i].name;
         }

         this.teamIcons[i].addEventListener('click',function(){
             if(this.classList.contains("grepper_team_icon_active")){
                this.classList.remove("grepper_team_icon_active");
                this.title="Select to add answer to team "+this.getAttribute("grepper_team_name");
             }else{
                this.classList.add("grepper_team_icon_active");
                this.title="Adding answer to team "+this.getAttribute("grepper_team_name");
             }
         });

            var img=  document.createElement("img");
                img.src="https://www.codegrepper.com/team_images/50_50/"+this.teams[i].profile_image;

            this.teamIcons[i].appendChild(img);
            this.teamsHolder.appendChild(this.teamIcons[i]);
         }

        this.languageGuessDisplayHolder.appendChild(this.teamsHolder);
        this.languageGuessDisplayHolder.style.marginTop="5px";
    }
  
    }.bind(this));



    //Save the code results
    this.codeResultsSave.addEventListener('click',function(){
   //var answer=this.codeResults.value;
     var answer=this.myTaysCodeMirror.getValue();
    
        var codeSearch={};
            codeSearch.results=this.resultsURLS;
            codeSearch.search=this.search;

        var data={};
        data.answer=answer;
        data.user_id=this.user_id;
        data.codeSearch=codeSearch;
        data.source=2;
        data.language = this.editorCurrentLanguageSelect.value;

        if(this.uploadedVideoName){
            data.uploaded_video_name = this.uploadedVideoName;
        }else{
            data.uploaded_video_name = "";
        }



        if(this.taysPopupSourceInput.value && this.isValidSource(this.taysPopupSourceInput.value)){
            data.source_url=this.taysPopupSourceInput.value;
        }else{
            data.source_url="";
        }

        if(isEditing){
            data.id=editingAnswer.id;    
        }

        var saveUrl = this.endpoint+"/save_answer.php";
        if(isEditing){
            saveUrl =  this.endpoint+"/update_answer.php";
        }

        //save answer to teams
        if(this.teams.length){
             data.team_ids=[];
             for(var i=0;i<this.teamIcons.length;i++){
                 if(this.teamIcons[i].classList.contains("grepper_team_icon_active")){
                     data.team_ids.push(this.teamIcons[i].getAttribute("grepper_team_id"));
                 }
             }
        }

        makeRequest('POST',saveUrl,JSON.stringify(data)).then(function(responseData){
            var dataR=JSON.parse(responseData); 
            if(dataR.payment_required){
                var r = confirm("Oops! Looks like you need to activate Grepper, Activate now?");
                if (r == true) {
                    window.open("https://www.codegrepper.com/checkout/checkout.php", "_blank");
                } 
            }else{
                window.onbeforeunload = null;
                location.reload();
            }
        }.bind(this));


    }.bind(this));




    this.codeResultsSaveHolder = document.createElement("div");
    this.codeResultsSaveHolder.setAttribute("id","commando_save_answer_holder");

    this.taysPopupSourceHolder = document.createElement("div");
    this.taysPopupSourceHolder.setAttribute("id","tays_popup_source_holder_2");

    this.taysPopupSourceHolderLabel = document.createElement("span");
    this.taysPopupSourceHolderLabel.textContent="Source:";
    this.taysPopupSourceHolderLabel.setAttribute("id","tays_popup_source_holder_label_2");
    this.taysPopupSourceHolder.appendChild(this.taysPopupSourceHolderLabel);

    //add in the source input 
    this.addSourceButton = document.createElement("a");
    this.addSourceButton.textContent = "Add Source";
    this.addSourceButton.title = "Add Source";
    this.addSourceButton.setAttribute("id","tays_add_source_button_2");

    this.taysPopupSourceText = document.createElement("span");
    this.taysPopupSourceText.setAttribute("id","tays_popup_source_text_2");
    this.taysPopupSourceText.title = "Edit Source";

    this.taysPopupSourceInput = document.createElement("input");
    //this.taysPopupSourceInput.value=window.location.href;
    this.taysPopupSourceInput.setAttribute("id","tays_popup_source_input_2");
    this.taysPopupSourceInput.setAttribute("placeholder","http://www.your-source-website.com");

    this.taysPopupSourceInputDelete = document.createElement("span");
    this.taysPopupSourceInputDelete.setAttribute("id","tays_popup_source_delete_button_2");
    this.taysPopupSourceInputDelete.textContent="x";
    this.taysPopupSourceInputDelete.title = "Delete Source";
    this.taysPopupSourceInputDelete.style.display = "none";

    this.taysPopupSourceInputCheck = document.createElement("span");
    this.taysPopupSourceInputCheck.setAttribute("id","tays_popup_source_check_button_2");
    this.taysPopupSourceInputCheck.textContent="✓";
    this.taysPopupSourceInputCheck.title = "Set Source";
    this.taysPopupSourceInputCheck.style.display = "none";

    this.taysPopupSourceHolder.appendChild(this.addSourceButton);
    this.taysPopupSourceHolder.appendChild(this.taysPopupSourceText);
    this.taysPopupSourceHolder.appendChild(this.taysPopupSourceInput);
    this.taysPopupSourceHolder.appendChild(this.taysPopupSourceInputCheck);
    this.taysPopupSourceHolder.appendChild(this.taysPopupSourceInputDelete);

    var that=this;


    this.addSourceButton.addEventListener('click',function(){
        that.addSourceButton.style.display="none";
        that.taysPopupSourceHolderLabel.style.display="inline-block";
        that.taysPopupSourceText.style.display="none";
        that.taysPopupSourceInput.style.display="inline-block";
        that.taysPopupSourceInputDelete.style.display="inline-block";
        that.taysPopupSourceInputCheck.style.display="inline-block";
        that.taysPopupSourceInput.focus();
    });

    this.taysPopupSourceText.addEventListener('click',function(){
        that.taysPopupSourceText.style.display="none";
        that.taysPopupSourceInput.style.display="inline-block";
        that.taysPopupSourceInputDelete.style.display="inline-block";
        that.taysPopupSourceInputCheck.style.display="inline-block";
        that.taysPopupSourceInput.focus();
    });

    //Basically clearing this input out
    this.taysPopupSourceInputDelete.addEventListener('click',function(){
            that.taysPopupSourceInput.value = '';
            that.taysPopupSourceText.textContent = that.taysPopupSourceInput.value;
            that.taysPopupSourceText.style.display="none";
            that.taysPopupSourceInput.style.display="none";
            that.taysPopupSourceInputDelete.style.display="none";
            that.taysPopupSourceInputCheck.style.display="none";
            that.taysPopupSourceHolderLabel.style.display="none";
            that.addSourceButton.style.display="inline-block";
    });

    this.taysPopupSourceInputCheck.addEventListener('click',function(){
        doneSettingsSource();
    });

    this.taysPopupSourceInput.addEventListener('keyup',function(event){
        if (event.key === "Enter") {
            doneSettingsSource();
        }
    });

   function doneSettingsSource(){
    if(!that.taysPopupSourceInput.value){
            that.taysPopupSourceText.textContent = that.taysPopupSourceInput.value;
            that.taysPopupSourceText.style.display="none";
            that.taysPopupSourceInput.style.display="none";
            that.taysPopupSourceInputDelete.style.display="none";
            that.taysPopupSourceInputCheck.style.display="none";
            that.taysPopupSourceHolderLabel.style.display="none";
            that.addSourceButton.style.display="inline-block";
        }else{
            if(that.isValidSource(that.taysPopupSourceInput.value)){
                that.taysPopupSourceText.textContent = that.maxLength(that.taysPopupSourceInput.value,64);
                that.taysPopupSourceText.style.display="inline-block";
                that.taysPopupSourceInput.style.display="none";
                that.taysPopupSourceInputDelete.style.display="none";
                that.taysPopupSourceInputCheck.style.display="none";
            }else{
                alert("Hmm, that source is not a valid URL. Be sure to use full url. ex: http://www.mywebsite.com/mypage.php");
            }
        }
   
    }


    if(isEditing && editingAnswer.source_url){
       this.taysPopupSourceText.textContent = this.maxLength(editingAnswer.source_url,64);
       this.taysPopupSourceInput.value = editingAnswer.source_url;
       this.taysPopupSourceText.style.display="inline-block";
       this.taysPopupSourceInput.style.display="none";
       this.taysPopupSourceInputDelete.style.display="none";
       this.taysPopupSourceInputCheck.style.display="none";
       this.addSourceButton.style.display="none";
       this.taysPopupSourceHolderLabel.style.display="inline-block";
    }


//add the add video button
    this.addVideoButton = document.createElement("div");
    //this.addVideoButton.textContent="Add Video"
    this.addVideoButton.title="Add Video"
    this.addVideoButton.setAttribute("id","grepper_add_video");
    
    this.addVideoButton.addEventListener('click',function(){
        this.settupHelpVideo(); 
    }.bind(this));


    if(localStorage.getItem("grepper_access_token")){
        this.codeResultsSaveHolder.appendChild(this.addVideoButton);
    }



    this.codeResultsSaveHolder.appendChild(this.taysPopupSourceHolder);
    this.codeResultsSaveHolder.appendChild(this.codeResultsSave);


    var clearDiv = document.createElement("div");
        clearDiv.style.clear="both";

    this.codeResultsSaveHolder.appendChild(clearDiv);

    //insertAfter(this.codeResultsSave,myTaysCodeMirror);

    this.codeResults.parentNode.insertBefore(this.codeResultsSaveHolder, this.codeResults.nextSibling.nextSibling);

    //go ahead and show video if we are editing a video answer
    if(isEditing && editingAnswer.video_name){
        this.settupHelpVideo(editingAnswer.video_name);
    }

    this.myTaysCodeMirror.focus();


    }.bind(this));//done getting codemirror mode and loading needed script
    }.bind(this));//done guessing languages
}

commando.prototype.editAnswerStart = function(answer) {
    //so if we pass answe we are editing it

      this.injectScript('codemirror/lib/codemirror.js', 'body',function(){
               this.displayAnswerBox(answer);
               answer.myDom.style.display = "none";

      }.bind(this));

        //e.parentNode.removeChild(e);

     // makeRequest('POST', this.endpoint+"/delete.php?id="+id+"&u="+this.user_id).then(function(data){
     //     location.reload();
     // }.bind(this));
}

commando.prototype.deleteAnswer = function(id) {
        var r = confirm("Are you sure you want to delete this answer?");
        if (r == true) {
                makeRequest('POST', this.endpoint+"/delete.php?id="+id+"&u="+this.user_id).then(function(data){
                location.reload();
            }.bind(this));
        }    
}


commando.prototype.handleResultClick =function(event,that,url) {
           // var ct = new Date();
           // var clickTime = ct.getTime();
           // var message = {
           //       "action":"resultClickAction",
           //       "search":that.search,
           //       "search_time": that.currentTime,
           //       "element_url":url,
           //       "click_time":clickTime,
           //       "fallback":0,
           //       "results":that.resultsURLS
           // };


           // chrome.runtime.sendMessage(message); 
             //Q - Should we put a time limit on this?
             for(var i =0;i<this.answers.length;i++){
                 //todo: we currenlty don't have feedback for extra answers
                 if(this.answers[i].search_answer_result_id){
                makeRequest('POST', this.endpoint+"/feedback.php?vote=5&search_answer_result_id="+this.answers[i].search_answer_result_id+"&u="+this.user_id).then(function(data){});
                }
             }
              //sent a bad vote for both answers
              

}

commando.prototype.setUpResultsClickListener =function(that,element) {
        element.setAttribute("grepper-handle-result-click","1");
        element.addEventListener('click',function(event){
            that.handleResultClick(event,that,element.href);
        });
        element.addEventListener('contextmenu',function(event){
            that.handleResultClick(event,that,element.href);
        });

}
commando.prototype.setUpResultsClickListeners =function() {
    //updating this to all urls
    //var results = document.querySelectorAll("div#search div.g div.r>a");
  //var results = document.querySelectorAll("div#search div.g div.rc a");
  //for(var i=0;i<results.length;i++){
  //    this.setUpResultsClickListener(this,results[i]);
  //}

    //var results = document.querySelectorAll("div#search div.g div.s a");
    var results = document.querySelectorAll("div#search div.g a");
    for(var i=0;i<results.length;i++){
        this.setUpResultsClickListener(this,results[i]);
    }

    setTimeout(function(){
       // var results = document.querySelectorAll("div#search div.g div.r>a");
        //var results = document.querySelectorAll("div#search div.g div.rc a");
        var results = document.querySelectorAll("div#search div.g a");
        for(var i=0;i<results.length;i++){
            if(!results[i].getAttribute("grepper-handle-result-click")){
                this.setUpResultsClickListener(this,results[i]);
            }
        }
    }.bind(this), 1000);
}

commando.prototype.getAnswers2 =function() {

    //1. getting the results
  //var results = document.querySelectorAll("div#search div.g div.rc>a");
  //var results = document.querySelectorAll("div#search div.g>div.rc>div.yuRUbf>a");
    //var results = document.querySelectorAll("div#search div.g>div.tF2Cxc>div.yuRUbf>a");
    var results = document.querySelectorAll("div#search div.g div.yuRUbf>a");

  //only push unqique results,
  //be sure to always do this
  for(var i=0;i<results.length;i++){
    if(this.resultsURLS.indexOf(results[i].href) === -1){
        this.resultsURLS.push(results[i].href);
    }
  }

  /*
  var message = {
        "action":"pushHistorySearch",
        "search":this.search,
        "search_time": this.currentTime,
        "results":this.resultsURLS 
  };
  chrome.runtime.sendMessage(message); 
  */
    
    var postData={
        "results":this.resultsURLS,
        "search":this.search,
        "user_id":this.user_id
    };
    
  //2. get votes and try to get better results
    makeRequest('POST', this.endpoint+"/get_answers_2.php?v=2"+this.tifgrpr,JSON.stringify(postData)).then(function(r){

      var results=JSON.parse(r);
      //only display if we have new answers or more answers
      if(!results.answers.length && !results.more_answers.length){
        return;
      }

      this.displayResults2(results);
      this.moreAnswers= results.more_answers;

    //count how many extra answer we have
      var answerIds=[];
      for(var i=0;i<this.answers.length;i++){
         answerIds.push(this.answers[i].id);
      }
      for(var i=0;i<this.moreAnswers.length;i++){
         if(answerIds.indexOf(this.moreAnswers[i].id) === -1){
            this.moreAnswersTotalCount+=1;
         }
      }

     if(this.moreAnswersTotalCount > 0){
        this.doShowMoreAnswersButton();
     }

     //here 
     //currently copy feedback is not being sent for extra answers
     this.setupFeedBackListeners();

    }.bind(this));
 
}

commando.prototype.doShowMoreAnswersButton =function() {
    //we should remove me first if we exist
    var currentShowMoreButton = document.getElementById("tays_add_more_answers_button");
    if(currentShowMoreButton){
        currentShowMoreButton.parentNode.removeChild(currentShowMoreButton);    
    }

    this.showMoreAnswersButton = document.createElement("div");
    this.showMoreAnswersButton.setAttribute("id","tays_add_more_answers_button");
    this.showMoreAnswersButton.textContent="Show "+this.moreAnswersTotalCount+" More Grepper Results";

    this.statsDom.insertBefore(this.showMoreAnswersButton,this.statsDom.childNodes[this.statsDom.childNodes.length-1]);

    this.showMoreAnswersButton.addEventListener('click',function(){
        if(!this.moreResultsInitiated){
            this.displayResults3Init(this.moreAnswers);
            this.moreResultsInitiated=true;
        }
        this.toggleMoreAnswersShow();
    }.bind(this));
}


//run we we want to hide 
commando.prototype.toggleMoreAnswersShow=function(){
    this.showHideMoreAnswersButton.style.display="block";
    this.showMoreAnswersButton.style.display="none";
    for (var i = this.answers.length - 1; i >= 0; i--) {
         if(this.answers[i].isExtraAnswer){
            this.answers[i].myDom.style.display="block";
        }
     }

     this.setLastChildMargin();
}

//run we we want to show 
commando.prototype.toggleMoreAnswersHide=function(){
    this.showHideMoreAnswersButton.style.display="none";
    this.showMoreAnswersButton.style.display="block";
    for (var i = this.answers.length - 1; i >= 0; i--) {
         if(this.answers[i].isExtraAnswer){
            this.answers[i].myDom.style.display="none";
        }
     }
     this.setLastChildMargin();
}

//start video stuff
commando.prototype.showStopVideoButton =function() {
    this.stopVideoButton.style.display="block";
}
commando.prototype.hideStopVideoButton =function() {
    this.stopVideoButton.style.display="none";
}
commando.prototype.hideStartVideoButton =function() {
    this.startVideoButton.style.display="none";
}
commando.prototype.hideVideoDurationHelp =function() {
    this.maxVideoTimeButton.style.display="none";
}
commando.prototype.showVideoDurationHelp =function() {
    this.maxVideoTimeButton.style.display="block";
}




commando.prototype.deleteVideo =function() {
        this.helpVideo.src= "";
        this.uploadedVideoName=false;
        this.videoHolder.style.display="none";
        this.helpVideo.style.display="none";
        this.deleteVideoButton.style.display="none";
        this.makeCircleGrey();
        this.showCircle();
        this.showVideoDurationHelp();
        this.showStartVideoButton(false);
}

commando.prototype.showStartVideoButton =function(hasVideo) {
    if(hasVideo){
        this.startVideoButton.textContent = "Redo Recording";
        this.deleteVideoButton.style.display="block";
    }else{
        this.startVideoButton.textContent = "Start Recording";
        this.deleteVideoButton.style.display="none";
    }
    this.startVideoButton.style.display="block";
}

commando.prototype.stopRecording =function() {
    this.recorder.stop();
    var tracks = this.stream.getTracks();
    tracks.forEach(track => track.stop());
    this.stopTimer();
}

commando.prototype.displayVideoAnswer =function(videoURL,rawSource) {
    rawSource = typeof rawSource !== 'undefined' ? rawSource : false;
    if(rawSource){
        this.helpVideo.src=videoURL;
    }else{
    var answerVideoMP4Source = document.createElement("source");
        answerVideoMP4Source.setAttribute("type", "video/mp4");
        answerVideoMP4Source.setAttribute("src",videoURL+".mp4");

    var answerVideoWebMSource = document.createElement("source");
        answerVideoWebMSource.setAttribute("type", "video/webm");
        answerVideoWebMSource.setAttribute("src",videoURL+".webm");

        this.helpVideo.appendChild(answerVideoMP4Source);
        this.helpVideo.appendChild(answerVideoWebMSource);
    }


        this.helpVideo.style.display="block";
        this.showStartVideoButton(true);
        this.hideStopVideoButton();
        this.makeCircleGrey();
        this.hideCircle();
        this.hideVideoDurationHelp();
}

commando.prototype.completeStoppedRecording =function(e) {
        this.codeResultsSave.disabled=true;
        var videoURL = URL.createObjectURL(e.data);
        //this.helpVideoBlob=e.data;
        this.displayVideoAnswer(videoURL,true);

       var formData = new FormData();
        formData.append("help_video", e.data);

        makeRequest('POST', this.endpoint+"/upload_video.php",formData).then(function(r){
          var fullResult = JSON.parse(r);
            if(fullResult.success){
                this.uploadedVideoName = fullResult.uploaded_video_name;
            }
            this.codeResultsSave.removeAttribute("disabled");
        }.bind(this));
}


commando.prototype.stopTimer=function() {
    clearInterval(this.recodingTimer);
    this.recordCircleInner.textContent="";
}

commando.prototype.startTimer =function() {
    var seconds = 59;
    this.recodingTimer = setInterval(function(){
        this.recordCircleInner.textContent=seconds;
        seconds--;
        if(seconds < 0){
            this.stopRecording();
        }
    }.bind(this), 1000);
}

commando.prototype.makeCircleRed =function() {
    this.recordCircleOuter.style.border="2px solid red";
    this.recordCircleInner.style.background="red";
    this.startTimer();
    //start the timer
}
commando.prototype.makeCircleGrey =function() {
    this.recordCircleOuter.style.border="2px solid #777";
    this.recordCircleInner.style.background="#777777";
    //stop the timer
}
commando.prototype.hideCircle =function() {
    this.recordCircleOuter.style.display="none";
}
commando.prototype.showCircle =function() {
    this.recordCircleOuter.style.display="block";
}

commando.prototype.recordingStarted =function() {

       this.showStopVideoButton();
       this.hideStartVideoButton();
       this.makeCircleRed();
       this.showCircle();
       this.showVideoDurationHelp();
       this.helpVideo.style.display="none";
       this.deleteVideoButton.style.display="none";

 };

commando.prototype.startRecording =function() {
    var that=this;
    var video_track;
    var audio_track; 

navigator.mediaDevices.getDisplayMedia({audio:false,video:true}).then(function (video_stream) {
  navigator.mediaDevices.getUserMedia({audio:true,video:false}).then(function (audio_stream) {
    
        [video_track] = video_stream.getVideoTracks();
        [audio_track] = audio_stream.getAudioTracks();

        video_track.onended = function(){
            that.stopRecording();
        }

        that.stream = new MediaStream([video_track, audio_track]);
            //mimeType : 'video/webm'
         var options = {
            mimeType : 'video/webm'
        };
        that.recorder = new MediaRecorder(that.stream,options);
        that.recorder.start();
        that.recordingStarted();

        that.recorder.addEventListener('dataavailable', function(e){
            that.completeStoppedRecording(e);
        });
  }).catch(function(error){
     //stop the display media
    video_stream.getTracks().forEach(track => track.stop());
    if(error.name =="NotAllowedError"){
        alert("Oops! Chrome can't access your microphone. Click the microphone or camera icon on the right side of your url bar and allow access.");
    }else{
       alert("Oops! Something is off and we can't screen record at this time. Please let us know at support@codegrepper.com");
    }
  });
}).catch(function(error){
    if(error.name =="NotAllowedError"){
        alert("Oops! Chrome does not have access to screen record. Go to System Preferences > Security & Privacy > Privacy > Screen Recording > Check the Chrome checkbox");
    }else{
       alert("Oops! Something is off and we can't screen record at this time. Please let us know at support@codegrepper.com");
    }
});

};


commando.prototype.settupHelpVideo =function(video_name) {

     video_name = typeof video_name !== 'undefined' ? video_name : false;

    if(this.videoHolder){
        this.videoHolder.style.display="block";
        return;
    }


    this.maxVideoTimeButton = document.createElement("div");

    this.maxVideoTimeButton.setAttribute('style', 'white-space: pre;');
    this.maxVideoTimeButton.textContent="Keep it short! Max video duration is 60 seconds.\r\n Note: Use screen recordings for technical queries that can not be answered with a code snippet.";
    this.maxVideoTimeButton.setAttribute("id","commando_max_video_time");
 

    this.startVideoButton = document.createElement("button");
    this.startVideoButton.textContent="Start Recording";
    this.startVideoButton.setAttribute("id","commando_start_recording_button");
    this.startVideoButton.addEventListener('click',function(){
        this.startRecording();
      }.bind(this));

    //stop video button
    this.stopVideoButton = document.createElement("button");
    this.stopVideoButton.textContent="Stop Recording";
    this.stopVideoButton.setAttribute("id","commando_stop_recording_button");
    this.stopVideoButton.addEventListener('click',function(){
        this.stopRecording();
    }.bind(this));

    //Delete/Remove Video Button
    this.deleteVideoButton = document.createElement("a");
    this.deleteVideoButton.textContent="Remove/Delete Video";
    this.deleteVideoButton.setAttribute("id","commando_delete_video_button");
    this.deleteVideoButton.addEventListener('click',function(){
        this.deleteVideo();
    }.bind(this));

    this.recordCircleOuter = document.createElement("div");
    this.recordCircleOuter.setAttribute("id","grepper_record_outer_circle");

    this.recordCircleInner = document.createElement("div");
    this.recordCircleInner.setAttribute("id","grepper_record_inner_circle");
    this.recordCircleOuter.appendChild(this.recordCircleInner);

    this.helpVideo = document.createElement("video");
    this.helpVideo.setAttribute("controls","");
    this.helpVideo.classList.add("grepper_video_element");

    this.videoHolder = document.createElement("div");
    this.videoHolder.setAttribute("id","grepper_video_answer_holder");

    this.videoHolder.appendChild(this.maxVideoTimeButton);
    this.videoHolder.appendChild(this.recordCircleOuter);
    this.videoHolder.appendChild(this.helpVideo);
    this.videoHolder.appendChild(this.startVideoButton);
    this.videoHolder.appendChild(this.stopVideoButton);
    this.videoHolder.appendChild(this.deleteVideoButton);

    this.codeResults.parentNode.insertBefore(this.videoHolder, this.codeResultsSaveHolder);

    if(video_name){
        this.displayVideoAnswer(this.web_endpoint+"/video_uploads/"+video_name);
        this.uploadedVideoName = video_name;
    }

}
//end video stuff

commando.prototype.displayResult =function(answer) {

        var answer_id=answer.id;

        var codeResults = document.createElement("code");
            codeResults.textContent=answer.answer;
            codeResults.classList.add("commando_code_block");

            var languageGuess="javascript";
            if(answer.language){
                languageGuess=answer.language;
            }
            codeResults.classList.add("language-"+languageGuess);

        var codeResultsPre = document.createElement("pre");
            codeResultsPre.classList.add("language-"+languageGuess);
            codeResultsPre.appendChild(codeResults);
            codeResultsPre.classList.add("commando_selectable");
            
        var codeResultsOuter = document.createElement("div");
            codeResultsOuter.classList.add("commando_code_block_outer");

         var answerOptionsHolder= document.createElement("div");
             answerOptionsHolder.classList.add("commando_answers_options_holder");


        var answerOptionsTitle= document.createElement("div");
            answerOptionsTitle.classList.add("grepper_answers_options_title");
            //answerOptionsTitle.textContent="“"+answer.term+"”";
            answerOptionsTitle.textContent=answer.term;
            answerOptionsTitle.title=answer.term;


        var answerOptionsNickname= document.createElement("span");
            answerOptionsNickname.classList.add("commando_answers_options_nickname");



            var t = answer.created_at.split(/[- :]/);
            var d = new Date(Date.UTC(t[0], t[1]-1, t[2], t[3], t[4], t[5]));
            var formattedDate=dateToNiceDayString(d);


           var noteHTML= document.createElement("i");

           var userProfileLink= document.createElement("a");
               userProfileLink.target="_blank";
               userProfileLink.href="https://www.codegrepper.com/app/profile.php?id="+answer.user_id;

           var dateOnSpan= document.createElement("i");
               dateOnSpan.textContent = " on "+formattedDate+" ";

               noteHTML.textContent=this.getLanguageFriendlyName(answer.language)+" By ";
               if(this.user_id == answer.user_id){
                 userProfileLink.textContent = "Me ("+jsUcfirst(answer.fun_name)+")";
               }else{
                 userProfileLink.textContent = jsUcfirst(answer.fun_name);
               }

             noteHTML.appendChild(userProfileLink);
             noteHTML.appendChild(dateOnSpan);




            answerOptionsNickname.appendChild(noteHTML);


              if(answer.donate_link){

                    var donateButton= document.createElement("a");
                        donateButton.target="_blank";
                        donateButton.href=answer.donate_link;
                        donateButton.textContent="Donate";

                      //noteHTML+=" <a target='_blank' href='"++"'>Donate</a>";

                answerOptionsNickname.appendChild(donateButton);
              };


            answerOptionsHolder.appendChild(answerOptionsTitle);
            answerOptionsHolder.appendChild(answerOptionsNickname);
                if(parseInt(answer.user_id) === parseInt(this.user_id)){

                    if(localStorage.getItem("grepper_access_token")){
                    var answerOptionsDelete=document.createElement("span");
                        answerOptionsDelete.classList.add("commando_answers_options_delete");
                        answerOptionsDelete.textContent="Delete";
                        answerOptionsDelete.addEventListener('click',function(){
                            this.deleteAnswer(answer.id);
                        }.bind(this));

                          answerOptionsHolder.appendChild(answerOptionsDelete);
                      var answerOptionsEdit=document.createElement("span");
                            answerOptionsEdit.classList.add("commando_answers_options_edit");
                            answerOptionsEdit.textContent="Edit";
                            answerOptionsEdit.addEventListener('click',function(){
                                this.editAnswerStart(answer);
                            }.bind(this));

                        answerOptionsHolder.appendChild(answerOptionsEdit);
                    }

                }

            codeResultsOuter.appendChild(answerOptionsHolder);
            codeResultsOuter.appendChild(codeResultsPre);

        //video
        if(answer.video_name){
            var answerVideo = document.createElement("video");
                answerVideo.setAttribute("controls","");
                answerVideo.classList.add("grepper_answer_video_element");
            var answerVideoMP4Source = document.createElement("source");
                answerVideoMP4Source.setAttribute("type", "video/mp4");
                answerVideoMP4Source.setAttribute("src",this.web_endpoint+"/video_uploads/"+answer.video_name+".mp4");
            var answerVideoWebMSource = document.createElement("source");
                answerVideoWebMSource.setAttribute("type", "video/webm");
                answerVideoWebMSource.setAttribute("src",this.web_endpoint+"/video_uploads/"+answer.video_name+".webm");

                answerVideo.appendChild(answerVideoMP4Source);
                answerVideo.appendChild(answerVideoWebMSource);
                codeResultsOuter.appendChild(answerVideo);
        }
            
           //source 
          var sourceURLHolder= document.createElement("div");
              sourceURLHolder.setAttribute("id","grepper_source_holder");
              sourceURLHolder.textContent = "Source:"

                var sourceURL= document.createElement("a");
                    sourceURL.target="_blank";
                    sourceURL.href=answer.source_url;
                    sourceURL.textContent = sourceURL.hostname;
                    //noteHTML+=" <a target='_blank' href='"++"'>Donate</a>";

              sourceURLHolder.appendChild(sourceURL);

              //answerOptionsNickname.appendChild(donateButton);

              if(answer.source_url && this.isValidSource(answer.source_url)){
                codeResultsOuter.appendChild(sourceURLHolder);
              }

            //no, voting for now
          var commandoVotingHolder= document.createElement("div");
              commandoVotingHolder.classList.add("commando-voting-holder");
          var upvote= document.createElement("div");
              upvote.classList.add("arrow-up");
              upvote.setAttribute("answer_id",answer.id);
              upvote.addEventListener('click', this.doUpvote.bind(this,event,answer));
              if(answer.i_upvoted == 1){
                upvote.classList.add("commando_voted");
               }

      

          var voteNumber= document.createElement("div");
              voteNumber.classList.add("commando-voting-number");
              voteNumber.textContent=(answer.upvotes-answer.downvotes);

          var downvote= document.createElement("div");
              downvote.classList.add("arrow-down");

              downvote.addEventListener('click', this.doDownvote.bind(this,event,answer));
              if(answer.i_downvoted == 1){
                downvote.classList.add("commando_voted");
              }


        //team image
        if(answer.is_my_team){

          var teamImageA= document.createElement("a");
              teamImageA.href="https://www.codegrepper.com/app/team.php?id="+answer.team_id;
              teamImageA.title=answer.team_name+" Team Answer";
              teamImageA.target="_blank";

          var teamImage= document.createElement("img");
              teamImage.src="https://www.codegrepper.com/team_images/50_50/"+answer.team_profile_image;
              teamImage.classList.add("grepper_team_answer_image");

              teamImageA.appendChild(teamImage);
              codeResultsOuter.appendChild(teamImageA);
        }
        //video

       


          commandoVotingHolder.appendChild(upvote);
          commandoVotingHolder.appendChild(voteNumber);
          commandoVotingHolder.appendChild(downvote);
          codeResultsOuter.appendChild(commandoVotingHolder);
          
         

          
          answer.downvote=downvote;
          answer.upvote=upvote;
          answer.voteNumber=voteNumber;
          answer.codeResults=codeResults;
          answer.myDom=codeResultsOuter;

        this.statsDom.insertBefore(codeResultsOuter,this.statsDom.childNodes[this.statsDom.childNodes.length-1]);
}

commando.prototype.displayProduct =function(i,product) {
  var productDom = document.createElement("div");
      productDom.classList.add("grepper_product_result");

            if(i==0){
                  productDom.classList.add("grepper_first_child");
            }

          var commandoVotingHolder= document.createElement("div");
              commandoVotingHolder.classList.add("grepper_product_voting_holder");
            
          var upvote= document.createElement("div");
              upvote.classList.add("arrow-up");
              upvote.setAttribute("answer_id",product.id);
              upvote.addEventListener('click', this.doProductUpvote.bind(this,event,product));
              if(product.i_upvoted == 1){
                upvote.classList.add("commando_voted");
               }

      

          var voteNumber= document.createElement("div");
              voteNumber.classList.add("commando-voting-number");
              voteNumber.textContent=(product.upvotes-product.downvotes);

          var downvote= document.createElement("div");
              downvote.classList.add("arrow-down");

              downvote.addEventListener('click', this.doProductDownvote.bind(this,event,product));
              if(product.i_downvoted == 1){
                downvote.classList.add("commando_voted");
              }


            commandoVotingHolder.appendChild(upvote);
            commandoVotingHolder.appendChild(voteNumber);
            commandoVotingHolder.appendChild(downvote);

      var productImage = document.createElement("img");
          productImage.src = product.image;

      var productImageLink = document.createElement("a");
          productImageLink.href=this.endpoint+"/visit-product.php?goto="+product.name+"&r="+product.product_result_id;
          productImageLink.target="_blank";
          productImageLink.title="Visit "+product.name;

          productImageLink.appendChild(productImage);

          
          productDom.appendChild(productImageLink);

          productDom.appendChild(commandoVotingHolder);

          this.productsResultHolder.appendChild(productDom); 
}

commando.prototype.displayProducts =function() {
    if(!this.products.length){ return; }

      this.productsResultHolder = document.createElement("div");
      this.productsResultHolder.setAttribute("id","grepper_products_results_holder");

      var productResultsTitleHolder = document.createElement("div");
          productResultsTitleHolder.classList.add("grepper_products_title_holder");

       var productResultsTitleLeft = document.createElement("div");
           productResultsTitleLeft.textContent ="Grepper Rankings for “"+this.search+"”";
           productResultsTitleLeft.classList.add("grepper_products_title_left");

       var productResultsTitleRight = document.createElement("div");
           productResultsTitleRight.textContent ="Product Feedback by ";
           productResultsTitleRight.classList.add("grepper_products_title_right");


       var productResultsTitleRightCommunity = document.createElement("a");
           productResultsTitleRightCommunity.href="https://www.codegrepper.com/app/index.php";
           productResultsTitleRightCommunity.target="_blank";
           productResultsTitleRightCommunity.textContent="Grepper Dev Community";

           productResultsTitleRight.appendChild(productResultsTitleRightCommunity);

       var productResultsTitleRightCommunitySpace = document.createElement("span");
           productResultsTitleRightCommunitySpace.textContent=" - ";
           productResultsTitleRight.appendChild(productResultsTitleRightCommunitySpace);


       var productResultsTitleRightCommunityLearnMore = document.createElement("a");
           productResultsTitleRightCommunityLearnMore.href="https://www.codegrepper.com/grepper_products_system.php";
           productResultsTitleRightCommunityLearnMore.target="_blank";
           productResultsTitleRightCommunityLearnMore.textContent="Learn more";
           productResultsTitleRight.appendChild(productResultsTitleRightCommunityLearnMore);




        var clearBoth = document.createElement("div");
           clearBoth.classList.add("grepper_clear_both");



       productResultsTitleHolder.appendChild(productResultsTitleLeft);
       productResultsTitleHolder.appendChild(productResultsTitleRight);
       productResultsTitleHolder.appendChild(clearBoth);
       this.productsResultHolder.appendChild(productResultsTitleHolder);

      this.statsDom.prepend(this.productsResultHolder);

   for(let i=0;i<this.products.length;i++){
      this.displayProduct(i,this.products[i]);
   }

}
//this runt the first time around
commando.prototype.displayResults =function() {
      for(let i=0;i<this.answers.length;i++){
            this.displayResult(this.answers[i]);
       }

      this.setLastChildMargin();
      Prism.highlightAll();
      this.showAddAnswerButton();
    
     //also set up more answers stuff
     //count how many extra answer we have
      var answerIds=[];
      for(var i=0;i<this.answers.length;i++){
         answerIds.push(this.answers[i].id);
      }
      for(var i=0;i<this.moreAnswers.length;i++){
         if(answerIds.indexOf(this.moreAnswers[i].id) === -1){
            this.moreAnswersTotalCount+=1;
         }
      }

     if(this.moreAnswersTotalCount > 0){
        this.doShowMoreAnswersButton();
     }

     if(this.answers.length > 0){
           this.setupCopyListener();
     }
   
     //currently copy feedback is not being sent for extra(more) answers
    this.setupFeedBackListeners();
    this.setupScrollOverflowDownClick();
}

//and the second results are here
commando.prototype.displayResults2 =function(results) {
     var answerIds=[];
     for(var i=0;i<this.answers.length;i++){
         answerIds.push(this.answers[i].id);
     }

     for(var i=0;i<results.answers.length;i++){
         if(answerIds.indexOf(results.answers[i].id) === -1){
            this.answers.push(results.answers[i]);    
            this.displayResult(results.answers[i]);
         }
     }

     this.setLastChildMargin();

     Prism.highlightAll();
     if(this.answers.length > 0){
           this.setupCopyListener();
     }

     //this.doneLoadingAnswersDom=true;
     this.setupScrollOverflowDownClick();
}

commando.prototype.setupScrollOverflowDownClickForAnswer =function(answer) {
    //blocker to prevent duplicates
    var hasOverflowDownAlready = answer.myDom.getElementsByClassName("tays_show_more_answer_button_show");
    if(hasOverflowDownAlready.length){
        return;
    }

   let codeDom= answer.myDom.querySelector("pre code"); 
         //229 is 11 lines 250 is 12 lines
         //Im going to user 235 to be sure it is > 11 lines
    let hasVerticalScrollbar = codeDom.scrollHeight > 235;
        if(hasVerticalScrollbar){
        let showMoreAnswer = document.createElement("div");
            showMoreAnswer.classList.add("tays_show_more_answer_button_show");
            //showMoreAnswer.textContent="Show";

            let codePreDom= answer.myDom.querySelector("pre"); 

            //this.answers[i].myDom.appendChild(showMoreAnswer);
            insertAfter(showMoreAnswer,codePreDom);


            //remove margin from bottom
            codePreDom.style.marginBottom = "0px"; 

            showMoreAnswer.addEventListener('click',function(){
                //codePreDom.style.marginBottom = "1em"; 
                if(codeDom.style.maxHeight != "none"){
                    showMoreAnswer.classList.add("tays_show_more_answer_button_hide");
                    showMoreAnswer.classList.remove("tays_show_more_answer_button_show");
                    codeDom.style.maxHeight = "none"; 
                }else{
                    showMoreAnswer.classList.add("tays_show_more_answer_button_show");
                    showMoreAnswer.classList.remove("tays_show_more_answer_button_hide");
                    codeDom.style.maxHeight = "224px"; 
                    
                }

            }.bind(this));
                        
        }
}

commando.prototype.setupScrollOverflowDownClick =function() {
 for(let i=0;i<this.answers.length;i++){
     this.setupScrollOverflowDownClickForAnswer(this.answers[i]);
 }
}

commando.prototype.setLastChildMargin =function() {

     for(var i=0;i<this.answers.length;i++){
        this.answers[i].myDom.classList.remove("grepper_last_normal_answer");
     }

     for (var i = this.answers.length - 1; i >= 0; i--) {
         if(this.answers[i].myDom.style.display !="none"){
            this.answers[i].myDom.classList.add("grepper_last_normal_answer");
            return;
         }
     }
}

commando.prototype.displayResults3Init =function(answers) {
     let answerIds=[];
     for(let i=0;i<this.answers.length;i++){
         answerIds.push(this.answers[i].id);
     }

     for(let i=0;i<answers.length;i++){
         if(answerIds.indexOf(answers[i].id) === -1){
            answers[i].isExtraAnswer=true;
            this.answers.push(answers[i]);    
            this.displayResult(answers[i]);
            this.setupScrollOverflowDownClickForAnswer(answers[i]);
         }
     }

    this.showHideMoreAnswersButton = document.createElement("div");
    this.showHideMoreAnswersButton.setAttribute("id","tays_add_more_answers_button_hide");
    this.showHideMoreAnswersButton.textContent="Hide "+this.moreAnswersTotalCount+" More Grepper Results";

    this.showHideMoreAnswersButton.addEventListener('click',function(){
        this.toggleMoreAnswersHide();
    }.bind(this));

    this.statsDom.insertBefore(this.showHideMoreAnswersButton,this.statsDom.childNodes[this.statsDom.childNodes.length-1]);

    this.setLastChildMargin();
    Prism.highlightAll();

  // if(this.answers.length > 0){
  //       this.setupCopyListener();
  // }
}


commando.prototype.showAddAnswerButton =function() {
    var resultStats = document.getElementById("resultStats");
    if(!resultStats){
        resultStats = document.getElementById("result-stats");
    }
    if(!resultStats){
        resultStats = document.getElementById("mBMHK");
    }

    var addAnswerButton = document.createElement("a");

     //if we use top nave we need to add special style
    if(!resultStats){
        resultStats = document.getElementById("appbar");
        if(resultStats){
            //addAnswerButton.classList.add("grepper_add_answer_button_in_top_nav");
            addAnswerButton.style.display="inline-block";
            addAnswerButton.style.left = "666px";
            addAnswerButton.style.top = "-18px";
            addAnswerButton.style.position="relative";
        }
    }


        addAnswerButton.textContent="<< Add Grepper Answer (a)";
        addAnswerButton.classList.add("commando_add_answer_button");
        addAnswerButton.setAttribute("id","grepper_add_answer_button");
        addAnswerButton.addEventListener('click',function(){
            //when we click the button we need to load codemirror, then we can display the answer bocx
            this.injectScript('codemirror/lib/codemirror.js', 'body',function(){
               this.displayAnswerBox();
            }.bind(this));

        }.bind(this));
        if(resultStats){
            resultStats.appendChild(addAnswerButton);
        }
        //after we show answer we do this
        //removing this for now uncomment to add bounnty back in


}


//  commando.prototype.changeEditorBoxLanguage = function(l){
//      this.myTaysCodeMirror.setOption("mode", this.languangeNametoTaysCodeMirrorName(l));
//  }

commando.prototype.getLanguageFriendlyName =function(l){
    var options=getAllLanguages();
    return options[l].name;
 // for(var i=0;i<options.length;i++){
 //     if(l===options[i].lkey){
 //        return options[i].name;
 //     }
 // }
 // return 'whatever';
}

commando.prototype.languageToSelect =function(l){
    this.editorCurrentLanguageSelect  = document.createElement('select');
    this.editorCurrentLanguageSelect.setAttribute("id","languange_guess_display");

    this.editorCurrentLanguageSelect.addEventListener('change',function(){
        var l=this.editorCurrentLanguageSelect.value;
        this.languangeNametoTaysCodeMirrorName(l,function(mimeType){
            this.myTaysCodeMirror.setOption("mode", mimeType);
        }.bind(this));
    }.bind(this));
    
    getLanguageSelectOptions(function(options){
        for (var key in options) {
              var opt = document.createElement('option');
                opt.value = key;
                opt.textContent = options[key];
                if(l===key){
                    opt.setAttribute("selected", "selected");
                }
                this.editorCurrentLanguageSelect.appendChild(opt);
        }
    }.bind(this));
}


commando.prototype.startsWith=function(str,word){
    return str.lastIndexOf(word, 0) === 0;
}

commando.prototype.isValidSource=function(str){
  if(!str){return false;}
  if(!this.startsWith(str,"http://") && !this.startsWith(str,"https://")){
        return false;    
  }
  var res = str.match(/(http(s)?:\/\/.)?(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/g);
  return (res !== null);
}

commando.prototype.maxLength=function(str,length){
    return str.length > length ? str.substring(0, length) + "..." : str;
}

commando.prototype.showNeedsPaymentBox=function(subExpiredText){
 var that=this;
 var taysPopup = document.createElement("div");
     taysPopup.classList.add("tays_popup")
     taysPopup.setAttribute("id","grepper-editor");
 var taysPopupInner = document.createElement("div");
     taysPopupInner.classList.add("tays_popup_inner")

var  taysPopupTextAreaHolder = document.createElement("div");
     taysPopupTextAreaHolder.classList.add("tays_popup_textarea_holder")

 var taysPopupCloseButton = document.createElement("div");
     taysPopupCloseButton.classList.add("tays_popup_close_button")
     taysPopupCloseButton.textContent="X";
     taysPopupCloseButton.addEventListener('click',function(){
         that.closeEditor();
     });
 var taysPopupHeader1 = document.createElement("div");
     taysPopupHeader1.classList.add("tays_popup_header1")
     taysPopupHeader1.textContent="Your Grepper Free Trial is Up!";
var taysPopupHeader2 = document.createElement("div");
     taysPopupHeader2.classList.add("grepper_buy_time_text")
     taysPopupHeader2.textContent=subExpiredText;


var taysPopupHeader3_holder = document.createElement("div");
    taysPopupHeader3_holder.classList.add("grepper_buy_time_button_holder")

 var taysPopupHeader3 = document.createElement("a");
     taysPopupHeader3.classList.add("grepper_activate_full_button")
     taysPopupHeader3.textContent="Activate Grepper Full »";
     taysPopupHeader3.href="https://www.codegrepper.com/checkout/checkout.php";
     taysPopupHeader3.target="_blank";


    taysPopupTextAreaHolder.appendChild(taysPopupHeader1);
    taysPopupTextAreaHolder.appendChild(taysPopupHeader2);
    taysPopupHeader3_holder.appendChild(taysPopupHeader3);
    taysPopupTextAreaHolder.appendChild(taysPopupHeader3_holder);
    taysPopupInner.appendChild(taysPopupCloseButton);
    taysPopupInner.appendChild(taysPopupTextAreaHolder)
    taysPopup.appendChild(taysPopupInner);
    document.body.appendChild(taysPopup);

}

commando.prototype.closeEditor=function(){
    var editor=  document.getElementById("grepper-editor");
    editor.parentNode.removeChild(editor);
}


//inject another js file from content script
//this will only load a script once
commando.prototype.injectScript = function(file, node ,callback) {
  if(this.loadedCodeMirrorModes.indexOf(file) === -1){
      this.loadedCodeMirrorModes.push(file);
      var message = { "action":"runContentScript", "file":file };
      chrome.runtime.sendMessage(message, function(response) {
          if(response.done) {
             callback(); 
          }
      });
   }else{
       callback();    
   }

}

commando.prototype.loadMyMoreResults=function(others){
  return new Promise(function (resolve, reject) {

   var postData={
        "results":this.resultsURLS,
        "search":this.search,
        "user_id":this.user_id
    };
    makeRequest('POST', this.endpoint+"/get_more_answers.php?others="+others+this.tifgrpr,JSON.stringify(postData)).then(function(r){
      var fullResult = JSON.parse(r);
      var results = fullResult.answers;
      //we just add one answer to current results 
      var answerIds=[];
      for(var i=0;i<this.answers.length;i++){
         answerIds.push(this.answers[i].id);
      }

      for(var i=0;i<this.moreAnswers.length;i++){
         answerIds.push(this.moreAnswers[i].id);
      }
        
     //push up to 2 moreResults onto answers
      for(var i =0;i<results.length;i++){
         if(this.answers.length >= 2 ){break;}
         if(answerIds.indexOf(results[i].id) === -1){
             results[i].isRequestedExtraAnswer=true;
             this.answers.push(results[i]);
             answerIds.push(results[i].id);
            this.displayResult(results[i]);
         }
      }
      this.setLastChildMargin();
     
     //push the rest onto more answers 
      for(var i =0;i<results.length;i++){
         if(answerIds.indexOf(results[i].id) === -1){
             results[i].isRequestedExtraAnswer=true;
             this.moreAnswers.push(results[i]);
             answerIds.push(results[i].id);
            this.moreAnswersTotalCount+=1;
         }
      }

        Prism.highlightAll();

        this.setupScrollOverflowDownClick();

        if(this.moreAnswersTotalCount > 0){
            this.doShowMoreAnswersButton();
        }
        
        //this.setupFeedBackListeners();//this is for sending feedback on copy, needs blocker

        resolve();
    }.bind(this));
  }.bind(this));

}

commando.prototype.guessCodeLanguage=function(callback){

    var term =this.search;
    var allTerms = getLangaugeSearchTerms();
    var allPossibleTerms= [];

     getLanguageSelectOptions(function(options){
         for(var i =0;i< allTerms.length;i++){
            if((typeof options[allTerms[i].name]) !== 'undefined'){
                allPossibleTerms.push(allTerms[i]);        
            }    
         }

         //now try to find the answer
         for(var i =0;i< allPossibleTerms.length;i++){
             for(var j =0;j< allPossibleTerms[i].terms.length;j++){
                if( (term.toLowerCase().indexOf(allPossibleTerms[i].terms[j]+" ") !== -1) || (term.toLowerCase().indexOf(" "+allPossibleTerms[i].terms[j]) !== -1)) {
                    callback(allPossibleTerms[i].name); return;
                }
             }  
         }

        callback('whatever'); return;
    }.bind(this));
    
}


function insertAfter(newNode, referenceNode) {
    referenceNode.parentNode.insertBefore(newNode, referenceNode.nextSibling);
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

function makeRequest (method, url, data, dontSendAuthHeaders) {

    dontSendAuthHeaders = (typeof dontSendAuthHeaders !== 'undefined') ?  dontSendAuthHeaders : false;

    var id = localStorage.getItem('grepper_user_id');
    var token  = localStorage.getItem('grepper_access_token'); 


  return new Promise(function (resolve, reject) {
    var xhr = new XMLHttpRequest();
    xhr.open(method, url);

    if(!dontSendAuthHeaders){
        if(typeof id !=='undefined'){
            xhr.setRequestHeader("x-auth-id", id);   
        }
        if(typeof token !=='undefined'){
            xhr.setRequestHeader("x-auth-token", token);   
        }
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

function jsUcfirst(string) {
    if(isNullString(string)){
            return '';
    }
   
    return string.charAt(0).toUpperCase() + string.slice(1);
}



function isNullString(str) {
    return (!str || 0 === str.length);
}

 
//usage ex: alert(dateToNiceDayString(new Date());
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
//the values here should be code mirror values


function getLangaugeSearchTerms(){
    var terms=[
        {"name":"php","terms":["php"]},
        {"name":"javascript","terms":["javascript","js","java script","javscript"]},
        {"name":"typescript","terms":["typescript","ts","type script"]},
        {"name":"css","terms":["css"]},
        {"name":"html","terms":["html"]},
        {"name":"sql","terms":["sql","mysql"]},
        {"name":"java","terms":["java"]},
        {"name":"python","terms":["python"]},
        {"name":"cpp","terms":["cpp","c++"]},
        {"name":"shell","terms":["linux","shell","install","git","ubuntu","upgrade"]},
        {"name":"objectivec","terms":["objectivec","objective c","obj c","objc"]},
        {"name":"swift","terms":["swift"]},
        {"name":"csharp","terms":["c#","csharp","c #","c sharp"]},
        {"name":"ruby","terms":["ruby"]},
        {"name":"kotlin","terms":["kotlin"]},
        {"name":"javascript","terms":["jquery","viewjs","json","angular","express","redux","ajax","node","node js","node.js","nodejs","electron","reactjs","react js","react"]},
        {"name":"python","terms":["django","pandas","flask"]},
        {"name":"php","terms":["laravel"]},
        {"name":"csharp","terms":["asp.net","asp .net","asp net",".net"]},
        {"name":"ruby","terms":["rails"]},
        {"name":"assembly","terms":["assembly"]},
        {"name":"scala","terms":["scala"]},
        {"name":"dart","terms":["dart"]},
        {"name":"elixir","terms":["elixir"]},
        {"name":"clojure","terms":["clojure"]},
        {"name":"webassembly","terms":["webassembly","web assembly"]},
        {"name":"fsharp","terms":["fsharp","f#","f #","f sharp"]},
        {"name":"erlang","terms":["erlang"]},
        {"name":"matlab","terms":["matlab","mat lab"]},
        {"name":"fortran","terms":["fortran"]},
        {"name":"perl","terms":["perl"]},
        {"name":"groovy","terms":["groovy"]},
        {"name":"julia","terms":["julia"]},
        {"name":"prolog","terms":["prolog"]},
        {"name":"pascal","terms":["pascal"]},
        {"name":"postscript","terms":["postscript","post script"]},
        {"name":"smalltalk","terms":["smalltalk"]},
        {"name":"actionscript","terms":["actionscript","action script"]},
        {"name":"basic","terms":["basic"]},
        {"name":"lisp","terms":["lisp"]},
        {"name":"abap","terms":["abap"]},
        {"name":"delphi","terms":["delphi"]},
        {"name":"vb","terms":["visual basic","vb.net","vb net"]},
        {"name":"lua","terms":["lua"]},
        {"name":"go","terms":["go"]}
   ]; 

    return terms;
}


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

function getLanguageSelectOptions(callback) {
    //var options=getAllLanguages();
    chrome.storage.sync.get(['grepper_user_langs'], function(all_items) {
        if(!all_items.grepper_user_langs){
            var items=getAllLanguages();
            //set if its not set
            chrome.storage.sync.set({grepper_user_langs:items }, function() {});
        }else{
            var items=all_items.grepper_user_langs;
        }
        var myOptions={};
        for (var key in items) {
            if(items[key].enabled){
                myOptions[key]=items[key].name;
            }
        } 
        callback(myOptions);
    });

}

var co=new commando();
co.init();
