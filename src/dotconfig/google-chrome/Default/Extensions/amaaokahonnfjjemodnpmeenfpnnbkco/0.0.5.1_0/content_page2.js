

//return array of buttons, hopefully just one
function getGrepperButtonElementFromSelection(){
    var selection = window.getSelection();
    if(selection.rangeCount > 0){
      var parentNode=selection.getRangeAt(0).startContainer.parentNode;
      return findGrepperOpenButtonsInNode(parentNode); 
    }
    return [];
}

function findGrepperOpenButtonsInNode(e){
    var buttons=e.querySelectorAll('.open_grepper_editor');
    if(buttons.length > 0){
        return buttons;
    }else{
        //not found
        if(!e.parentNode){
            return [];
        }
        return findGrepperOpenButtonsInNode(e.parentNode);    
    }
}



function grepperInjectScript(file, node) {
    var th = document.getElementsByTagName(node)[0];
    var s = document.createElement('script');
    s.setAttribute('type', 'text/javascript');
    s.setAttribute('src', file);
    th.appendChild(s);
}

function makeRequest (method, url, data, id , token) {

// var id = localStorage.getItem('grepper_user_id');
// var token  = localStorage.getItem('grepper_access_token'); 


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


function grepperPage(hideIcons) {
  //this.endpoint="https://staging.codegrepper.com/api";
  this.endpoint="https://www.codegrepper.com/api";
  this.codeSearch={};
  this.user_id='';
  this.access_token='';
  this.lastSavedTime=false;
  this.lastSavedSelection=false;
  this.currentEditorLanguage="whatever";
  this.showingEditor=false;
  this.fastLoad = false;
  this.loadedCodeMirrorModes=[];
  this.hideIcons=hideIcons;
}

grepperPage.prototype.startsWith=function(str,word){
    return str.lastIndexOf(word, 0) === 0;
}


grepperPage.prototype.waitForCompleteReadyState=function(){
 //note:highlight js on SO breaks our snag button, so we need to load it after highlight js 
    var sites=[
        "https://stackoverflow.com"
     ];
    for(var i=0;i<sites.length;i++){
        if(this.startsWith(window.location.href,sites[i])){
            return true;     
        }   
    }
    return false;
}
grepperPage.prototype.isFastLoad=function(){
    var sites=[
        "https://developer.mozilla.org",
        "https://interactive-examples.mdn.mozilla.net",
        "https://www.geeksforgeeks.org",
        "https://jsfiddle.net/",
        "https://www.w3schools.com"
    ];
    for(var i=0;i<sites.length;i++){
        if(this.startsWith(window.location.href,sites[i])){
            return true;     
        }   
    }
    return false;
}




grepperPage.prototype.showGrepperAnswerSavedDialog=function(){

     var dialog = document.createElement("div");
     dialog.setAttribute("id","grepper_flash_message");
     dialog.textContent="Grepper Answer Saved!";
     document.body.appendChild(dialog);

  setTimeout(function(){ 
    dialog.parentNode.removeChild(dialog);
  },2000);
}

grepperPage.prototype.guessCodeLanguage=function(){

    var term =this.codeSearch.search;
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
                    this.currentEditorLanguage = allPossibleTerms[i].name;  return;
                }
             }  
         }

        this.currentEditorLanguage = 'whatever';  return;

    }.bind(this));
    
}

grepperPage.prototype.init=function(){
    this.getCodeSearch().then(function(){
        if(this.codeSearch){
           this.guessCodeLanguage();

           this.getUserId().then(function(){
            this.setupCopyListener();
           }.bind(this));
            
           if(!this.hideIcons){
                if(this.isFastLoad()){
                   this.fastLoad = true;
                   this.setupGrepperCodeEditorListener();
                }else{
                  this.fastLoad = false;
                  setTimeout(function(){ 
                    this.setupGrepperCodeEditorListener();
                  }.bind(this),600);
                }
            }
        }

    }.bind(this));
}

