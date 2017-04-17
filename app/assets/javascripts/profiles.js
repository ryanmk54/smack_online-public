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
            $('#preview-header').empty();
            $('#preview-header').append(payload);
        }
    })
}

function displayProjects() {
    $.ajax({
        url: '/users/projects',
        type: 'get',
        success: function(payload) {
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
            $('#preview-header').empty();
            $('#preview-header').text("");
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
            $('#preview-header').empty();
            $('#preview-header').text("");
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
            $('#preview-header').empty();
            $('#preview-header').text('Projects');
            $('#preview-header').text('Projects');
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
        displayFollowers();
    });

    $('#show_peer_followers').click(function() {
        // hide_followers();
        displayFollowers();
    });

    $('#show_peer_following').click(function() {
        displayFollowing();
    });



    $('#show_following').click(function() {
        // hide_followers();
        displayFollowing();
    });
    $('#search_for_users').click(function() {
        displaySearchBar();
    });
});

function makeProjectPrivate() {

}

function makeProjectPublic(project_id) {
    $.ajax({
        url: '/projects/'+ project_id + '/permissions/public',
        type: 'post',
        success: function(payload) {
            $('#project-' + project_id + '-visibility').removeClass('glyphicon glyphicon-lock');
            $('#project-' + project_id + '-visibility').addClass('fa fa-unlock-alt');
            $('#project-' + project_id + '-visibility').attr('onclick', 'makeProjectPrivate(' + project_id + ')');
            $('#project-' + project_id + '-visibility').animate('highlight', {}, 30000);
        }
    });

}

function makeProjectPrivate(project_id) {
    $.ajax({
        url: '/projects/'+ project_id + '/permissions/private',
        type: 'post',
        success: function(payload) {
            $('#project-' + project_id + '-visibility').removeClass('fa fa-unlock-alt');
            $('#project-' + project_id + '-visibility').addClass('glyphicon glyphicon-lock');
            $('#project-' + project_id + '-visibility').attr('onclick', 'makeProjectPublic(' + project_id + ')');
            $('#project-' + project_id + '-visibility').animate('highlight', {}, 30000);
        }
    });
}

function runFromProfilePage(project_id) {
    // create project form
    // send form as ajax request
    $.ajax({
        type: 'post',
        url: '/projects/' + project_id + '/run',
        data: { project: {
                    id: project_id,

                     options: {}
        }}}).success(function(payload) {
        // receive the eta
        var eta = payload.eta;
        displayProgressBar(project_id, eta);
    });
    // create progress bar
    // notify if test passes or fails
};

function displayProgressBar(project_id, eta) {
    $('#project-preview-' + project_id + ' > div >  .card-footer').addClass('in');
    $('#progress-' + project_id).attr('aria-max-value', eta)
    eta = parseFloat(eta);
    var time_elapsed = 0.0;

    var tick = setInterval(function() {
        time_elapsed += 1;
        var ratio = parseFloat(time_elapsed) / parseFloat(eta);
        $('#progress-' + project_id).css('width', parseInt(ratio * 100) + '%');
        if(parseInt(ratio) == 1) {
            clearInterval(tick);
            displayStatus(project_id);

        }
    }, 1000);

}

function displayStatus(project_id) {
    $.ajax({
        url: '/projects/' + project_id + '.json',
        type: 'get',
    }).success(function(payload) {

        if(payload.output == "pending") { displayStatus(project_id) }
        else {
            var successText = "SMACK found no errors";
            if(payload.output.search(successText) != -1) {
                $('#progress-' + project_id ).parent().parent().html(
                    "<strong> Status:  </strong> <div class='glyphicon glyphicon glyphicon-ok-sign' style='color: limegreen'></div>");
            }
            else {
                $('#progress-' + project_id ).parent().parent().html(
                    "<h2><strong> Status:  </strong> <div class='glyphicon glyphicon glyphicon-warning--sign' style='color: red'></div></h2>");
            }
        }
    });
}


// function updateProgressBar(project_id, start_eta) {
//     project_id += 1;
//     ratio =

// }


