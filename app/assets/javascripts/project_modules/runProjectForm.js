/**
 * Project that is responsible for 
 * running the project and polling
 */
RunProjectForm = (function() {
  "use strict";

  var addRunField,
      createOutputModal,
      init,
      pollDelay,
      requestOutputFromServer,
      startPollingServerForOutput,
      submit,
      submitAndRun,
      startTimer,
      intervalId,
      timer;


  /** Initializes the Module */
  init = function() {
    pollDelay = 0;
    timer = -1;
    $(document).on('click', '#run_button', submitAndRun);
    $(document).on('ajax:complete', '#project-form.edit_project', startPollingServerForOutput);
  };


  /** Starts polling if there isn't already a request pending */
  startPollingServerForOutput = function(event, xhr, status) {
    if (status == "error") {
      if (xhr.status == 500) {
        OutputEditor.set("There was an internal server error.");
        OutputEditor.append("This could mean the server was unable to contact the SMACK service");
      } else {
        OutputEditor.set("An unknown error occurred.");
        OutputEditor.append("This could mean I am unable to contact the server");
        OutputEditor.append("Are you connected to the internet?");
      }
      return;
    }
    else if (pollDelay != 0) {
      console.log("A request is already pending");
      OutputEditor.append("A request is already pending");
      return;
    }
    else {
      timer = -1;
      var url = document.getElementById('poll_form').action;
      requestOutputFromServer(url);
    }
  };


  /** Sends a request to the ouput server */
  requestOutputFromServer = function(url) {
    console.log("requuesting output from server");
    console.log(url);
    setTimeout(function() {
      $.ajax({
        type: "GET",
        timeout: 5000,
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
              OutputEditor.set("Estimated time remaining: " + data.eta + " second(s)");
              timer = data.eta;
              startTimer();
            }
            requestOutputFromServer(url);
          }
        },
        error: function(jqXHR, textStatus, errorThrown) {
          switch(textStatus) {
            case "timeout":
              OutputEditor.append("response from server timed out");
            default:
              OutputEditor.append(textStatus + " " + errorThrown);
          }
          throw(errorThrown);
        }
      });
    }, pollDelay)
  }

  /** Function that counts down to say the estimated time remaining */
  startTimer = function() {
    intervalId = setInterval(function()
    {
      if(timer != 0) {
        timer--;
        OutputEditor.set("Estimated time remaining: " + timer + " second(s)");
      }
      else {
        clearInterval(intervalId);
        OutputEditor.set("This is taking longer than expected . . .");
      }
    }, 1000);
  };

  submit = function(event) {
    document.getElementById("run_flag").disabled = true;
    FileTree.getBase64()
      .then(function (content) {
        $("#project_form #project_input").val(content);
        $.rails.handleRemote($("#project_form"));
        console.log("form action");
        console.log($("#project_form")[0].action);
      });
  }

  /** Saves the content of the Input editor */
  submitAndRun = function(event) {
    if (InputEditor.get().trim().length == 0) {
      OutputEditor.set("There is no code to send to the server");
      return;
    }
    document.getElementById("run_flag").disabled = false;
    OutputEditor.set("Sending code to server");
    InputEditor.save();
    FileTree.getBase64()
      .then(function (content) {
        $("#project_form #project_input").val(content);
        $.rails.handleRemote($("#project_form"));
        console.log("form action");
        console.log($("#project_form")[0].action);
      });
    return false;
  };

  /** Public methods */
  return {
    init: init,
    requestOutputFromServer: requestOutputFromServer,
    submit: submit,
  };
}());
