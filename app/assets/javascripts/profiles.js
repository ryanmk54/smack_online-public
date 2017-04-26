/**
 * Created by chris on 1/27/17.
 */
//= require tree.jquery



var observer = null;

$(function() {
    observer = new ProjectObserver();
    setInterval(function() { observer.updateRunningProjectStatus(); }, 1000);

    var start_projects = $('.running_projects').children().toArray();
    var ids = [];
    for(var i = 0; i < start_projects.length; i++) {
        ids.push(parseID(start_projects[i].id));
    };
    ids.forEach(function(id) { observer.addRunningProject(id) });


});

function cancelProject(id) {
    var id =  id;
    $.ajax({
        url: 'projects/' + id + '/cancel',
        type: 'get'
    }).success(function(){
        observer.removeRunningProject(id);
        $('#running-project-' + id).remove();
    });
}



function parseID(str) {
    return parseInt(str.replace( /^\D+/g, ''));
}


function onRunProject(project_id) {
    if(observer.running_projects.has(project_id)) {
        return;
    }
    $.ajax({
        type: 'post',
        url: '/projects/' + project_id + '/run',
        data: { project: {
            id: project_id,
            options: {}
        }}}).success(function(payload) {
        observer.addRunningProject(project_id);
        $('.running_projects').append(payload);

    });
};


/*
    dynamically updates the progress for active projects
    on the user's profile page

 */
function ProjectObserver() {

    this.running_projects = new Set();
    this.finished_projects = new Set();

    var onProjectFinished = new Event('onProjectFinished');

    addEventListener('onProjectFinished', function (e) {
        observer.finished_projects.forEach(function (project_id) {
            $.ajax({
                url: '/projects/' + project_id + '.json',
                type: 'get',
            }).success(function (payload) {
                if (payload.output != 'pending') {
                    var successText = "SMACK found no errors";
                    if (payload.output.search(successText) != -1) {
                        $('#status-' + project_id).html(
                            "<h4><strong> Status:  </strong> <div class='glyphicon glyphicon glyphicon-ok-sign' style='color: limegreen'></h4>");
                    }
                    else {
                        $('#status-' + project_id).html(
                            "<h4><strong> Status:  </strong> <div class='glyphicon glyphicon glyphicon-warning-sign' style='color: red'></div></h4>");
                    }
                }
            })
        })
    });

    this.removeRunningProject = function(project_id) {
        this.running_projects.delete(project_id)
    }

    this.addRunningProject = function(project_id) {
        this.running_projects.add(project_id);
    }

    this.updateRunningProjectStatus = function() {
        this.running_projects.forEach(function(project_id) {
            observer.updateProgress(project_id)
        });
    }

    this.updateProgress = function(project_id) {
        var id = project_id;
        var progress = null;
        var output = null;
        $.ajax({
            url: '/projects/' + project_id + '/progress',
            type: 'get'
        }).success(function(payload) {
            progress = payload.progress;
            output = payload.output;
            if (parseInt(progress) == 1 && output != 'pending' ) {
                observer.running_projects.delete(id);
                observer.finished_projects.add(id);
                dispatchEvent(onProjectFinished);
            }
            $("#progress-" + project_id).css('width', parseInt(progress * 100) + '%');
        })
    }
}



/*
    DELETE /projects/:project_id

    makes an AJAX request to delete the project for the user,
    then makes an AJAX request to reload the user's projects
    from the server.
 */
function delete_project(project_id) {
    $.ajax({
        url: '/projects/' + project_id,
        type: 'delete',
        success: function(result) {
          displayProjects();
        }
    });
}

/*
    GET /users/newProject

    Makes an AJAX request to load a project button
 */
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

/*
    GET /users/projects

    Makes an AJAX request to load all of the user's projects
    on the profile page.
 */
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


/*
    GET /users/following

    Displays information about all of the users that
    the logged-in user is following
 */
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


/*
    UI embellishment for highlighting a project
    when a the user's mouse hovers over a particular project
 */
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

/*
    Dynamically sets the onclick action to either "follow" or
    "unfollow" for a particular user when clicked
 */
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

/*
    POST /users/follow/
    data: { user_id: integer }

    Sends an AJAX request that adds the user associated with
    follower_id for to be followed by the logged in user.

    Toggles the button's action from "follow" to "unfollow" on callback
 */
function follow(follower_id) {
    $.ajax({
        url: '/users/follow',
        type: 'post',
        data: { user_id: follower_id },
        success: toggleFollowUnfollowButton(follower_id)
    });
}


/*
    POST /users/unfollow/
    data: { user_id: integer }

    Sends an AJAX request that adds the user associated with
    follower_id for to be followed by the logged in user.

    Toggles the button's action from "unfollow" to "follow" on callback
 */
function unfollow(follower_id) {
    $.ajax({
        url: '/users/unfollow',
        type: 'post',
        data: {user_id: follower_id},
        success: toggleFollowUnfollowButton(follower_id)
    });
}


/*
    GET /users/followers

    Sends an AJAX request to dynamically load the User's followers
    on the profile page
 */
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

/*
    Returns the text input from the search box on the
    user's home page
 */
function parameterizeSearchForm() {
    var parameters = {
        username: $('input#search_by_username').val()
    };
    return parameters;
}

/*
    GET /users/searchbar

    Sends an AJAX Request to display the user search bar
 */
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


/*
    POST /users/search

    Sends an AJAX Request to return a list of users,
    based on input from the search bar
 */
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

/*
    GET /users/projects/:id

    Sends an AJAX request to display projects as 'peer projects'
 */
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

/*
    GET /projects/:id/fork

    Makes an AJAX request to create a project for the logged-in user
    that is a copy of another user's project
 */
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
    if(window.location.href.endsWith("profile")) { 
      displayNewProjectButton();
      displayProjects();
    }
});




/*
    POST /projects/:id/permissions/public

    Sends an AJAX request to the server to make the
    specified project public
 */
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

/*
 POST /projects/:id/permissions/private

 Sends an AJAX request to the server to make the
 specified project private
 */
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
