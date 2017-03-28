// Read Sprockets README 
// (https://github.com/rails/sprockets#sprockets-directives)
// for details about supported directives.
//
//= require dropdowns-enhancement
//= require bootstrap-select
//= require bootstrap-tour.min
//= require jszip
//= require_tree ./project_modules


$().ready(function(){
  "use strict";

  InputEditor.init();
  OutputEditor.init();
  ResizeOutputEditor.init();
  FileTree.init();
  FileUpload.init();
  RunProjectForm.init();
  Title.init();
  Tutorial.init();
  initOptionsMenu();
});

function initOptionsMenu() {
  // LOGIC FOR SWITCHING OPTIONS MENUS
  // Set the options menu html to the html of the hidden field associated with
  // the value of the drop down menu value (service-selector.val == service-options.id)
  $("#optionsMenu").html($("#smack-options").html());
  /*
  $("#service-selector").change(function()
  {
    $("#optionsMenu").html($("#" + $(this).find(":selected").val()).html());
  });
  */
}
