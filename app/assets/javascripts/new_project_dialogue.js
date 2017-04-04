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