// Read Sprockets README (https://github.com/rails/sprockets#sprockets-directives) for details
// about supported directives.
//
//
//= require bootstrap-select
//= require jszip
//= require tree.jquery

const id = {
  base64Input: 'project_input',
  base64Output: 'output',
  zipUpload: 'input_upload',
  fileList: 'file-list',
  runProject: 'run_project'
}


/* Invariant: These variables are defined 
 * as soon as the ready function is called
 */
var $jqtree;
var zip;
var currentFile;
var editor;
var editor2;

var lastTitle;

var timer;
var runProjectFn = function() {
  throw "There isn't a project loaded";
}


$().ready(function(){
  "use strict";

  initAceEditors();
  initJqTree();

  // Load input editor 
  let base64Input = document.getElementById(id.base64Input);
  let zipInput = document.getElementById(id.zipUpload);
  zip = new JSZip();
  if (base64Input.value != '') {
      zip.loadAsync(base64Input, {base64: true})
      .then(function success(zip) {
        loadIDE();
      }, function error(e) {
        throw("unable to load zip from base 64 input");
      });
  }
  else if (zipInput.files.length > 0) {
    tryLoadZipFromUpload();
  }

  // Load output editor
  let output = document.getElementById(id.base64Output);
  editor2.setValue(output.value);

  // handle the run button click
  let runProject = document.getElementById(id.runProject);
  $(runProject).on('click', function() {
    // try to run the projet
    // if the project is unable to run, there probably isn't a zip file loaded
    if (runProjectFn == undefined) {
      let zip = new JSZip();
      zip.file("main.c", editor.getValue());
      loadIDE(zip);
      generateBase64AndSubmitForm(zip);
    }
    else {
      runProjectFn()
    }
  });

  // handle the zip file upload button
  $(zipInput).change(tryLoadZipFromUpload);

  let projectFormSelectors = 'form.new_project, form.edit_project';
  $(projectFormSelectors).on('ajax:success', projectUpdateSuccess);
  // TODO account for if it is a failure. We would need to send it again
  //

  watchProjectTitleForm();
});


function watchProjectTitleForm() {
  lastTitle = $('#project-title-form #project_title')[0].value;
  $("#project_title").on('blur', function(evt) {
    if (evt.target.value == lastTitle){
      return;
    }
    lastTitle = evt.target.value;
    $.rails.handleRemote($('#project-title-form'));
  });
}


function initAceEditors() {
  editor = ace.edit("editor1");
  editor.$blockScrolling = Infinity;
  editor.setTheme("ace/theme/clouds");
  editor.session.setMode("ace/mode/c_cpp");

  editor2 = ace.edit("editor2");
  editor2.$blockScrolling = Infinity;
  editor2.setTheme("ace/theme/twilight");
  editor2.session.setMode("ace/mode/c_cpp");
  editor2.setReadOnly(true);
}


function initJqTree() {
  $jqtree = $('#file-list');
  $jqtree.tree({
    data: {},
    autoOpen: 1,
    selectable: false,
    useContextMenu: false,
    onCreateLi: function(node, $li) {
      //$li.attr('id', node.relativePath);
      $li.find('.jqtree_common').attr('id', node.relativePath);
      //$li.find('.jqtree-title').data("relativePath", node.relativePath);
    }
  });

  $jqtree.on('click', 'li .jqtree_common:not(.jqtree-folder)', function(e) {
    //console.log(e);
    //console.log($(e.target).data("relativePath"));

    setCurrentFile( $(e.target).attr('id') );
  });
}


function handleEditor2ChangeSelection() {
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

      setCurrentFile(fileName, function() {
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
        loadIDE();
      }, function error(e) {
        throw("unable to load zip from file upload");
      });
  }
}


/**
 * @description Loads a zip object from the zip file uploaded by the user
 *
 * @see https://stuk.github.io/jszip/documentation/api_jszip/load_async_object.html
 */
function loadZipFromFileUpload() {
  var zipInputElement = document.getElementById(id.zipUpload);
  zip = new JSZip();
  return zip.loadAsync(zipInputElement.files[0]);
}


/**
 * @description Populates the file list and adds events listeners
 */
function loadIDE() {
  console.log("loading IDE");

  // Load each file as a string and add it to the file list
  let data = [];
  let dataPosStack = [data];
  let dirPrefixStack  = [""];

  let firstFile = "";
  zip.forEach(function (relativePath, file) {
    let curNode = {
      name: file.name,
      relativePath: relativePath,
      dir: file.dir
    }
    let lastDirPrefix = dirPrefixStack[dirPrefixStack.length - 1];
    if (file.dir && !relativePath.startsWith(lastDirPrefix)) {
      dataPosStack.pop();
      dirPrefixStack.pop();
        // pop dirPosStack
      lastDirPrefix = dirPrefixStack[dirPrefixStack.length - 1];
        // update lastDirPrefix
    }
    if (relativePath.startsWith(lastDirPrefix)) {
      curNode.name = curNode.name.replace(lastDirPrefix, "");
    }

    // add curNode to dataPosStack
    let dataPos = dataPosStack[dataPosStack.length - 1];
    dataPos.push(curNode);

    if (file.dir && relativePath.startsWith(lastDirPrefix)) {
      curNode.children = [];
        // add children to curNode
      dataPosStack.push(curNode.children);
        // add children to dirPosStack
      dirPrefixStack.push(relativePath);
    }

    // Set the input editor to the first file that isn't a folder
    if (firstFile.length == 0 && !relativePath.endsWith('/')) { 
      firstFile = relativePath; 
    }
  });

  $jqtree.tree('loadData', data);
  setCurrentFile(firstFile);

  runProjectFn = function() {
    console.log("running project");
    editor2.setValue('Processing...');

    generateBase64AndSubmitForm();
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
function generateBase64AndSubmitForm() {
  // zip up the files and ask rails to submit it
  zip.generateAsync({type: "base64"})
    .then(function (content) {
      var base64Input = document.getElementById(id.base64Input);
      base64Input.value = content;
      $.rails.handleRemote($('#run-project-form'));
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


// Unzips the file out of zip and 
// sets the contents of the editor 
// to the contents of the file
function setCurrentFile(filename, callback) {
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
      editor.navigateTo(0, 0);
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
  var zipUpload = document.getElementById(id.zipUpload);

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
