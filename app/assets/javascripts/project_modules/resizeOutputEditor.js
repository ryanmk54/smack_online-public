var ResizeOutputEditor = (function() {
  "use strict";

  var classToAdd,
      containerSel,
      btnSel,

      init,
      expand,
      shrink,
      toggle;

  init = function() {
    containerSel = "#editors-row";
    classToAdd = "output-shrunk";
    btnSel = "#collapse-output-btn";

    $(btnSel).on('click', toggle);
  };


  expand = function() {
    $(containerSel).removeClass(classToAdd);
  };


  shrink = function() {
    $(containerSel).addClass(classToAdd);
  }

  toggle = function() {
    if( $(containerSel).hasClass(classToAdd) ){
      expand();
    }
    else{
      shrink();
    }
  };

  return {
    init: init,
    toggle: toggle
  };

})();
