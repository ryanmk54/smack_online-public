RunProjectForm = (function() {
  "use strict";

  var addRunField,
      init,
      pollDelay,
      requestOutputFromServer,
      startPollingServerForOutput,
      submitWithUpdatedBase64,
      startTimer,
      intervalId,
      timer;

  init = function() {
    pollDelay = 0;
    timer = -1;
    $(document).on('click', '#run_button', submitWithUpdatedBase64);
    $(document).on('ajax:beforeSend', '#run-project-form', addRunField);
    $(document).on('ajax:success', '#run-project-form', startPollingServerForOutput);
  };


  startPollingServerForOutput = function(data, status, xhr) {
    if (pollDelay != 0) {
      console.log("A request is pending");
      return;
    }
    timer = -1;
    requestOutputFromServer();
  };

  requestOutputFromServer = function() {
    var url = document.getElementById('poll-form').action;
    setTimeout(function() {
      $.ajax({
        type: "GET",
        dataType: 'json',
        url: url,
        success: function(data, textStatus, jqXHR) {
          console.log(data.eta);
          pollDelay = data.eta*250; // eta is in seconds, poll every 1/4th of the eta
          if (data.eta == 0) {
            OutputEditor.set(data.output);
            clearInterval(intervalId);
          }
          else {
            if(timer == -1)
            {
              OutputEditor.set("Estimated time remaining: " + data.eta + " Seconds");
              timer = data.eta;
              startTimer();
            }
            requestOutputFromServer();
          }
        },
        error: function(jqXHR, textStatus, errorThrown) {
          throw(errorThrown);
        }
      });
    }, pollDelay)
  }
  
  startTimer = function() {
    intervalId = setInterval(function()
    {
      if(timer != 0) {
        timer--;
        OutputEditor.set("Estimated time remaining: " + timer + " Seconds");
      }
      else {
        clearInterval(intervalId);
      }
    }, 1000);
  };

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
