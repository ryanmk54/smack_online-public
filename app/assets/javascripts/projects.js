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
var base64InputID = "project_input";
var zipUploadID = "input_upload";
var outputID = "output";

$().ready(function(){
  zip = new JSZip();
  var base64Input = document.getElementById(base64InputID);
  if (base64Input.value != '') {
    loadEditorFromInput();
  }
  var output = document.getElementById(outputID);
  if (output.value != '') {
    editor2.setValue(output.value);
  }
});

function loadEditorFromInput() {
  var base64Input = document.getElementById(base64InputID).value;
  console.log(base64Input);
  zip.loadAsync(base64Input, {base64: true})
    .then(function success(zip) {
      loadEditor();
    }, function error(e) {
      console.log("loadAsync in loadEditorFromInput failed");
    });
}

function loadEditorFromZipUpload() {
  var zipInputElement = document.getElementById(zipUploadID);
  zip.loadAsync(zipInputElement.files[0])
    .then(function success(zip) {
      loadEditor();
    }, function error(e) {
      console.log("loadAsync in loadEditorFromZipUpload failed");
    });
}

function loadEditor(base64Input) {
  zip.forEach(function (relativePath, file) {
    fileList.push(relativePath);

    file.async("string").then(function success(content) {
      files[relativePath] = content;
      addFileToFileList(relativePath);
    }, function error(e) {
      console.log("converting file to text failed");
    });
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
  // TODO don't change the editor value if they click on a folder
  if (currentFile != "") {
    zip.file(currentFile, editor.getValue());
  }
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

$().ready(function() {
  console.log("entered ready function");
  $('form.edit_project').on('ajax:before', function(event, xhr, settings) {
    console.log('ajax before');
    zip.generateAsync({type: "base64"})
      .then(function (content) {
        var base64Input = document.getElementById(base64InputID);
        base64Input.value = content;
      });
  });
  $('form.edit_project').on('ajax:beforeSend', function(event, xhr, settings) {
    console.log('ajax beforeSend');
  });
  $('form.edit_project').on('ajax:send', function(event, xhr, settings) {
    console.log('ajax send');
  });
  $('form.edit_project').on('ajax:success', function(event, xhr, settings) {
    console.log('ajax success');
  });
  $('form.edit_project').on('ajax:error', function(event, xhr, settings) {
    console.log('ajax error');
  });
  $('#input_upload').change(function() {
    console.log("#input_upload has changed");
    loadEditorFromZipUpload();
  });
});
