require 'test_helper'



class ProjectTest < ActiveSupport::TestCase
  test "created_at_should_return_non_nil" do
    project = projects(:one)
    assert_not_nil(project.created_at)
  end
end
