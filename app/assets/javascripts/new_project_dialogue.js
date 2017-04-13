/**
 * Created by chris on 3/31/17.
 */

function displayGitForm() {
    resetDialogue();
    highlightOption('#git_project_option');
    $('#sidebar-overflow').toggle(true);
    $('#project_upload_form').css('visibility', 'hidden');
    $('#project_git_form').css('visibility', 'visible');
}

function displayUploadForm() {
    resetDialogue();
    highlightOption('#upload_project_option');
    $('#sidebar-overflow').toggle(true);
    $('#project_git_form').css('visibility', 'hidden');
    $('#project_upload_form').css('visibility', 'visible');
}

function highlightOption(id) {
    $(id).css('background-color', '#f5f5f5');
    $(id +' > a ').css('color', '#333');
    $(id +' > a > i, strong ').css('color', '#333');
}

function unhighlightOption(id) {
    $(id).css('background-color', '#000');
    $(id +' > a ').css('color', '#f5f5f5');
    $(id +' > a > i, strong ').css('color', '#f5f5f5');
}


function resetDialogue() {
    // $('#sidebar-overflow').toggle(false);
    unhighlightOption('#git_project_option');
    unhighlightOption('#upload_project_option');
    unhighlightOption('#start_from_scratch_option');
}

function onCreateProject(formObject) {
    $.ajax({
        type: 'POST',
        url: 'projects/create/',
        data: JSON.stringify( $(formObject).serializeArray() )
    }).onSuccess( function(payload) {
        onProjectCreated(payload);
    });
}

function onProjectCreated(payload) {

}
