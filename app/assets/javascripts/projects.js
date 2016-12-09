/* Place all the behaviors and hooks related to the matching controller here.
 * All this logic will automatically be available in application.js.
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

  // Load input editor 
  var base64Input = document.getElementById(base64InputID);
  if (base64Input.value != '') {
    loadEditorFromInput();
  }

  // Load output editor
  var output = document.getElementById(outputID);
  if (output.value != '') {
    editor2.setValue(output.value);
  }
});


function loadEditorFromInput() {
  var base64Input = document.getElementById(base64InputID).value;
  console.log(base64Input);

  // Load the input editor from the base64 input from the server
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
  emptyFileList();

  zip.forEach(function (relativePath, file) {
    fileList.push(relativePath);

    // Load each file as a string and add it to the file list
    // TODO the files and fileList variables are probably obsolete
    file.async("string").then(function success(content) {
      files[relativePath] = content;
      addFileToFileList(relativePath);
    }, function error(e) {
      console.log("converting file to text failed");
    });
  });
}


/**
 * Creates a div element
 * based on the given filename
 * and appends it to the file list
 */
var fileListElementId = "file-list";
function addFileToFileList(filename) {
  var fileListElement = document.getElementById(fileListElementId);
  var fileElement = document.createElement("div");
  fileElement.id = filename;
  fileElement.className = "file";
  fileElement.appendChild(document.createTextNode(filename));
  fileElement.onclick = function() { updateInputEditor(filename) };
  fileListElement.appendChild(fileElement);
}


/**
 * Deletes all file divs from the file list element
 */
function emptyFileList() {
  var fileDivs = document.getElementsByClassName("file");
  for (let i = fileDivs.length - 1; i >= 0; --i) {
    fileDivs[i].remove();
  }
}


// Unzips the file out of zip and 
// sets the contents of the editor 
// to the contents of the file
function updateInputEditor(filename) {
  // TODO don't change the editor value if they click on a folder
  // currently an error is output to the console if they click a folder
  if (currentFile != "") {
    zip.file(currentFile, editor.getValue());
  }

  // input editor variable is called editor
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


function clearZipError() {
  outputZipError("");
}


function outputZipError(errorMessage) {
  console.log(errorMessage);
  var errorSpanElement = document.getElementById("input_upload_status");
  errorSpanElement.textContent = errorMessage;
}


function validateZipUpload() {
  var zipUpload = document.getElementById(zipUploadID);

  // Verify only one file was uploaded
  if (zipUpload.files.length != 1) {
    outputZipError("Multiple files aren't allowed");
    return false;
  }

  // Check the MIME type
  let mimeType = zipUpload.files[0].type;
  let validMimeTypes = [
    "application/zip", 
    "application/x-zip-compressed",
    "application/octet-stream"
  ];
  if (mimeType != "application/zip") {
    outputZipError("Only zip files are allowed");
    console.log("MIME type " + mimeType + " not supported");
    return false;
  }

  // If all checks pass, clear the error
  clearZipError();
  return true;
}


/**
 * Events that are bound on DOM ready
 * TODO the log messages below should be removed 
 * or hidden with a flag
 */
$().ready(function() {
  console.log("entered ready function");
  $('form').on('ajax:before', function(event) {
    console.log('ajax before');
  });
  $('form').on('ajax:beforeSend', function(event, xhr, settings) {
    console.log('ajax beforeSend');
    zip.generateAsync({type: "base64"})
      .then(function (content) {
        var base64Input = document.getElementById(base64InputID);
        base64Input.value = content;
        event.target.submit();
      });
    return false;
  });
  $('form').on('ajax:send', function(event, xhr, settings) {
    console.log('ajax send');
  });
  $('form').on('ajax:success', function(event, xhr, settings) {
    console.log('ajax success');
  });
  $('form').on('ajax:error', function(event, xhr, settings) {
    console.log('ajax error');
  });
  $('#input_upload').change(function() {
    console.log("#input_upload has changed");
    if (validateZipUpload()) {
      loadEditorFromZipUpload();
    }
  });
});
