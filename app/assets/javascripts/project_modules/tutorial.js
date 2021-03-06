var Tutorial = (function() {
  "use strict";

  const capstoneName = "SMACK Online";
  var createTour,
      init;


  createTour = function() {
    var tour = new Tour({
      storage: false,
      steps: [
      {
        element: "#service-selector",
        title: "Welcome to " + capstoneName + "!",
        content: "Select the service you would like to use"
      },
      {
        element: "#project_title",
        title: "Naming your project",
        content: "Give your project a descriptive title that will be shown on the community page"
      },
      {
        element: "#upload-project-container",
        title: "Upload your source code",
        content: "Upload a zip file containing your source code"
      },
      {
        element: "#optionsMenu",
        title: "Options",
        content: "Choose your options here"
      },
      {
        element: "#run_button",
        title: "Running your project",
        content: "As soon as you're ready, hit run!"
      }
      ]
    });

    tour.init();
    return tour;
  };

  init = function() {
    var tour = createTour();
    $("#start-tutorial-btn").on('click', function(){ tour.start(true) });
  };

  return {
    init: init
  }
}());
