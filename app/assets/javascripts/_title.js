var Title = {
  lastValue: null,
  formSelector: null,
  titleSelector: null,
  title: null,

  init: function(selectorObj) {
    title = this;
    title.formSelector = selectorObj.formSelector;
    title.titleSelector = selectorObj.titleSelector;
    title.lastValue =  $(title.titleSelector)[0].value;

    $(title.formSelector).on('submit', title.updateIfChanged);
    $(title.titleSelector).on('blur', title.updateIfChanged);
  },
  updateIfChanged: function() {
    currentValue =  $(title.titleSelector)[0].value;

    if (currentValue == title.lastValue) {
      return false;
    }

    title.lastValue = currentValue;
    $.rails.handleRemote($(title.formSelector));
    return false;
  }
}
