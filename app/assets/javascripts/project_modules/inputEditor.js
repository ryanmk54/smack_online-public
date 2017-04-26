var InputEditor = (function() {
  "use strict";

  var changed,
        // changed variable, so we can autosave
      initialized,
        // stores whether or not whether this has been initialized

      // Object methods
      init,           // Initializes the InputEditor
      isInitialized,  // returns whether or not this has been initialized
      editor,         // the ace editor variable
      get,            // returns the contents of the editor
      navigateTo,     // positions the cursor on the given line
      save,           // saves to the fileTree
      set,            // sets the contents of the editor
      setChanged;     // sets whether changed variable to true


  /** Initializes the editor */
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


  /** Returns true if the InputEditor has been initialized */
  isInitialized = function() {
    if (initialized)
      return true;
    else
      return false;
  };


  /** Moves the cursor to the specified row and column number */
  navigateTo = function(rowNum, colNum) {
    editor.gotoLine(rowNum);
    editor.navigateTo(rowNum, colNum);
  };


  /** Returns the contents of the editor */
  get = function() {
    return editor.getValue();
  };


  /** Saves to the file tree if the contents have changed */
  save = function() {
    if (changed) {
      FileTree.setValueOfCurrentFile(editor.getValue());
      changed = false;
    }
  };


  /** Sets the value of the editor */
  set = function(value) {
    editor.setValue(value);
  }


  /** Public methods */
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
