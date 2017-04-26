var Title = (function() {
  "use strict";

  var lastValue,

      init,
      get,
      submitIfChanged,
      set,
      setIfEmpty;

  /** Initializes  the Title form */
  init = function() {
    // Reset the title form if this is a new project
    var titleEl = document.getElementById("project_title");
    if (titleEl.form.classList.contains("new_project")) {
      titleEl.value = "";
      document.getElementById("title").value = "";
    }
    lastValue = titleEl.value;

    // Update the form onblur
    $(document).on('blur', '#title', submitIfChanged);
  };


  /** Returns the title */
  get = function(value) {
    return $('#title').val();
  };


  /** Sets the title */
  set = function(value) {
    document.getElementById("title").value = value;
    submitIfChanged();
  };


  /** Sets the title only if there isn't a title yet */
  setIfEmpty = function(value) {
    if ( get() ) {
      return;
    }
    set(value);
  }


  /** Submits the title form only if it has changed */
  submitIfChanged = function(event) {
    var titleEl = document.getElementById("title");
    var currentValue = titleEl.value;
    if (currentValue == lastValue) {
      return false;
    }

    lastValue = currentValue;
    document.getElementById("project_title").value = currentValue;
    RunProjectForm.submit();
    return true;
  };

  /** Public methods */
  return {
    init: init,
    get: get,
    set: set,
    setIfEmpty: setIfEmpty
  };
}());
