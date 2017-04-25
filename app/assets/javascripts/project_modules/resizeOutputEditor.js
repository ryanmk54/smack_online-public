var ResizeOutputEditor = (function() {
  "use strict";

  var classToAdd,   // Class that gets added to change the state
      containerSel, // Element the class is added to
      btnSel,       // Selector for the Resize button

      init,         // Initializes the Output Editor Resizer
      expand,       // Expands the output editor
      shrink,       // Shrinks the output editor
      toggle;       // Toggles the output editor

  /** Initializes the Output Editor Resizer */
  init = function() {
    containerSel = "#editors-row";
    classToAdd = "output-shrunk";
    btnSel = "#collapse-output-btn";

    $(btnSel).on('click', toggle);
  };


  /** Expands the Output Editor */
  expand = function() {
    $(containerSel).removeClass(classToAdd);
    $(containerSel).on('transitionend webkitTransitionEnd', function(e) {
      OutputEditor.resize();
    });
  };


  /** Shrinks the Output Editor */
  shrink = function() {
    $(containerSel).addClass(classToAdd);
  }

  /** Toggle the Output Editor */
  toggle = function() {
    if( $(containerSel).hasClass(classToAdd) ){
      expand();
    }
    else{
      shrink();
    }
  };

  /** Public Methods */
  return {
    init: init,
    expand: expand,
    toggle: toggle,
    shrink: shrink
  };

})();