grepperPage.prototype.getUserId=function(){
  return new Promise(function (resolve, reject) {
    chrome.storage.sync.get(['grepper_user_id','access_token','shortcut_key'], function(items) {
        this.user_id = items.grepper_user_id;
        this.access_token = items.access_token;
        this.shortcut_key = items.shortcut_key;
        resolve();
    }.bind(this));
  }.bind(this));
}

grepperPage.prototype.getCodeSearch=function(){
  return new Promise(function (resolve, reject) {
        chrome.runtime.sendMessage(
        {
          "action":"getAssociatedSearch",
          "url":window.location.href
        }, function(response) {
            this.codeSearch=response;
            resolve();
        }.bind(this));
    }.bind(this));
}

grepperPage.prototype.showEditor=function(content, answerSource){

answerSource = (typeof answerSource !== 'undefined') ? answerSource : 5;

if(this.showingEditor){
    return;    
}
 this.showingEditor=true;

 var that=this;
 var taysPopup = document.createElement("div");
     taysPopup.classList.add("tays_popup")
     taysPopup.setAttribute("id","grepper-editor");

 var taysPopupInner = document.createElement("div");
     taysPopupInner.classList.add("tays_popup_inner")

 var taysPopupTextAreaHolder = document.createElement("div");
     taysPopupTextAreaHolder.classList.add("tays_popup_textarea_holder")

 var taysPopupCloseButton = document.createElement("div");
     taysPopupCloseButton.classList.add("tays_popup_close_button")
     taysPopupCloseButton.textContent="X";
     taysPopupCloseButton.title="Close";

     taysPopupCloseButton.addEventListener('click',function(){
         that.closeEditor();
     });




 var grepperAnswerCustomTitle = document.createElement("input");
     grepperAnswerCustomTitle.setAttribute("id","grepper_answer_title");
     grepperAnswerCustomTitle.setAttribute("placeholder","ex: javascript loop array");
     grepperAnswerCustomTitle.value=this.codeSearch.search;
     grepperAnswerCustomTitle.addEventListener('change',function(){
        var newV=document.getElementById("grepper_answer_title").value;
        this.codeSearch.search=newV;
    }.bind(this));


 var taysPopupHeader1 = document.createElement("div");
     taysPopupHeader1.classList.add("tays_popup_header1")
     taysPopupHeader1.textContent="Search Term:“";
     taysPopupHeader1.appendChild(grepperAnswerCustomTitle);

  var rightQuote = document.createElement("span");
         rightQuote.textContent="”";
         taysPopupHeader1.appendChild(rightQuote);



//   var taysPopupHeader1 = document.createElement("div");
//       taysPopupHeader1.classList.add("tays_popup_header1")
//       taysPopupHeader1.textContent="Your Grepper Answer to: \""+this.codeSearch.search+"\"";


    this.taysPopupSourceHolder = document.createElement("div");
    this.taysPopupSourceHolder.setAttribute("id","tays_popup_source_holder");

    this.taysPopupSourceHolderLabel = document.createElement("span");
    this.taysPopupSourceHolderLabel.textContent="Source:";
    this.taysPopupSourceHolderLabel.setAttribute("id","tays_popup_source_holder_label");
    this.taysPopupSourceHolder.appendChild(this.taysPopupSourceHolderLabel);

    //add in the source input 
    this.addSourceButton = document.createElement("a");
    this.addSourceButton.textContent = "Add Source";
    this.addSourceButton.title = "Add Source";
    this.addSourceButton.setAttribute("id","tays_add_source_button");

    this.taysPopupSourceText = document.createElement("span");
    this.taysPopupSourceText.setAttribute("id","tays_popup_source_text");
    this.taysPopupSourceText.title = "Edit Source";


    this.taysPopupSourceInput = document.createElement("input");
    //this.taysPopupSourceInput.value=window.location.href;
    this.taysPopupSourceInput.setAttribute("id","tays_popup_source_input");
    this.taysPopupSourceInput.setAttribute("placeholder","http://www.your-source-website.com");
    this.taysPopupSourceInput.value = window.location.href; 


    this.taysPopupSourceInputDelete = document.createElement("span");
    this.taysPopupSourceInputDelete.setAttribute("id","tays_popup_source_delete_button");
    this.taysPopupSourceInputDelete.textContent="x";
    this.taysPopupSourceInputDelete.title = "Delete Source";
    this.taysPopupSourceInputDelete.style.display = "none";

    this.taysPopupSourceInputCheck = document.createElement("span");
    this.taysPopupSourceInputCheck.setAttribute("id","tays_popup_source_check_button");
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

   this.taysPopupSourceText.textContent = this.maxLength(window.location.href,64);
   this.taysPopupSourceText.style.display="inline-block";
   this.taysPopupSourceInput.style.display="none";
   this.taysPopupSourceInputDelete.style.display="none";
   this.taysPopupSourceInputCheck.style.display="none";
   this.addSourceButton.style.display="none";
   this.taysPopupSourceHolderLabel.style.display="inline-block";



    //taysPopupInner.appendChild(taysPopupBlacklistHideShow);
    //taysPopupInner.appendChild(taysPopupBlacklist);
    taysPopupInner.appendChild(taysPopupCloseButton);
    taysPopupInner.appendChild(taysPopupTextAreaHolder)


    taysPopup.appendChild(taysPopupInner);

    this.codeEditorTextarea = document.createElement("textarea");
    this.codeEditorTextarea.innerHTML=content;


var languageGuessDisplayHolder = document.createElement("div");
    languageGuessDisplayHolder.setAttribute("id","languange_guess_display_holder");

  //add the team options 
    this.teams=[];
    makeRequest('GET', this.endpoint+"/get_my_teams.php?u="+this.user_id,{},this.user_id,this.access_token).then(function(data){
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

        languageGuessDisplayHolder.appendChild(this.teamsHolder);
        languageGuessDisplayHolder.style.marginTop="12px";
    }
  
    }.bind(this));





    this.languageToSelect(this.currentEditorLanguage);
    languageGuessDisplayHolder.appendChild(this.editorCurrentLanguageSelect);

    taysPopupTextAreaHolder.appendChild(taysPopupHeader1);
    taysPopupTextAreaHolder.appendChild(languageGuessDisplayHolder);
    taysPopupTextAreaHolder.appendChild(this.codeEditorTextarea);
    taysPopupTextAreaHolder.appendChild(this.taysPopupSourceHolder)


 var taysPopupSaveButtonHolder = document.createElement("div");

 var taysPopupSaveButtonBottomNav = document.createElement("div");
     taysPopupSaveButtonBottomNav.classList.add("grepper_bottom_nav");

 var taysPopupSaveButton = document.createElement("div");
     taysPopupSaveButton.classList.add("grepper_save_button");
     taysPopupSaveButton.textContent = "Save Grepper Answer";

     taysPopupSaveButton.addEventListener('click',function(){
        var answer=that.codeEditor.getValue();
        if(that.saveAnswer(answer,answerSource)){
            that.closeEditor();
        }
        //that.showGrepperAnswerSavedDialog();
     });

    taysPopupSaveButtonBottomNav.appendChild(taysPopupSaveButton);
    taysPopupSaveButtonHolder.appendChild(taysPopupSaveButtonBottomNav);

    taysPopupInner.appendChild(taysPopupSaveButtonHolder);

    document.body.appendChild(taysPopup);


    this.languangeNametoTaysCodeMirrorName(
    this.currentEditorLanguage,
    function(mimeType){
       this.codeEditor = TaysCodeMirror.fromTextArea(this.codeEditorTextarea,{
                      lineNumbers: true,
                      theme:"prism-okaidia",
                      mode:mimeType,
                      viewportMargin: Infinity
                });
    }.bind(this));
}


