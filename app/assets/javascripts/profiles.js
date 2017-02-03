/**
 * Created by chris on 1/27/17.
 */
//= require tree.jquery

function open_project(project_id) {
    $.get("/projects/" + project_id + "/edit");
    // location.href = "/projects/" + project_id +"/edit";
}

function delete_project(project_id) {
    $.ajax({
        url: '/projects' + project_id,
        type: 'deletee',
        success: function(result) {
            // Do something with the result
        }
    });
}

// id is the user's id
function load_projects(id) {
    var projects_container = $('#projects');
}
