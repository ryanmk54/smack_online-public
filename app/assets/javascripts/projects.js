/* Place all the behaviors and hooks related to the matching controller here.
 * All this logic will automatically be available in application.js.
 */

/**
 * When the edit action is called 
 * with an html response type, 
 * the edit view is returned with the following:
 *  id, 
 *  title, 
 *  input as base64 in a hidden form field
 *  output in a hidden form field
 *  eta/status in a hidden form field
 * As soon as the DOM is loaded, 
 * loadEditor is called with the base64Input.
 * loadEditor will then proceed to:
 *  populate the file list
 *    // should populateFileList 
 *    // add the files all at once or one at a time?
 *  possibly set the text in the ace code editor
 *  populate the output panel
 * 
 */

var fileList = [];
var files = {};
var zip;
var currentFile = "";

$().ready(function(){
  loadEditorFromInput();
});

function loadEditorFromInput() {
  var base64Input = document.getElementById("project_input").value;
  console.log(base64Input);
  loadEditor(base64Input);
}

function loadEditor(base64Input) {
  zip = new JSZip();
  zip.loadAsync(base64Input, {base64: true})
    .then(function success(zip) {
      zip.forEach(function (relativePath, file) {
        fileList.push(relativePath);

        file.async("string").then(function success(content) {
          files[relativePath] = content;
          addFileToFileList(relativePath);
        }, function error(e) {
          console.log("converting file to text failed");
        });
      });
    }, function error(e) {
      console.log("loadAsync failed");
    });
}

function addFileToFileList(filename) {
  var fileListElement = document.getElementById("file-list");
  var fileElement = document.createElement("div");
  fileElement.id = filename;
  fileElement.appendChild(document.createTextNode(filename));
  fileElement.onclick = function() { updateInputEditor(filename) };
  fileListElement.appendChild(fileElement);
}

function updateInputEditor(filename) {
  zip.file(filename, editor.getValue());
  // input editor is called editor
  zip.file(filename).async("string")
    .then(function success(content) {
      // use the content
      currentFile = filename;
      editor.setValue(content);
      console.log(content);
    }, function error(e) {
      // handle the error
    });
}
