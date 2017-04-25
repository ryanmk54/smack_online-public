/** 
 * Shows OutputNotifications 
 * and the status
 * based on the contents of
 * the OutputEditor
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

  /** Initializes the OutputParser */
  init = function() {
    updateStatus();
  };


  /** Returns the icon class to show the correct icon in the notification */
  getIconClass = function() {
    var status = getStatusClass();
    switch(status) {
      case "success":
        return "glyphicon glyphicon-ok-sign";
      case "sending":
      case "waiting":
        return "glyphicon glyphicon-info-sign";
      case "no-code":
      case "failure":
        return "glyphicon glyphicon-remove-sign";
      default:
        throw("Invalid case used");
    }
  }


  /** Shows the Output notification */
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
    verifyStatusBoxEl.on('click', null, handleVerifyStatusBox);
    closeVerifyStatusBox();
    $("#input-editor-container").append(verifyStatusBoxEl);
    $("#verify-status-close-icon").on('click', closeVerifyStatusBox);
    updateStatus();
  };


  /** Closes the Output Nofication */
  closeVerifyStatusBox = function() {
    $("#verify-status-box").remove();
  }


  /** Open the Output Editor when the the user clicks on the notification */
  handleVerifyStatusBox = function(event) {
    ResizeOutputEditor.expand();
  }


  /** Returns the header of the Output Notification */
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


  /** 
   * Returns the status of the verification
   * This is used throughout the rest of this module
   * to know what to return
   */
  getStatusClass = function() {
    var output = OutputEditor.get();
    var successText = "SMACK found no errors";
    var sendingText = "Sending code to server";
    var waitingText = "Estimated time remaining:";
    var longerThanExpected = "This is taking longer than expected";
    var noCodeText = "no code";
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
    if (output.indexOf(longerThanExpected) != -1) {
      return "waiting";
    }
    if (output.indexOf(noCodeText) != -1) {
      return "no-code";
    }
    return "failure";
  };


  /** Returns the description of the Output Notification */
  getDescription = function() {
    var status = getStatusClass();
    if (status == "empty") {
      return "Not yet verified";
    } else if (status == "success") {
      return "No errors found";
    } else if (status == "sending") {
      return "Sending code to SMACK";
    } else if (status == "no-code") {
      return "There is no code to send to SMACK";
    } else if (status == "waiting") {
      var output = OutputEditor.get();
      return output;
    } else {
      return "Errors found. Click to view error log";
    }
  };


  /** 
   * Sets the status of the status text box
   * Used to say Not Yet Verified
   */
  setStatus = function(text) {
    $("#project-status").val(text);
  }


  /** Sets the status to the same thing as the description */
  updateStatus = function() {
    setStatus(getDescription());
  }


  /** Public methods */
  return {
    init,
    getDescription,
    getHeader,
    showOutputModal,
    setStatus,
    updateStatus
  };

})();
