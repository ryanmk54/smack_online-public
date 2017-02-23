var OutputEditor = (function() {
  "use strict";

  var init,
      editor,
      highlightCorrespondingInputRow,
      set;

  init = function() {
    editor = ace.edit("outputEditor");
    editor.$blockScrolling = Infinity;
    editor.setTheme("ace/theme/twilight");
    editor.session.setMode("ace/mode/c_cpp");
    editor.setReadOnly(true);
    editor.setValue( $("#project_output").val() );
    editor.navigateTo(0,0);

    // highlight the corresponding line in the input editor
    editor.on("changeSelection", highlightCorrespondingInputRow)
  };

  highlightCorrespondingInputRow = function() {
    var cursorPos = editor.getSelection().getCursor();
    var contentInRow = editor.getSession().getLine(cursorPos.row);
    contentInRow = contentInRow.trim();

    var matchStrings = [
      /\/home\/ubuntu\/src\/smack_server\/public\/system\/projects\/\d*\/(.*)\((\d*),(\d*)\)/,
      /\/home\/ubuntu\/src\/smack_server\/public\/system\/projects\/\d*\/(.*):(\d*):(\d*)/
    ];

    matchStrings.forEach(function(matchString) {
      var match = contentInRow.match(matchString);
      if (match) {
        var fileName = match[1];
        var rowNum = match[2];
        var colNum = match[3];

        rowNum -= 1;
          // rows are zero based

        FileTree.setCurrentFile(fileName, rowNum, colNum);
      }
    });
  };

  set = function(value) {
    editor.setValue(value);
  };

  return {
    init: init,
    set: set
  };
}());
