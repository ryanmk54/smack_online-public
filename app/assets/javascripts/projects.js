// IFFE to prevent pollution of the global namespace
(function(){

const outputElementId = 'output';
const zipUploadElementId = 'input_upload';
const base64InputElementId = 'project_input';
const fileListElementId = 'file-list';

var currentFile = "";


$().ready(function(){

  // Load input editor 
  let base64Input = document.getElementById(base64InputElementId);
  if (base64Input.value != '') {
    loadZipFromBase64Input()
      .then(function success(zip) {
        loadIDE(zip);
      }, function error(e) {
        throw("unable to load zip from base 64 input");
      });
  }


  // Load output editor
  let output = document.getElementById(outputElementId);
  if (output.value != '') {
    editor2.setValue(output.value);
  }


  // handle the run button click
  $('#run_project').on('click', function() {
    editor2.setValue('Processing...');

    // zip up the files and ask rails to submit it
    zip.generateAsync({type: "base64"})
      .then(function (content) {
        var base64Input = document.getElementById(base64InputElementId);
        base64Input.value = content;
        $.rails.handleRemote($('form'));
      });
    return false;
  });


  // handle the zip file upload button
  $('#input_upload').change(function() {
    if (isZipUploadValid()) {
      // if the zip is valid, clear any previous errors
      clearZipError();

      loadZipFromFileUpload()
        .then(function success(zip) {
          loadIDE(zip);
        }, function error(e) {
          throw("unable to load zip from file upload");
        });
    }
  });
});



/**
 * @description Loads a zip object from the base64 input sent by the server
 *
 * @see https://stuk.github.io/jszip/documentation/api_jszip/load_async_object.html
 */
function loadZipFromBase64Input() {
  var base64Input = document.getElementById(base64InputElementId).value;
  return JSZip.loadAsync(base64Input, {base64: true});
}


/**
 * @description Loads a zip object from the zip file uploaded by the user
 *
 * @see https://stuk.github.io/jszip/documentation/api_jszip/load_async_object.html
 */
function loadZipFromFileUpload() {
  var zipInputElement = document.getElementById(zipUploadElementId);
  return JSZip.loadAsync(zipInputElement.files[0]);
}


function loadIDE(zip) {
  // Empty the files list in case the editor
  // has already been loaded once before
  emptyFileList();

  // Load each file as a string and add it to the file list
  zip.forEach(function (relativePath, file) {
    file.async("string").then(function success(content) {
      addFileToFileList(zip, relativePath);
    }, function error(e) {
      throw("converting file to text failed");
    });
  });
}


/**
 * Creates a div element
 * based on the given filename
 * and appends it to the file list
 */
function addFileToFileList(zip, filename) {
  var fileListElement = document.getElementById(fileListElementId);
  var fileElement = document.createElement("div");
  fileElement.id = filename;
  fileElement.className = "file";
  fileElement.appendChild(document.createTextNode(filename));
  fileElement.onclick = function() { updateInputEditor(zip, filename) };
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
function updateInputEditor(zip, filename) {
  // TODO don't change the editor value if they click on a folder
  // currently an error is output to the console if they click a folder
  // TODO save the file in the zip as soon as the editor loses focus
  //
  // updates the zip with the contents of the editor
  if (currentFile != "") {
    zip.file(currentFile, editor.getValue());
  }

  // input editor variable is called editor
  zip.file(filename).async("string")
    .then(function success(content) {
      // use the content
      currentFile = filename;
      editor.setValue(content);
    }, function error(e) {
      throw(e);
    });
}


function clearZipError() {
  outputZipError("");
}


function outputZipError(errorMessage) {
  var errorSpanElement = document.getElementById("input_upload_status");
  errorSpanElement.textContent = errorMessage;

  if (errorMessage != '') {
    console.error(errorMessage);
  }
}


function isZipUploadValid() {
  var zipUpload = document.getElementById(zipUploadElementId);

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
  if ($.inArray(mimeType, validMimeTypes) == -1) {
    outputZipError("Only zip files are allowed");
    console.error("MIME type " + mimeType + " not supported");
    return false;
  }

  return true;
}

})();
