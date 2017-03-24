//= require tree.jquery

/**
 * External Variables: InputEditor
 *
 */
var FileTree = (function() {
  "use strict";

  var zip,
      jqtree,
      currentFileName,

      editFileName,
      getBase64,
      init,
      initJqTree,
      loadFileTree,
      renameFile,
      setCurrentFile,
      setValueOfCurrentFile,
      saveToServer,
      tryLoadFromBase64Input;


  editFileName = function(fullFilepath, filename) {
    console.log(filename);
    var el = document.getElementById(fullFilepath);
    $(el).addClass("editing");
    var titleEl = $(el).children(".jqtree-title");
    var newFilenameTextBox = $("<input type='text'/>");
    newFilenameTextBox.val(filename);
    newFilenameTextBox.blur(filename, renameFile);
    $(titleEl).html(newFilenameTextBox);
  }


  getBase64 = function() {
    return zip.generateAsync({type: "base64"});
  }


  init = function(_zip) {
    initJqTree();

    if (_zip) {
      zip = _zip;
      loadFileTree();
    }
    else {
      tryLoadFromBase64Input();
    }
  };


  initJqTree = function() {
    jqtree = $('#file-list');
    jqtree.tree({
      data: {},
      autoOpen: 1,
      selectable: false,
      useContextMenu: false,
      onCreateLi: function(node, $li) {
        var fileItem = $li.find('.jqtree-element.jqtree_common');
        fileItem.attr('id', node.relativePath);
        fileItem.addClass('file-item');
        var iconHtml = "<span class='file-icon glyphicon glyphicon-pencil pull-right'></span>";
        fileItem.append(iconHtml);
      }
    });

    jqtree.on('click', 'li .jqtree-title:not(.jqtree-folder)', function(e) {
      var fileItem = $(e.target).parent();
      if (!fileItem.hasClass("editing")){
        setCurrentFile( $(e.target).parent().attr('id') );
      }
    });
    jqtree.on('click', 'li .glyphicon-pencil', function(e) {
      var fileItem = $(e.target).parent();
      if (!fileItem.hasClass("editing")){
        var fullFilepath = fileItem.attr('id');
        var filename = fileItem.children('.jqtree-title').text();
        editFileName(fullFilepath, filename);
      }
    });
  };


  loadFileTree = function() {
    var data = [];
    var dataPosStack = [data];
    var dirPrefixStack  = [""];

    var firstFile = "";
    zip.forEach(function (relativePath, file) {
      var curNode = {
        name: file.name,
        relativePath: relativePath,
        dir: file.dir
      }
      var lastDirPrefix = dirPrefixStack[dirPrefixStack.length - 1];
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

    jqtree.tree('loadData', data);
    setCurrentFile(firstFile);
  };

  renameFile = function(fullFilepath, oldFilename) {
    console.log(oldFilename);
  };


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

    // input editor variable is called editor
    zip.file(filename).async("string")
      .then(function success(content) {
        // use the content
        InputEditor.set(content);
        InputEditor.navigateTo(rowNum, colNum);
      }, function error(e) {
        throw(e);
      });
  };


  setValueOfCurrentFile = function(value, save) {
    if (zip) {
      zip.file(currentFileName, value);
    }
    else {
      zip = new JSZip();
      zip.file("main.c", value);
    }

    if (save) {
      saveToServer();
    }
  };


  saveToServer = function() {
    zip.generateAsync({type: "base64"})
      .then(function (content) {
        $("#file_tree_form #project_input").val(content);
        $.rails.handleRemote($("#file_tree_form"));
      });
  };


  tryLoadFromBase64Input = function() {
    var base64 = $("#project_input").val();
    if (base64) {
      zip = JSZip();
      zip.loadAsync(base64, {base64: true})
        .then(function success(zip) {
          loadFileTree();
        }, function error(e) {
          throw("Unable to load project from server");
        });
    }
  };


  return {
    init: init,
    getBase64,
    saveToServer,
    setCurrentFile,
    setValueOfCurrentFile
  };
})();
