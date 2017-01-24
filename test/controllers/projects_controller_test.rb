require 'test_helper'

class ProjectsControllerTest < ActionDispatch::IntegrationTest
  setup do
    @project = projects(:one)
  end

  base64_input = file_fixture_path + 'base64_input.base64'
  base64_input_for_update = file_fixture_path + 'base64_input_for_update.base64'

  test 'should create project' do
    assert_difference('Project.count') do
      post projects_url, params: { project: { input: base64_input } }
    end
    assert_equal(Project.last.input, base64_input)
    assert_redirected_to edit_project_url(Project.last)
  end

  test 'should update project' do
    patch project_url(@project), params: { project: { input: base64_input_for_update } }
    assert_equal(@project.input, base64_input_for_update)
    assert_redirected_to edit_project_url(@project)
  end

  test 'should_create_output_file' do
    post receive_service_output_project_url(@project.id), params: {id: @project.id, output: 'this_is_output'}
    assert_equal(@project.output, 'this_is_output')
  end

  test 'should get new' do
    get new_project_url
    assert_response :success
  end

  test 'should get edit' do
    get edit_project_url(@project)
    assert_response :success
  end

  #test "should destroy project" do
  #  assert_difference('Project.count', -1) do
  #    delete project_url(@project)
  #  end

  #  assert_redirected_to projects_url
  #end

  #test "should get index" do
  #  get projects_url
  #  assert_response :success
  #end


  #test "should show project" do
  #  get project_url(@project)
  #  assert_response :success
  #end
end
