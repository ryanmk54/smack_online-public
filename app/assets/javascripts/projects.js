// Read Sprockets README (https://github.com/rails/sprockets#sprockets-directives) for details
// about supported directives.
//
//= require dropdowns-enhancement
//= require bootstrap-select
//= require bootstrap-tour.min
//= require jszip
//= require tree.jquery

const capstoneName = "SMACK Online";
const id = {
  base64Input: 'project_input',
  base64Output: 'output',
  zipUpload: 'input_upload',
  fileList: 'file-list',
  runProject: 'run_project',
  projectTitle: 'project_title'

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
      zip.loadAsync(base64Input.value, {base64: true})
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

  let projectFormSelector = '#options-and-run-row form';
  $(projectFormSelector).on('ajax:success', projectUpdateSuccess);
  // TODO account for if it is a failure. We would need to send it again

  // TODO on form.new_project, it should go to projectUpdateSuccess
  // TODO on form.edit_project it should go to pollForOutputUpdates

  watchProjectTitleForm();

  let tour = initTour();
  $("#start-tutorial-btn").on('click', function(){ tour.start(true); });

  // LOGIC FOR SWITCHING OPTIONS MENUS
  // Set the options menu html to the html of the hidden field associated with
  // the value of the drop down menu value (service-selector.val == service-options.id)
  $("#optionsMenu").html($("#" + $("#service-selector").find(":selected").val()).html());
  $("#service-selector").change(function()
  {
    $("#optionsMenu").html($("#" + $(this).find(":selected").val()).html());
  });
});


function watchProjectTitleForm() {
  lastTitle = $('#project-title-form #project_title')[0].value;

  let updateProjectIfTitleChanged = function() {
    currentTitle = $('#project-title-form #project_title')[0].value;

    // if the title hasn't changed do nothing
    if (currentTitle == lastTitle){
      return false;
    }

    // if it has changed updated the cached title and
    // the project stored on the server
    lastTitle = currentTitle;
    $.rails.handleRemote($('#project-title-form'));
    return false;
  }

  $('#project-title-form').submit(updateProjectIfTitleChanged);
  $('#project-title-form #project_title').blur(updateProjectIfTitleChanged);
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
  // TODO replace title form and project form

  pollForOutputUpdates(data);
}


function pollForOutputUpdates(data) {
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
  let zipUpload = document.getElementById(id.zipUpload);

  if (isZipUploadValid(zipUpload)) {
    // if the zip is valid, clear any previous errors
    clearZipError();

    loadZipFromFileUpload()
      .then(function success(zip) {
        setProjectTitleIfEmptyToZipName(zipUpload);
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


/**
 * Sets the project title to the name of the zip file 
 * if the project doesn't have a title
 */
function setProjectTitleIfEmptyToZipName(zipUpload) {
  let currentProjectTitle = getProjectTitle();
  if (currentProjectTitle == "") {
    let title = zipUpload.files[0].name;
    title = title.replace(/\.[^/.]+$/, "");
    setProjectTitle(title);
  }
}


function getProjectTitle() {
  return document.getElementById(id.projectTitle).value;
}


function setProjectTitle(title) {
  document.getElementById(id.projectTitle).value = title;
  $.rails.handleRemote($('#project-title-form'));
}


function isZipUploadValid(zipUpload) {
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

function initTour() {
  let tour = new Tour({
    storage: false,
    steps: [
    {
      element: "#select-service-dropdown",
      title: "Welcome to " + capstoneName + "!",
      content: "Select the service you would like to use"
    },
    {
      element: "#project_title",
      title: "Naming your project",
      content: "Give your project a descriptive title that will be shown on the community page"
    },
    {
      element: "#upload-project-container",
      title: "Upload your source code",
      content: "Upload a zip file containing your source code"
    },
    {
      element: "#options-col",
      title: "Options",
      content: "Choose your options here"
    },
    {
      element: "#run_project",
      title: "Running your project",
      content: "As soon as you're ready, hit run!"
    }
    ]
  });

  tour.init();
  return tour;
}
