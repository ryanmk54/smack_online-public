// Read Sprockets README (https://github.com/rails/sprockets#sprockets-directives) for details
// about supported directives.
//
//
//= require jszip

// IFFE to prevent pollution of the global namespace
//(function(){

const outputElementId = 'output';
const zipUploadElementId = 'input_upload';
const base64InputElementId = 'project_input';
const fileListElementId = 'file-list';
const runProjectElementId = 'run_project';

var currentFile = "";
var timer;
var runProjectFn = function() {
  throw "There isn't a project loaded";
}


$().ready(function(){
  // Initialize DOM elements
  let base64Input = document.getElementById(base64InputElementId);
  let zipInput = document.getElementById(zipUploadElementId);
  let runProject = document.getElementById(runProjectElementId);

  // Load input editor 
  if (base64Input.value != '') {
    loadZipFromBase64Input()
      .then(function success(zip) {
        loadIDE(zip);
      }, function error(e) {
        throw("unable to load zip from base 64 input");
      });
  }
  else if (zipInput.files.length > 0) {
    tryLoadZipFromUpload();
  }

  // Load output editor
  let output = document.getElementById(outputElementId);
  editor2.setValue(output.value);

  // handle the run button click
  $(runProject).on('click', function() {
    // try to run the projet
    // if the project is unable to run, there probably isn't a zip file loaded
    try {
      runProjectFn()
    }
    catch(err) {
      let zip = new JSZip();
      zip.file("main.c", editor.getValue());
      loadIDE(zip);
      generateBase64AndSubmitForm(zip);
    }
  });

  // handle the zip file upload button
  $(zipInput).change(tryLoadZipFromUpload);

  let projectFormSelectors = 'form.new_project, form.edit_project';
  $(projectFormSelectors).on('ajax:success', projectUpdateSuccess);
  // TODO account for if it is a failure. We would need to send it again
});


function handleEditor2ChangeSelection(zip) {
  let cursorPos = editor2.getSelection().getCursor();
  let contentInRow = editor2.getSession().getLine(cursorPos.row);
  contentInRow = contentInRow.trim();

  let matchStrings = [
    /\/home\/ubuntu\/src\/smack_server\/public\/system\/projects\/\d*\/(.*)\((\d*),(\d*)\)/,
    /\/home\/ubuntu\/src\/smack_server\/public\/system\/projects\/\d*\/(.*):(\d*):(\d*)/
  ];

  matchStrings.forEach(function(matchString) {
    let match = contentInRow.match(matchString);
    if (match) {
      let fileName = match[1];
      let rowNum = match[2];
      let colNum = match[3];

      rowNum -= 1;
        // rows are zero based

      setCurrentFile(zip, fileName, function() {
        editor.navigateTo(rowNum, colNum);
      });
    }
  });
}


function projectUpdateSuccess(event, data, status, xhr) {
  timer = setInterval(function() {ajaxCall(data.id)}, data.eta)
}

function ajaxCall(id)
{
    $.ajax({
        type: "GET",
        data: {
            format: 'json'
        },
        dataType: "json",
        url: "/projects/" + id ,
        success: function(data){
            console.log(data.eta);
            if(data.eta == 0) {
                editor2.setValue(data.output);
                clearInterval(timer);
            }
        }
    });
}

function tryLoadZipFromUpload() {
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
}


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


/**
 * @description Populates the file list and adds events listeners
 */
function loadIDE(zip) {
  console.log("loading IDE");

  // Empty the files list in case the editor
  // has already been loaded once before
  emptyFileList();

  // Load each file as a string and add it to the file list
  let filePaths = [];
  let firstFile = "";
  zip.forEach(function (relativePath, file) {
    filePaths.push(relativePath);

    addFileToFileList(zip, relativePath);

    // Set the input editor to the first file that isn't a folder
    if (firstFile.length == 0 && !relativePath.endsWith('/')) { 
      firstFile = relativePath; 
      setCurrentFile(zip, firstFile);
    }
  });

  filePaths;
  //let data = createFilePathsObject(filePaths);
  //debugger;



  runProjectFn = function() {
    console.log("running project");
    editor2.setValue('Processing...');

    generateBase64AndSubmitForm(zip);
    return false;
  };

  // Update the zip file every time the editor loses focus
  editor.on('blur', function() {
    zip.file(currentFile, editor.getValue());
  });

  // handle clicking on editor2
  editor2.on("changeSelection", function() {
    handleEditor2ChangeSelection(zip)
  });
}


/**
 * Generates the base64 for the given zip and
 * submits the pages form
 */
function generateBase64AndSubmitForm(zip) {
  // zip up the files and ask rails to submit it
  zip.generateAsync({type: "base64"})
    .then(function (content) {
      var base64Input = document.getElementById(base64InputElementId);
      base64Input.value = content;
      $.rails.handleRemote($('form'));
    });
}


function createFilePathsObject(filePaths) {
  data = [];

  let prefix = "";
  let dataIndex = -1;
    // the index where children should be added
  filePaths.forEach(function(filePath) {

    if (filepath.includes(prefix)) {
      // continue down the path
      
      // if (filepath - prefix) contains a /
      // set the label up to the last / and add it to the prefix
    }
    else {
      // reset the prefix and start over
    }

    /*
     * This part is old. I am not using it for now
    // first filePath is either a file or folder
    // if it ends in a / it is a folder
    // else a file
    if (filePath.endsWith('/') {
      filePathParts = filePath.split('/');
      numParts filePathParts.length;
      label = 

      label = filePath.split('/')
    }
    */
    
  });

  return data;
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
  fileElement.onclick = function() { setCurrentFile(zip, filename); };
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
function setCurrentFile(zip, filename, callback) {
  // don't change the editor if they click on a folder
  if (filename.endsWith('/')) {
    return;
  }

  // remove the styling from the old current file
  if (currentFile != "") {
    let curFileElement = document.getElementById(currentFile);
    if (curFileElement != null) {
      curFileElement.classList.remove("current-file");
    }
  }

  currentFile = filename;

  // add styling to the new current file
  let currentFileElement = document.getElementById(currentFile);
  currentFileElement.classList.add("current-file");

  // input editor variable is called editor
  zip.file(filename).async("string")
    .then(function success(content) {
      // use the content
      editor.setValue(content);
      if (callback) {
        callback();
      }
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

//})();
