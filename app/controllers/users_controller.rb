class UsersController < ApplicationController
  # GET /users/projects
  def projects
    render partial: 'profiles/project', collection: current_user.projects
  end

  # GET /users/followers
  def followers
    render partial: 'users/preview', collection: current_user.followers, as: 'user'
  end

  # GET /users/following
  def followees
    render partial: 'users/preview', collection: current_user.followees, as: 'user'
  end

  def index
    render 'users/index.html'
  end

  def searchbar
    render partial: 'users/searchbar'
  end

  def follow
    current_user.follow(params[:user_id])
  end

  def unfollow
    puts params[:user_id]
    puts 'hello'
    current_user.unfollow(params[:user_id])
  end

  def search
    @user = current_user
    users = User.search(params[:username])
    users.each { |u| puts 'true' if u.nil? }  
    render partial:'users/search_preview', collection: users, as: 'user'
  end

  def newProjectButton
    render partial: 'users/new_project_button.html'
  end
end
