/**
 * External Variables: Title
 */
var FileUpload = (function() {
  "use strict";

  var zipUpload,

      clearZipError,
      displayZipError,
      init,
      isZipUploadValid,
      loadFileTreeFromZipUpload,
      tryLoadFileTreeFromZipUpload;

  clearZipError = function() {
    displayZipError("");
  }


  displayZipError = function(errorMessage) {
    var errorSpanElement = document.getElementById("input_upload_status");
    errorSpanElement.textContent = errorMessage;

    if (errorMessage != '') {
      console.error(errorMessage);
    }
  }


  init = function() {
    zipUpload = document.getElementById("input_upload");

    // Reset file upload to clear cache
    $(zipUpload).val("");

    // load the FileTree when they upload a zip
    $(zipUpload).change(tryLoadFileTreeFromZipUpload);
  };


  isZipUploadValid = function() {
    // Verify only one file was uploaded
    if (zipUpload.files.length != 1) {
      displayZipError("Multiple files aren't allowed");
      return false;
    }

    // Check the MIME type
    var mimeType = zipUpload.files[0].type;
    var validMimeTypes = [
      "application/zip", 
      "application/x-zip-compressed",
      "application/octet-stream"
    ];
    if ($.inArray(mimeType, validMimeTypes) == -1) {
      displayZipError("Only zip files are allowed");
      console.error("MIME type " + mimeType + " not supported");
      return false;
    }

    return true;
  };


  loadFileTreeFromZipUpload = function() {
    var zip = new JSZip();
    zip.loadAsync(zipUpload.files[0])
      .then(function success(zip) {
        FileTree.init(zip);
      }, function error(e) {
        throw("Unable to load zip files");
      });
  };


  tryLoadFileTreeFromZipUpload = function() {
    if (isZipUploadValid()) {

      // if the zip is valid, clear any previous errors
      clearZipError();

      var zipName = zipUpload.files[0].name;
      var zipNameWithoutExtension = zipName.replace(/\.[^/.]+$/, "");
      Title.setIfEmpty(zipNameWithoutExtension);
      loadFileTreeFromZipUpload();
    }
  }

  return {
    init: init
  }
}());
