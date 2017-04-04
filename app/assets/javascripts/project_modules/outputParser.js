/**
 * External Variables: OutputEditor
 */
var OutputParser = (function() {
  "use strict";

  var successText,

      init, 
      closeVerifyStatusBox,
      getDescription,
      getHeader,
      getIconClass,
      getStatus,
      handleVerifyStatusBox,
      showOutputModal;

  init = function() {
    successText = "SMACK found no errors";
  };


  getIconClass = function() {
    var status = getStatus();
    switch(status) {
      case "success":
        return "glyphicon glyphicon-ok-sign";
      case "sending":
        return "glyphicon glyphicon-info-sign";
      case "failure":
        return "glyphicon glyphicon-remove-sign";
      default:
        throw("Invalid case used");
    }
  }


  showOutputModal = function() {
    var verifyStatusBox = "" +
      "<div id='verify-status-box'>" +
        "<span class='right-side'>" +
          "<span id='verify-status-header'>" + getHeader() + "</span>" + 
          "<p>" + getDescription() + "</p>" + 
        "</span>" +
        "<div id='verify-status-icon-box' class='" + getStatus() + "'>" +
          "<span class='" + getIconClass() + "'></span>" +
        "</div>" +
        "<div id='verify-status-close-icon'>" +
          "<span class='glyphicon glyphicon-remove'></span>" +
        "</div>" +
        "</div>";
    var verifyStatusBoxEl = $(verifyStatusBox);
    verifyStatusBoxEl.on('click', null, getStatus() == "success", handleVerifyStatusBox);
    closeVerifyStatusBox();
    $("#input-editor-container").append(verifyStatusBoxEl);
    $("#verify-status-close-icon").on('click', closeVerifyStatusBox);
  };


  closeVerifyStatusBox = function() {
    $("#verify-status-box").remove();
  }


  handleVerifyStatusBox = function(event) {
    if (event.data) {
      closeVerifyStatusBox();
    } else {
      ResizeOutputEditor.expand();
    }
  }


  getHeader = function() {
    var status = getStatus();
    if (status == "success") {
      return "Success!";
    } else if (status == "sending") {
      return "Pending...";
    } else {
      return "Failure!";
    }
  };


  getStatus = function() {
    var output = OutputEditor.get();
    var successText = "SMACK found no errors";
    var sendingText = "Sending code to server";
    if (output.indexOf(successText) != -1) {
      return "success";
    }
    if (output.indexOf(sendingText) != -1) {
      return "sending";
    }
    else {
      return "failure";
    }
  };


  getDescription = function() {
    var status = getStatus();
    if (status == "success") {
      return "No errors found";
    } else if (status == "sending") {
      return "Sending code to SMACK";
    } else {
      return "Click to view error log";
    }
  };


  return {
    init,
    getDescription,
    getHeader,
    showOutputModal
  };

})();
