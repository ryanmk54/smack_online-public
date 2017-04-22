var InputEditor = (function() {
  "use strict";

  var changed,
      initialized,

      init,
      isInitialized,
      editor,
      get,
      navigateTo,
      save,
      set,
      setChanged;


  init = function() {
    editor = ace.edit("inputEditor");
    editor.setAutoScrollEditorIntoView(true);
    editor.$blockScrolling = Infinity;
    editor.setTheme("ace/theme/clouds");
    editor.session.setMode("ace/mode/c_cpp");
    editor.on('blur', save);
    editor.getSession().on('change', function(e) {
      changed = true;
    });
    changed = false;
  };


  isInitialized = function() {
    if (initialized)
      return true;
    else
      return false;
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
    init,
    isInitialized,
    get,
    navigateTo,
    save,
    set,
    setChanged
  };
}());
