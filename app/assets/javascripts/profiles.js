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
                // document.getElementById('preview-header').innerText = 'Projects';
                // document.getElementById('preview-body').innerHTML = payload;
                $('#preview-header').text('Projects');
                $('#preview-body').html(payload);

            }
        })
    });

    $('#show_followers').click(function() {
        // hide_followers();
        $.ajax({
            url: '/users/followers',
            type: 'get',
            success: function(payload) {
                // document.getElementById('preview-header').innerText = 'Projects';
                // document.getElementById('preview-body').innerHTML = payload;
                $('#preview-header').text('Followers');
                $('#preview-body').html(payload);
            }
        })
    });


    $('#show_following').click(function() {
        // hide_followers();
        $.ajax({
            url: '/users/following',
            type: 'get',
            success: function(payload) {
                // document.getElementById('preview-header').innerText = 'Projects';
                // document.getElementById('preview-body').innerHTML = payload;
                $('#preview-header').text("Users I'm Following");
                $('#preview-body').html(payload);
            }
        })
    });
};
