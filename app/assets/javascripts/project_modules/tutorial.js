var Tutorial = (function() {
  "use strict";

  var createTour,
      init;


  createTour = function() {
    var tour = new Tour({
      storage: false,
      steps: [
      {
        element: "#project_title",
        title: "Welcome to SMACK Online!",
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
      // Start the tutorial when they click the start tutorial button
  };

  return {
    init: init
  }
}());
