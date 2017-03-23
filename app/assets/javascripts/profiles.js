/**
 * Created by chris on 1/27/17.
 */
//= require tree.jquery


function delete_project(project_id) {
    $.ajax({
        url: '/projects/' + project_id,
        type: 'delete',
        success: function(result) {
          displayProjects();
        }
    });
}

function displayNewProjectButton() {
    $.ajax({
        url: '/users/newProject',
        type: 'get',
        success: function(payload) {
            $('#preview-header').html('');
            $('#preview-header').append(payload);
        }
    })
}



function displayProjects() {
    $.ajax({
        url: '/users/projects',
        type: 'get',
        success: function(payload) {
            // $('#preview-header').text('Projects');
            $('#search_container').empty();
            $('#preview-body').empty();

            $('#preview-body').html(payload);

            $('.card-project').hover(
                function() {
                    $(this).css('box-shadow', '10px 10px 5px #888');
                    $(this).find( '.project_options').css('visibility', 'visible');
                },

                function() {
                    $(this).css('box-shadow', '1px 1px 0.5px #888');
                    $(this).find( '.project_options').css('visibility', 'hidden');
                }
            );
        }
    });
}

function displayFollowing() {
    $.ajax({
        url: '/users/following',
        type: 'get',
        success: function(payload) {
            $('#preview-header').text("Users I'm Following");
            $('#search_container').empty();
            $('#preview-body').empty();
            $('#preview-body').html(payload);
        }
    });
}

function highlightProject() {
    $('.card-project').hover(

        function() {
            $(this).css('box-shadow', '5px');
        },

        function() {
            $(this).css('box-shadow', '1px');
        }
    )

}

function toggleFollowUnfollowButton(follower_id) {
    var button = $('button#follow_button_' + follower_id);
    if(button.hasClass("btn-danger")) {
        button.removeClass("btn-danger");
        button.addClass("btn-success");
    }
    else {
        button.removeClass("btn-success");
        button.addClass("btn-danger");
    }


}

function follow(follower_id) {
    $.ajax({
        url: '/users/follow',
        type: 'post',
        data: { user_id: follower_id },
        success: toggleFollowUnfollowButton(follower_id)
    });
}

function unfollow(follower_id) {
    $.ajax({
        url: '/users/unfollow',
        type: 'post',
        data: {user_id: follower_id},
        success: toggleFollowUnfollowButton(follower_id)
    });
}

function displayFollowers() {
    $.ajax({
        url: '/users/followers',
        type: 'get',
        success: function(payload) {
            $('#preview-header').text('Followers');
            $('#search_container').empty();
            $('#preview-body').empty();
            $('#preview-body').html(payload);
        }
    });
}

function parameterizeSearchForm() {
    var parameters = {
        username: $('input#search_by_username').val()
    };
    return parameters;
}

function displaySearchBar() {
    $.ajax({
        url: 'users/searchbar',
        type: 'get',
        success: function(payload) {
            $('#preview-header').empty();
            $('#preview-body').empty();
            $('#search_container').empty();
            $('#search_container').append(payload);
        }
    });

    $(document).on('click', '#user_search_button', function() {
        submitSearchForm();
    });
}

function submitSearchForm() {
    $.ajax({
        url: '/users/search',
        type: 'post',
        data: parameterizeSearchForm(),
        success: function(payload) {
            $('#preview-body').empty();
            $('#preview-body').html(payload);

        }
    })


}

function displayPeerProjects(peer_id) {
    $.ajax({
        url: '/users/projects/' + peer_id,
        type: 'get',
        success: function(payload) {
            // $('#preview-header').text('Projects');
            $('#search_container').empty();
            $('#preview-body').empty();

            $('#preview-body').html(payload);

            $('.card-project').hover(
                function() {
                    $(this).css('box-shadow', '10px 10px 5px #888');
                    $(this).find( '.project_options').css('visibility', 'visible');
                },

                function() {
                    $(this).css('box-shadow', '1px 1px 0.5px #888');
                    $(this).find( '.project_options').css('visibility', 'hidden');
                }
            );
        }
    });
}

function forkProject(project_id) {
    $.ajax({
       url: '/projects/' + project_id + '/fork',
       type: 'get',
       success: {}
    });
}

$(document).ready(function() {

    $('#show_projects').click(function() {
        displayNewProjectButton();
        displayProjects();
    });

    $('#show_followers').click(function() {
        // hide_followers();
        displayFollowers()
    });


    $('#show_following').click(function() {
        // hide_followers();
        displayFollowing();
    });
    $('#search_for_users').click(function() {
        displaySearchBar();
    });
});


