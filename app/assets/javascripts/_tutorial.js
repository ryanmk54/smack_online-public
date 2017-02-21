var Tutorial = {
  init: function(startSelector) {
    var tour = this.createTour();
    $(startSelector).on('click', function(){ tour.start(true) });
  },
  createTour: function() {
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
        element: "#run_project",
        title: "Running your project",
        content: "As soon as you're ready, hit run!"
      }
      ]
    });

    tour.init();
    return tour;
  }
}
