require 'test_helper'

class UserTest < ActiveSupport::TestCase
  def setup
    @user = User.create(username: 'pikachu',
                        email: 'pikachu@gmail.com',
                        password: 'password',
                        password_confirmation: 'password' )

    @followed_user =  User.create(username: 'squirtle',
                               email: 'squirtle@gmail.com',
                               password: 'password',
                               password_confirmation: 'password' )

    @user.follow @followed_user.id


  end


  test 'username' do
    assert @user.username == 'pikachu'
  end

  test 'email' do
    assert @user.email == 'pikachu@gmail.com'
  end

  test 'is_following' do
    assert @user.is_following @followed_user.id

  end

  test 'followed_by' do
    assert @followed_user.followers.include? @user
  end

  test 'projects' do
    @user.projects.create()
    assert @user.projects.size == 1
    assert @user.projects[0].class.name == 'Project'
  end

  test 'self.search' do
    assert User.search('pikachu').include? @user
  end


  test 'unfollow' do
    @user.unfollow @followed_user.id
    assert @user.is_following(@followed_user.id) == false
  end

  test 'followees' do
    assert @user.followees.include? @followed_user
  end

  test 'followers' do
    assert @followed_user.followers.include? @user
  end
end
