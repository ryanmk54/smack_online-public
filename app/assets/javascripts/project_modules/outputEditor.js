var OutputEditor = (function() {
  "use strict";

  var editor,
        // The backing variable

      debug,  // turns on the debugger so I have access to all private variables
      init,   // initializes the OutputEditor
      append, // appends text to the Output
      get,    // returns the text of the output
      highlightCorrespondingInputRow,
        // highlights the corresponding row in the InputEditor
      resize, // calls resize, which makes stuff show up
      set;    // sets the content of the OutputEditor

  /** Initializes the OutputEditor */
  init = function() {
    editor = ace.edit("outputEditor");
    editor.setAutoScrollEditorIntoView(true);
    editor.$blockScrolling = Infinity;
    editor.setTheme("ace/theme/twilight");
    editor.session.setMode("ace/mode/c_cpp");
    editor.setReadOnly(true);
    editor.setValue( $("#project_output").val() );
    editor.navigateTo(0,0);

    // highlight the corresponding line in the input editor
    editor.on("changeSelection", highlightCorrespondingInputRow)
  };


  /** Appends text to the Output */
  append = function(value) {
    editor.navigateFileEnd();
    editor.insert('\n');
    editor.insert(value);
  };


  /** Starts the debugger, which gives access to all private variables */
  debug = function() {
    debugger;
  }


  /** Returns the contents of the editor */
  get = function() {
    return editor.getValue();
  }


  /** Highlights the corresponding row in the Input editor */
  highlightCorrespondingInputRow = function() {
    var cursorPos = editor.getSelection().getCursor();
    var contentInRow = editor.getSession().getLine(cursorPos.row);
    contentInRow = contentInRow.trim();

    /* Regex specific to the SMACK output 
     * If the format of the SMACK output changes,
     * these might need to change
     */
    var matchStrings = [
      /(.*)\((\d*),(\d*)\)/,
      /([A-z.]*):(\d*):(\d*)/
    ];

    // Check if either of the strings match
    matchStrings.forEach(function(matchString) {
      var match = contentInRow.match(matchString);
      if (match) {
        var fileName = match[1];
        var rowNum = match[2];
        var colNum = match[3];

        rowNum -= 1;
          // rows are zero based

        // Set the current file to the file they clicked on
        FileTree.setCurrentFile(fileName, rowNum, colNum);
      }
    });
  };


  // Resize the editor to make it show up
  resize = function() {
    editor.resize();
  };


  /**
   * Set the contents of the editor
   */
  set = function(value) {
    editor.setValue(value);
    editor.navigateTo(0,0);
    OutputParser.showOutputModal();
  };


  /** Public Methods */
  return {
    init: init,
    debug: debug,
    append: append,
    resize: resize,
    set: set,
    get: get
  };
}());
