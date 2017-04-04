var InputEditor = (function() {
  "use strict";

  var changed,

      init,
      editor,
      get,
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
      changed = true;
    });
    changed = false;
  };


  navigateTo = function(rowNum, colNum) {
    editor.gotoLine(rowNum);
    editor.navigateTo(rowNum, colNum);
  };


  get = function() {
    return editor.getValue();
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
    get: get,
    navigateTo: navigateTo,
    save: save,
    set: set
  };
}());
