var InputEditor = (function() {
  "use strict";

  var changed,

      init,
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
    editor.getSession().on('change', function(e) {
      console.log(e);
      changed = true;
    });
    changed = false;
  };


  navigateTo = function(rowNum, colNum) {
    editor.gotoLine(rowNum);
    editor.navigateTo(rowNum, colNum);
  };


  save = function() {
    if (changed) {
      FileTree.setValueOfCurrentFile(editor.getValue(), true);
      changed = false;
    }
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
