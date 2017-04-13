/**
 * Created by chris on 3/31/17.
 */
function displayUploadForm() {
    $('#project_git_form').toggle(false);
    $('#project_upload_form').toggle(true);
}

function displayGitForm() {
    $('#project_upload_form').toggle(false);
    $('#project_git_form').toggle(true);
}

// Code for GitHub import, added by Jake
// GitHub API tutorial followed at:  http://blog.teamtreehouse.com/code-a-simple-github-api-webapp-using-jquery-ajax
$(function() {
    $('#ghsubmitbtn').on('click', function(e) 
    {
        e.preventDefault();
        $('#ghapidata').html('<p>Loading...</p>');

        var username = $('#ghusername').val();
        var requri = 'https://api.github.com/users/' + username;
        var repouri = 'https://api.github.com/users/' + username + '/repos';

        requestJSON(requri, function(json) 
        {
            if (json.message == "Not Found" || username == '') 
            {
                $('#ghapidata').html("<h2>No User Info Found</h2>");
            } else {
                var fullname = json.name;
                var username = json.login;
                var profileurl = json.html_url;
                var path = '';
                var repo_name = '';

                if (fullname == undefined) {
                    fullname = username;
                }

                var outhtml = '<h2>' + fullname + ' <span class="smallname">(@<a href="' + profileurl + '" target="_blank">' + username + '</a>)</span></h2>';
                outhtml = outhtml + '<div class="repolist clearfix">';

                var repositories;
                $.getJSON(repouri, function(json) 
                {
                    repositories = json;
                    outputRepoList();
                });

                function outputRepoList() 
                {
                    if (repositories.length == 0) 
                    {
                        outhtml = outhtml + '<p>No repos!</p></div>';
                    } else 
                    {
                        outhtml = outhtml + '<p><strong>Repos List:</strong></p> <ul>';
                        $.each(repositories, function(index) 
                        {
                            outhtml = outhtml + '<li class="repository" id="' + repositories[index].name + '"><a>' + repositories[index].name + '</a></li>';

                        });
                        outhtml = outhtml + '</ul></div>';

                    }
                    $('#ghapidata').html(outhtml);

                    $(".repository").each(function(index) 
                    {
                        $(this).on('click', function(e) 
                        {

                            $(".repository").remove();

                            repo_name = $(this).text();

                            requri = 'https://api.github.com/repos/' + username + '/' + this.id + '/contents/';
                            requestJSON(requri, function(json) {

                                if (json.message == "Not Found" || username == '') 
                                {
                                    console.log('bad');
                                } 
                                else 
                                {

                                    list_subdirectories = json;

                                    outputRepoList2();

                                    function outputRepoList2() 
                                    {

                                        if (list_subdirectories.length == 0) {
                                            outhtml = outhtml + '<p>No repos!</p></div>';
                                        } 
                                        else 
                                        {

                                            outhtml = '<h2>' + fullname + ' <span class="smallname">(@<a href="' + profileurl + '" target="_blank">' + username + '</a>)</span></h2>';;

                                            outhtml = outhtml + '<p><strong>Contents:</strong></p> <ul>';
                                            $.each(list_subdirectories, function(index) {
                                                type = list_subdirectories[index].type;
                                                outhtml = outhtml + '<li class="contents" type="' + type + '" id="' + list_subdirectories[index].name + '"><a>' + list_subdirectories[index].name + '</a></li>';

                                            });

                                            outhtml = outhtml + '</ul></div>';


                                            $('#ghapidata').html(outhtml);

                                        }
                                    }

                                    $(".contents").each(function(index) 
                                    {
                                        $(this).on('click', function(e) 
                                        {

                                            function displayContentsOrOpen(repo_name, selected, type) 
                                            {

                                                if (type == 'file') 
                                                {
                                                    path = path + $(selected).text();

                                                    requri = 'https://raw.githubusercontent.com/' + username + '/' + repo_name + '/master/' + path;

                                                    var xmlHttp = new XMLHttpRequest();
                                                    xmlHttp.open("GET", requri, false); // false for synchronous request
                                                    xmlHttp.send(null);

                                                    console.log(xmlHttp.responseText);

                                                    var editor = ace.edit("inputEditor");

                                                    editor.setValue(xmlHttp.responseText.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'));
                                                    $('#new_project_modal').modal('toggle')


                                                } 
                                                else if (type == 'dir') 
                                                {

                                                    console.log($(selected).text());

                                                    path = path + $(selected).text() + '/';

                                                    requri = 'https://api.github.com/repos/' + username + '/' + repo_name + '/contents/' + path

                                                    requestJSON(requri, function(json) 
                                                    {
                                                        if (json.message == "Not Found" || username == '') 
                                                        {
                                                            $('#ghapidata').html("<h2>No such file or directory!</h2>");
                                                        } 
                                                        else 
                                                        {

                                                            list_subdirectories = json;

                                                            console.log('good1');

                                                            outhtml = '<h2>' + fullname + ' <span class="smallname">(@<a href="' + profileurl + '" target="_blank">' + username + '</a>)</span></h2>';

                                                            outhtml = outhtml + '<p><strong>Contents:</strong></p> <ul>';
                                                            $.each(list_subdirectories, function(index) {
                                                                type = list_subdirectories[index].type;
                                                                outhtml = outhtml + '<li class="contents" type="' + type + '" id="' + list_subdirectories[index].name + '"><a>' + list_subdirectories[index].name + '</a></li>';

                                                            });

                                                            outhtml = outhtml + '</ul></div>';


                                                            $('#ghapidata').html(outhtml);

                                                            $(".contents").each(function(index) 
                                                            {
                                                                $(this).on('click', function(e) 
                                                                {
                                                                    displayContentsOrOpen(repo_name, this, $(this).attr('type'));
                                                                });
                                                            });
                                                        }

                                                    });

                                                }
                                            }

                                            displayContentsOrOpen(repo_name, this, $(this).attr('type'));
                                        });
                                    });
                                }
                            });

                        });
                    });
                }
            }
        });
    });

    function requestJSON(url, callback) 
    {
        $.ajax({
            url: url,
            complete: function(xhr) 
            {
                callback.call(null, xhr.responseJSON);
            }
        });
    }
});