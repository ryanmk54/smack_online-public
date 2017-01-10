require 'test_helper'

class AnalyticsControllerTest < ActionDispatch::IntegrationTest
  test "should get usage" do
    get analytics_usage_url
    assert_response :success
  end

end
