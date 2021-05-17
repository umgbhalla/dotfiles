function grepperSetupGrepperCodeEditor(that){
    console.log(that);

    var pres = document.querySelectorAll(".CodeMirror");
    that.addEditorToCodeMirrorElements(pres);
 //   var pres2 = iframes[i].contentWindow.document.querySelectorAll("pre, .w3-code, .CodeMirror");
 //   this.addEditorToElements(pres2);
  
}
console.log(window.grepper);
grepperSetupGrepperCodeEditor(window.grepper);
