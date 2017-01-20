require 'test_helper'

class UserTest < ActiveSupport::TestCase
  def setup
    @user = User.new
    @user.id = 1
    @user.email = 'user_1@gmail.com'
    @user.name = 'Zvonomir Rakamaric'
  end
end
