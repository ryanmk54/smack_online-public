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
function loadEditor(base64Input) {
  var zip = new JSZip();
  zip.loadAsync(base64Input, {base64: true})
    .then(function success(zip) {
      zip.forEach(function (relativePath, file) {
        fileList.push(relativePath);

        file.async("string").then(function success(content) {
          files[relativePath] = content;
        }, function error(e) {
          console.log("converting file to text failed");
        });
      });
    }, function error(e) {
      console.log("loadAsync failed");
    });
}

function addFileNameToFileList(filename) {
}
function populateFileList(filesArr) {
}

