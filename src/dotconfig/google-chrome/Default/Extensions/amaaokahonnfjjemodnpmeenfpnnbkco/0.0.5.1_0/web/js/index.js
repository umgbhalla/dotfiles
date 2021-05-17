
var endpoint="https://www.codegrepper.com/api";
var user_id=false;
var answers=[];

function getGrepperAnswers(){

  return new Promise(function (resolve, reject) {
    getUserId().then(function(id){
        makeRequest('GET', endpoint+"/get_all_user_answers.php?u="+user_id).then(function(data){
            answers=JSON.parse(data).answers;
            resolve();
        });
    });
  });
}

function displayAnswers(){
    var answersHolder=document.getElementById("all_grepper_examples");
    for(let i=0;i<answers.length;i++){
            answers[i].liElement = document.createElement("a");
            answers[i].liElement.innerHTML=answers[i].term;
            answers[i].liElement.classList.add("answer_title")

            answers[i].liElement.addEventListener('click',function(){
                showGrepperAnswer(answers[i]);
            });
            answersHolder.appendChild(answers[i].liElement);
    }
}


window.addEventListener("DOMContentLoaded", function(){
    //alert("getting answers");
  getGrepperAnswers().then(function(){
    displayAnswers();        
  });

});

function makeRequest (method, url, data) {
  return new Promise(function (resolve, reject) {
    var xhr = new XMLHttpRequest();
    xhr.open(method, url);
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

function getUserId(){
return new Promise(function (resolve, reject) {
  chrome.storage.sync.get('grepper_user_id', function(items) {
        user_id=items.grepper_user_id;
        resolve(items.grepper_user_id);

  }.bind(this));
}.bind(this));
}

function showGrepperAnswer(answer){
    
    document.getElementById("grepper_answer_holder").style.display = "block";

var answerTextarea = document.createElement("textarea");
answerTextarea.textContent=answer.answer;
answerTextarea.setAttribute("id","grepper_answer_textarea")


document.getElementById("grepper_answer_title").innerHTML=answer.term;

document.getElementById("grepper_answer").innerHTML='';
document.getElementById("grepper_answer").appendChild(answerTextarea);
var editorSelector = "#grepper_answer_textarea"; 
var languageGuess= "javascript";
var answerCodeMirror = TaysCodeMirror.fromTextArea(answerTextarea,{
            lineNumbers: true,
            theme:"prism-okaidia",
            mode: languageGuess,
            viewportMargin: Infinity,
           
});
     
}



