RunProjectForm = (function() {
  "use strict";

  var init,
      pollDelay,
      requestOutputFromServer,
      startPollingServerForOutput,
      submitWithUpdatedBase64,
      timer;

  init = function() {
    pollDelay = 0;
    $(document).on('click', '#run_button', submitWithUpdatedBase64);
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
        success: function(data, textStatus, jqXHR) {
          console.log(data.eta);
          pollDelay = data.eta;
          if (data.eta == 0) {
            OutputEditor.set(data.output);
          }
          else {
            requestOutputFromServer();
          }
        },
        error: function(jqXHR, textStatus, errorThrown) {
          throw(errorThrown);
        }
      });
    });
  }


  submitWithUpdatedBase64 = function(event) {
    InputEditor.save();
    FileTree.getBase64()
      .then(function (content) {
        $("#project_input").val(content);
        $.rails.handleRemote($("#run-project-form"));
      });
    return false;
  };

  return {
    init: init
  };
}());
