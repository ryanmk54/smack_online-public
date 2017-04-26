//= require tree.jquery

/**
 * File tree that is on the side of the Editor
 */
var FileTree = (function() {
  "use strict";

  var zip,              // zip var returned by jszip
      jqtree,           // jqtree returned by jqtree
      currentFileName,  // current highlighted filename

      // Methods
      getBase64,              // returns the base64 from the zip
      init,                   // initializes the FileTree
      initJqTree,             // initializes the jqTree
      loadFileTree,           // loads the file tree with the contents of zip
      setCurrentFile,         // sets the current filename to the given file
      setValueOfCurrentFile,  // sets the contents of the current file
      tryLoadFromBase64Input; // loads the filetree from base64, if there is any


  /** Returns the contents of the filetree as base64 */
  getBase64 = function() {
    return zip.generateAsync({type: "base64"});
  };


  /** 
   * Initializes the filetree
   * This method needs to be called before anything else
   */
  init = function(_zip) {
    initJqTree();

    // If a zip is passed in, use that instead
    if (_zip) {
      zip = _zip;
      loadFileTree();
    }
    // Otherwise, load from bas64input
    else {
      tryLoadFromBase64Input();
    }
  };


  /**
   * Initialize the jqTree
   */
  initJqTree = function() {
    jqtree = $('#file-list');
    jqtree.tree({
      data: {},
        // start empty
      autoOpen: 1,
        // automatically open nodes when added

      // Don't use the selection feature of contextMenu feature
      selectable: false,
      useContextMenu: false,


      // Add an the filepath as the id to the nodes
      onCreateLi: function(node, $li) {
        //$li.attr('id', node.relativePath);
        $li.find('.jqtree_common').attr('id', node.relativePath);
        //$li.find('.jqtree-title').data("relativePath", node.relativePath);
      }
    });

    // Set the current file to the file that was clicked on
    jqtree.on('click', 'li .jqtree_common:not(.jqtree-folder)', function(e) {
      setCurrentFile( $(e.target).attr('id') );
    });
  };


  /**
   * Loads the file tree
   * 
   * Iterates through the zip and loads the jqtree
   */
  loadFileTree = function() {
    var data = [];
    var dataPosStack = [data];
    var dirPrefixStack  = [""];

    var firstFile = "";

    // Iterate through the zip
    zip.forEach(function (relativePath, file) {
      var curNode = {
        name: file.name,
        relativePath: relativePath,
        dir: file.dir
      }

      // Use a stack to keep track of the directory hierarchy
      var lastDirPrefix = dirPrefixStack[dirPrefixStack.length - 1];
      if (file.dir && !relativePath.startsWith(lastDirPrefix)) {
        dataPosStack.pop();
        dirPrefixStack.pop();
          // pop dirPosStack
        lastDirPrefix = dirPrefixStack[dirPrefixStack.length - 1];
          // update lastDirPrefix
      }

      // Only show the filename, not the whole filepath
      if (relativePath.startsWith(lastDirPrefix)) {
        curNode.name = curNode.name.replace(lastDirPrefix, "");
      }

      // add curNode to dataPosStack
      var dataPos = dataPosStack[dataPosStack.length - 1];
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

    // add the files to the jqtree
    jqtree.tree('loadData', data);

    // set the current file to the first file
    setCurrentFile(firstFile);
  }


  // Unzips the file out of zip and 
  // sets the contents of the editor 
  // to the contents of the file
  setCurrentFile = function(filename, rowNum, colNum) {
    // don't change the editor if they click on a folder
    if (filename.endsWith('/')) {
      return;
    }

    // remove the styling from the old current file
    if (currentFileName != "") {
      var curFileElement = document.getElementById(currentFileName);
      if (curFileElement != null) {
        curFileElement.classList.remove("current-file");
      }
    }

    currentFileName = filename;

    // add styling to the new current file
    var currentFileElement = document.getElementById(currentFileName);
    currentFileElement.classList.add("current-file");

    // Unzip the current file and set the contents of the Input Editor to it
    zip.file(filename).async("string")
      .then(function success(content) {
        InputEditor.set(content);
        InputEditor.navigateTo(rowNum, colNum);
      }, function error(e) {
        throw(e);
      });
  };


  /**
   * Sets the content of the current file to the given value
   */
  setValueOfCurrentFile = function(value) {
    // If a zip exists, set the current file
    if (currentFileName) {
      zip.file(currentFileName, value);
    }

    // else create a zip with a file called main.c
    else {
      zip.file("main.c", value);
    }
  };


  /**
   * Loads the filetree from base64 input if there is any
   *
   * If this project has input, 
   * the zip is loaded from the input,
   * then the filetree is loaded from the zip
   */
  tryLoadFromBase64Input = function() {
    // Get the base64
    var base64 = $("#project_input").val();

    // Only load the filetree if the base64 contains data
    if (base64) {
      zip = JSZip();
      zip.loadAsync(base64, {base64: true})
        .then(function success(zip) {
          loadFileTree();
        }, function error(e) {
          throw("Unable to load project from server");
        });
    } else {
      zip = JSZip();
    }
  };


  // These are our public methods
  return {
    init,
    getBase64,
    setCurrentFile,
    setValueOfCurrentFile
  };
})();
