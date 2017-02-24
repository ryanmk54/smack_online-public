var Title = (function() {
  "use strict";

  var lastValue,

      init,
      get,
      onlySubmitIfChanged,
      set,
      setIfEmpty,
      submitForm,
      submitOnBlur;

  init = function() {
    // Reset the title form if this is a new project
    var titleEl = document.getElementById("project_title");
    if (titleEl.form.classList.contains("new_project")) {
      titleEl.value = "";
    }
    lastValue = titleEl.value;

    // Update the form onblur
    $(document).on('blur', '#project_title', submitOnBlur);

    // Only submit the form if the title has changed
    $(document).on('ajax:before', '#project_title_form', onlySubmitIfChanged);
  };


  get = function(value) {
    return $('#project_title').val();
  };


  set = function(value) {
    document.getElementById("project_title").value = value;
    submitForm();
  };


  setIfEmpty = function(value) {
    if ( get() ) {
      return;
    }
    set(value);
  }


  submitForm = function() {
    var titleEl = document.getElementById("project_title");
    $.rails.handleRemote($(titleEl.form));
  }


  submitOnBlur = function(event) {
    submitForm();
  }


  onlySubmitIfChanged = function(event) {
    var titleEl = document.getElementById("project_title");
    var currentValue = titleEl.value;
    if (currentValue == lastValue) {
      return false;
    }

    lastValue = currentValue;
    return true;
  };

  return {
    init: init,
    get: get,
    set: set,
    setIfEmpty: setIfEmpty
  };
}());
