var InputEditor = (function() {
  "use strict";

  var init,
      editor,
      navigateTo,
      save,
      set;


  init = function() {
    editor = ace.edit("inputEditor");
    editor.$blockScrolling = Infinity;
    editor.setTheme("ace/theme/clouds");
    editor.session.setMode("ace/mode/c_cpp");
    editor.on('blur', save);
  };


  navigateTo = function(rowNum, colNum) {
    editor.gotoLine(rowNum);
    editor.navigateTo(rowNum, colNum);
  };


  save = function() {
    FileTree.setValueOfCurrentFile(editor.getValue());
  };


  set = function(value) {
    editor.setValue(value);
  }


  return {
    init: init,
    navigateTo: navigateTo,
    save: save,
    set: set
  };
}());
