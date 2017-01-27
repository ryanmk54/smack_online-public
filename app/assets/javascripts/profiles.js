/**
 * Created by chris on 1/27/17.
 */
//= require tree.jquery

function open_project(project_id) {
    $.get("/projects/" + project_id + "/edit");
    // location.href = "/projects/" + project_id +"/edit";
}

function delete_project(project_id) {
    $.get("/projects/" + project_id + "/destroy");
    load_projects();
}

// id is the user's id
function load_projects(id) {
    var projects_container = $('#projects');
    projects_container.
}