grepperPage.prototype.closeEditor=function(){
    this.showingEditor = false;
    var editor=  document.getElementById("grepper-editor");
    editor.parentNode.removeChild(editor);
}

grepperPage.prototype.startsWith=function(str,word){
    return str.lastIndexOf(word, 0) === 0;
}

grepperPage.prototype.isValidSource=function(str){
   if(!str){
       return false;
   }
  if(!this.startsWith(str,"http://") && !this.startsWith(str,"https://")){
        return false;    
  }
  var res = str.match(/(http(s)?:\/\/.)?(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/g);
  return (res !== null);
}

grepperPage.prototype.maxLength=function(str,length){
    return str.length > length ? str.substring(0, length) + "..." : str;
}


grepperPage.prototype.getCodeContent=function(el){

    if(el.classList.contains("CodeMirror")){
        var lines=el.querySelectorAll(".CodeMirror-line");  
        var content="";
        for(var i=0; i < lines.length;i++){
            if(lines[i].textContent){
                content+=((lines[i].textContent).replace(/[\u200B-\u200D\uFEFF]/g, ''))+"\n";
            }
        }
    } else if(el.classList.contains("w3-code")){
        var cloneEl = el.cloneNode(true)
            cloneEl.innerHTML=cloneEl.innerHTML.replace(/<br\s*[\/]?>/gi,"\n")
       var content=cloneEl.textContent;
    } 
    else if(el.classList.contains("phpcode")){
      var cloneEl = el.cloneNode(true)
          cloneEl.innerHTML=cloneEl.innerHTML.replace(/<br\s*[\/]?>/gi,"\n")
       var content=cloneEl.textContent;

    } 
    else if(el.classList.contains("syntaxhighlighter")){
        var lines=el.querySelectorAll(".code .line");  
        var content="";
        for(var i=0; i < lines.length;i++){
            if(lines[i].textContent){
                content+=((lines[i].textContent).replace(/[\u200B-\u200D\uFEFF]/g, ''))+"\n";
            }
        }   
    } else if(el.classList.contains("crayon-main")){
        var lines=el.querySelectorAll(".crayon-line");  
        var content="";
        for(var i=0; i < lines.length;i++){
            if(lines[i].textContent){
                content+=((lines[i].textContent).replace(/[\u200B-\u200D\uFEFF]/g, ''))+"\n";
            }
        }   
    }
    
    else{
        var content=el.textContent;
    }
   return content;
}


grepperPage.prototype.getGrepperButton=function(el){
     var that=this;
     var grepper_menu = document.createElement("div");
         grepper_menu.classList.add("grepper_menu_holder");

    var editAnswerImg = document.createElement("div");
        editAnswerImg.classList.add("open_grepper_editor");
        editAnswerImg.title="Edit & Save To Grepper";

        editAnswerImg.addEventListener('click',function(){
           var content = that.getCodeContent(el);
          that.injectScript('codemirror/lib/codemirror.js', 'body',function(){
               that.showEditor(content);
          });
        });

        editAnswerImg.addEventListener('contextmenu', function(ev) {
              var content = that.getCodeContent(el);
               that.saveAnswer(content,6);
               //that.showGrepperAnswerSavedDialog();
               ev.preventDefault();
               return;
        }, false);

        return editAnswerImg;
}

grepperPage.prototype.addEditorToElement=function(el){
    var editAnswerImg = this.getGrepperButton(el);
     if(el.style.position === "static" || !el.style.position){
         el.style.position="relative";
     }
     el.appendChild(editAnswerImg);
}

/*
grepperPage.prototype.addEditorToElementsWpSytaxHighlighter=function(){
  setTimeout(function(){ 
        var pres = document.getElementsByClassName("syntaxhighlighter");
        conosole.log(pres);
        for (var i = 0; i < pres.length; i++) {
            var editAnswerImg = this.getGrepperButton(pres[i]);
              if(pres[i].style.position === "static" || !pres[i].style.position){
                     pres[i].style.position="relative";
               }
               pres[i].appendChild(editAnswerImg);
        }
   }.bind(this),2000);
}
*/


grepperPage.prototype.addEditorToCodeMirrorElements=function(elements){
    for (var i = 0; i < elements.length; i++) {
        this.addEditorToElement(elements[i],true);
    }
}

grepperPage.prototype.addEditorToElements=function(elements){
    for (var i = 0; i < elements.length; i++) {
        this.addEditorToElement(elements[i]);
    }
}

grepperPage.prototype.isCodeBoxCode=function(){

    if(document.querySelectorAll('.codebox pre').length > 0){
        return true;
    }else{
        return false;    
    }
    
}

grepperPage.prototype.isWpSytaxHighlighter=function(){
    //for (var i = 0; i < pres.length; i++) {
    var scripts = document.getElementsByTagName("script");
    for (var i = 0; i < scripts.length; i++) {
      if (scripts[i].src) {
          if(scripts[i].src.indexOf("plugins/syntaxhighlighter") !== -1){
              return true;
          }
      }
    }
   // }
    return false;
}


grepperPage.prototype.setupGrepperCodeEditor=function(){
   // var pres = document.querySelectorAll("pre, .w3-code, .CodeMirror");
//  var pres = document.querySelectorAll(".CodeMirror");
//  this.addEditorToCodeMirrorElements(pres);


     //detect various plugins here
     //var classes = el.className.split(/\s+/);
     //ok we are wp-syntax highligher 
     //https://businessbloomer.com/woocommerce-remove-rename-add-default-sorting-options-shop/
     //https://wordpress.org/plugins/syntaxhighlighter/

    var pres = document.querySelectorAll('.w3-code, pre:not(.CodeMirror-line), .phpcode, .syntaxhighlighter,.crayon-main');

     if(this.fastLoad){
        this.addEditorToElements(pres);
     }else if(this.isWpSytaxHighlighter()){
        setTimeout(function(){ 
            var pres = document.querySelectorAll('.syntaxhighlighter');
            this.addEditorToElements(pres);
        }.bind(this),2000);
     } else if(this.isCodeBoxCode()){
         //just ignore codebox
            //var pres = document.querySelectorAll('.syntax-highlighter');
            //this.addEditorToElements(pres);
     } else{
        this.addEditorToElements(pres);
     }


//grepperInjectScript(chrome.extension.getURL('js/setup_grepper_code_editor.js'), 'body');
    //console.log("setting up code editors");
    //first lets get the element then lets setup the editor on them
  //  var pres = document.querySelectorAll("pre, .w3-code, .CodeMirror");

//  var that=this;
//  setTimeout(function(){ 
//      //var pres = document.querySelectorAll(".CodeMirror");
//      //console.log(document.querySelectorAll(".CodeMirror")[0]);
//     // console.log(pres);
//      console.log(window.document.querySelectorAll(".CodeMirror"));
//      //console.log(pres[0].CodeMirror);
//      //that.addEditorToCodeMirrorElements(pres);
//  }, 8000);//give codemiror second to load

       //get stuff within iframe
  // var iframes = document.querySelectorAll("iframe");
  //for (var i = 0; i < iframes.length; i++) {
  //    var pres2 = iframes[i].contentWindow.document.querySelectorAll("pre, .w3-code, .CodeMirror");
  //    this.addEditorToElements(pres2);
  //}
}


//we used to load on interactive state, now we are waiting till all resources are loaded
grepperPage.prototype.setupGrepperCodeEditorListener=function(){
    var that=this;
    //some sites we want to wait to complete loading
    if(this.waitForCompleteReadyState()){
        if(document.readyState === "complete") {
                that.setupGrepperCodeEditor();
        } else {
            document.addEventListener('readystatechange', function(){
                if(document.readyState === "complete"){
                    that.setupGrepperCodeEditor();
                }
            });
        }
    }else{
        if(document.readyState === "complete" || document.readyState === "interactive") {
                that.setupGrepperCodeEditor();
        } else {
          window.addEventListener("DOMContentLoaded", function(){
              that.setupGrepperCodeEditor();
          });
        }
    }
}

grepperPage.prototype.saveAnswer=function(answerText,source){
       if(!source){ source = 2;}
       if(this.codeSearch.search.length < 2){
           if(document.getElementById("grepper_answer_title")){
                document.getElementById("grepper_answer_title").style.border="1px solid red";
           }
           alert("Please enter the search term that will trigger this answer.");
           return false;
       }

       var data={};
        data.answer=answerText;
        data.user_id=this.user_id;
        data.codeSearch=this.codeSearch;
        data.source=source;

        if(this.taysPopupSourceInput.value && this.isValidSource(this.taysPopupSourceInput.value)){
            data.source_url=this.taysPopupSourceInput.value;
        }else{
            data.source_url="";
        }

        if(this.editorCurrentLanguageSelect){
            data.language =this.editorCurrentLanguageSelect.value;
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

        makeRequest('POST', this.endpoint+"/save_answer.php",JSON.stringify(data)).then(function(responseData){
            //location.reload();
         var dataR=JSON.parse(responseData); 
            if(dataR.payment_required){
                var r = confirm("Oops! Looks like you need to activate Grepper, Activate now?");
                if (r == true) {
                    window.open("https://www.codegrepper.com/checkout/checkout.php", "_blank");
                } 
            }else{
                this.showGrepperAnswerSavedDialog();
            }
        }.bind(this));
        return true;

}

grepperPage.prototype.setupCopyListener=function(){
        var that=this;

        window.grepperControlDown=false;
        that.ctrlPressedTime=false;

        document.addEventListener('keydown', function(event){

           if(event.key ==="Escape" && that.showingEditor){
                that.closeEditor();
           }

        //they are using Alt+g for shorcut
        if(typeof that.shortcut_key !=='undefined' && that.shortcut_key==1){
           if(event.key==="Alt"){
               window.grepperControlDown=true;
               var d=new Date();
               that.ctrlPressedTime=d.getTime();
           }
        }else{
           if(event.key ==="Meta" || event.key==="Control"){
               window.grepperControlDown=true;
               var d=new Date();
               that.ctrlPressedTime=d.getTime();
           }
        }

            //we trigger an open
           if((event.key === "g" || event.key === "G" || event.keyCode === 71) && window.grepperControlDown ){

               var d=new Date();
               //this is a backup check so "g" can't accidently
               //get op without having pressed ctr in past 3 seconds
               if(d.getTime()-that.ctrlPressedTime < 3000){
                    var selection = document.getSelection().toString();
                       that.injectScript('codemirror/lib/codemirror.js', 'body',function(){
                            that.showEditor(selection,7);

                          });
                    event.preventDefault();
                    return false;
                }else{
                    window.grepperControlDown=false;
                }
                //that.saveAnswer(selection,7);
           }
        });

     document.addEventListener('keyup', function(event){
       if(typeof that.shortcut_key !=='undefined' && that.shortcut_key==1){
           if(event.key ==="Alt"){
               window.grepperControlDown=false;
           }
        }else{
           if(event.key ==="Meta" || event.key==="Control"){
               window.grepperControlDown=false;
           }
        }
    });

    
    /*
    document.addEventListener('copy', function(e){
        var selection = document.getSelection().toString();
        var d=new Date();
        if( (that.lastSavedTime) &&
            ((d.getTime() - that.lastSavedTime) < 1000) &&
            (that.lastSavedSelection === selection))
        {
        // var selection = document.getSelection().toString();
             that.showEditor(selection);

       //     that.saveAnswer(selection,3);
       //     that.showGrepperAnswerSavedDialog();
        }else{
        //  that.saveAnswer(selection,4);
          that.lastSavedTime=d.getTime();
          that.lastSavedSelection=selection;
           
        }
        }.bind(this));
    */

    //if we save answer twice in 2 seconds we count at is intentional
    // grepper add
}

grepperPage.prototype.blackList =function(url,blacklist_type) {
    var data={};
        data.url=url;
        data.blacklist_type = blacklist_type;

    makeRequest('POST', this.endpoint+"/blacklist.php",JSON.stringify(data),this.user_id,this.access_token).then(function(responseData){
            var dataR=JSON.parse(responseData); 
            //if we could save to backend,just rest to whatever is on the backend 
            if(dataR.success){
                chrome.storage.sync.set({grepper_blacklists: dataR.blacklists}, function() {
                    location.reload();
                });
            }else{
                alert("Ooops, You need to login to complete this action. Click the Grepper icon in the top right of your browser ↗ ");
                //require a login at this point

                //otherwise push onto current
                 // chrome.storage.sync.get(['grepper_blacklists'], function(all_items) {
                 //     var bl=all_items.grepper_blacklists;
                 //     if(!bl){ bl=[];}
                 //     bl.push(data);
                 //     console.log(bl);
                 //     chrome.storage.sync.set({grepper_blacklists: bl}, function() {
                 //     //location.reload();
                 //     });
                 // });
            }
    });

}


grepperPage.prototype.languangeNametoTaysCodeMirrorName =function(l,callback) {
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

grepperPage.prototype.injectScript = function(file, node ,callback) {
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

grepperPage.prototype.languageToSelect =function(l){
    this.editorCurrentLanguageSelect  = document.createElement('select');
    this.editorCurrentLanguageSelect.setAttribute("id","languange_guess_display");
    this.editorCurrentLanguageSelect.addEventListener('change',function(){
        var l=this.editorCurrentLanguageSelect.value;
        this.languangeNametoTaysCodeMirrorName(l,function(mimeType){
            this.codeEditor.setOption("mode", mimeType);
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


//don't run this on google
//todo:turn this logic back on
//todo: what iff there is no hide grepper_button or blacklists
if(window.location.href.indexOf("https://www.google.com") !== 0){
    chrome.storage.sync.get(['grepper_blacklists','hide_grepper_button'], function(all_items) {

        var dontLoad = false;
        var hideIcons = false;
        var blacklists = Array.isArray(all_items.grepper_blacklists) ? all_items.grepper_blacklists : []; 

        if(all_items.hide_grepper_button){
            hideIcons=true;
        }

        for(var i = 0;i<blacklists.length;i++){

            if (blacklists[i].blacklist_type === 1){
                  var a = document.createElement('a'); a.href = blacklists[i].url;
                    if(window.location.hostname === a.hostname){
                        dontLoad = true; 
                    }
            }else if (blacklists[i].blacklist_type === 2){
                 var a = document.createElement('a'); a.href = blacklists[i].url;
                    if(window.location.hostname === a.hostname){
                       hideIcons = true; 
                    }
            } else if (blacklists[i].blacklist_type === 3){
                  var a = document.createElement('a'); a.href = blacklists[i].url;
                    if(window.location.hostname === a.hostname){
                        dontLoad = false; 
                    }
            }else if (blacklists[i].blacklist_type === 4){
                 var a = document.createElement('a'); a.href = blacklists[i].url;
                    if(window.location.hostname === a.hostname){
                        hideIcons = false; 
                    }
            } else if (blacklists[i].blacklist_type === 5){
                    if(blacklists[i].url === window.location.href){
                        dontLoad=true;
                    }
            } else if (blacklists[i].blacklist_type === 6){
                 if(blacklists[i].url === window.location.href){
                       hideIcons=true;
                }
            } else  if (blacklists[i].blacklist_type === 7){
                    if(blacklists[i].url === window.location.href){
                        dontLoad=false;
                    }
            } else if (blacklists[i].blacklist_type === 8){
                 if(blacklists[i].url === window.location.href){
                       hideIcons=false;
                }
            }

        }

        if(dontLoad){
            return;    
        }


        window.grepper=new grepperPage(hideIcons);
        window.grepper.init();

    });
}
