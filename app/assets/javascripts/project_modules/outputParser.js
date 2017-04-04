/**
 * External Variables: OutputEditor
 */
var OutputParser = (function() {
  "use strict";

  var init, 
      closeVerifyStatusBox,
      getDescription,
      getHeader,
      getIconClass,
      getStatusClass,
      handleVerifyStatusBox,
      showOutputModal,
      setStatus,
      updateStatus;

  init = function() {
    updateStatus();
  };


  getIconClass = function() {
    var status = getStatusClass();
    switch(status) {
      case "success":
        return "glyphicon glyphicon-ok-sign";
      case "sending":
      case "waiting":
        return "glyphicon glyphicon-info-sign";
      case "failure":
        return "glyphicon glyphicon-remove-sign";
      default:
        throw("Invalid case used");
    }
  }


  showOutputModal = function() {
    var description = getDescription();
    var verifyStatusBox = "" +
      "<div id='verify-status-box'>" +
        "<span class='right-side'>" +
          "<span id='verify-status-header'>" + getHeader() + "</span>" + 
          "<p>" + description + "</p>" + 
        "</span>" +
        "<div id='verify-status-icon-box' class='" + getStatusClass() + "'>" +
          "<span class='" + getIconClass() + "'></span>" +
        "</div>" +
        "<div id='verify-status-close-icon'>" +
          "<span class='glyphicon glyphicon-remove'></span>" +
        "</div>" +
        "</div>";
    var verifyStatusBoxEl = $(verifyStatusBox);
    verifyStatusBoxEl.on('click', null, getStatusClass() == "success", handleVerifyStatusBox);
    closeVerifyStatusBox();
    $("#input-editor-container").append(verifyStatusBoxEl);
    $("#verify-status-close-icon").on('click', closeVerifyStatusBox);
    updateStatus();
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
    var status = getStatusClass();
    if (status == "success") {
      return "Success!";
    } else if (status == "sending" || status == "waiting") {
      return "Pending...";
    } else {
      return "Failure!";
    }
  };


  getStatusClass = function() {
    var output = OutputEditor.get();
    var successText = "SMACK found no errors";
    var sendingText = "Sending code to server";
    var waitingText = "Estimated time remaining:";
    if (output.length == 0) {
      return "empty";
    }
    if (output.indexOf(successText) != -1) {
      return "success";
    }
    if (output.indexOf(sendingText) != -1) {
      return "sending";
    }
    if (output.indexOf(waitingText) != -1) {
      return "waiting";
    }
    return "failure";
  };


  getDescription = function() {
    var status = getStatusClass();
    if (status == "empty") {
      return "Not yet verified";
    } else if (status == "success") {
      return "No errors found";
    } else if (status == "sending") {
      return "Sending code to SMACK";
    } else if (status == "waiting") {
      return "Waiting for a response from SMACK";
    } else {
      return "Errors found. Click to view error log";
    }
  };


  setStatus = function(text) {
    $("#project-status").val(text);
  }


  updateStatus = function() {
    setStatus(getDescription());
  }


  return {
    init,
    getDescription,
    getHeader,
    showOutputModal,
    setStatus,
    updateStatus
  };

})();
