/**
 * Created by chris on 1/27/17.
 */
//= require tree.jquery


function delete_project(project_id) {
    $.ajax({
        url: '/projects' + project_id,
        type: 'deletee',
        success: function(result) {
            // Do something with the result
        }
    });
}

// // id is the user's id
// function load_projects(id) {
//     var projects_container = $('#projects');
// }

window.onload = function() {
    $('#show_projects').click(function() {
        // hide_followers();
        $.ajax({
            url: '/users/projects',
            type: 'get',
            success: function(payload) {
                console.log('hello');
                document.getElementById('projects_preview').innerHTML = payload;
                document.getElementById('projects-container').style.visibility = 'visible';

            }
        })
    })
};

function hide_followers() {

}

// function hide_projects() {
//     document.getElementById('followers-container').style.visibility = 'hidden';
// }
//
// function show_projects() {
//
// }
