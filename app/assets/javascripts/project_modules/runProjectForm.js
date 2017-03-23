RunProjectForm = (function() {
  "use strict";

  var defaultTimeout,
      maxRetries,
      numRetried,
      pollDelay,
      timeout;

  var init,
      addRunField,
      requestOutputFromServer,
      startPollingServerForOutput,
      submitWithUpdatedBase64;

  init = function() {
    pollDelay = 0;
    defaultTimeout = 1000;
    timeout = defaultTimeout;
    maxRetries = 5;
    numRetried = 9;
    $(document).on('click', '#run_button', submitWithUpdatedBase64);
    $(document).on('ajax:beforeSend', '#run-project-form', addRunField);
    $(document).on('ajax:success', '#run-project-form', startPollingServerForOutput);
  };


  startPollingServerForOutput = function(data, status, xhr) {
    if (pollDelay != 0) {
      console.log("A request is pending");
      return;
    }
    requestOutputFromServer();
  };

  requestOutputFromServer = function() {
    var url = document.getElementById('poll-form').action;
    setTimeout(function() {
      $.ajax({
        type: "GET",
        dataType: 'json',
        url: url,
        timeout: timeout,
        success: function(data, textStatus, jqXHR) {
          console.log(data.eta);
          pollDelay = data.eta;
          if (data.eta == 0) {
            numRetried = 0;
            timeout = defaultTimeout;
            OutputEditor.set(data.output);
          }
          else {
            timeout = data.eta;
            OutputEditor.set("Estimated time remaining: " + data.eta + "ms");
            requestOutputFromServer();
          }
        },
        error: function(jqXHR, textStatus, errorThrown) {
          if (numRetried > maxRetries) {
            OutputEditor.set("Unable to contact server");
            throw(errorThrown);
          }
          else {
            console.log("timeout");
            numRetried++;
            requestOutputFromServer();
          }
        }
      });
    });
  }


  submitWithUpdatedBase64 = function(event) {
    OutputEditor.set("Sending code to server");
    InputEditor.save();
    FileTree.getBase64()
      .then(function (content) {
        $("#run-project-form #project_input").val(content);
        $.rails.handleRemote($("#run-project-form"));
      });
    return false;
  };

  addRunField = function(event, xhr, settings) {
    settings.data += "&run=run";
  }

  return {
    init: init
  };
}());
