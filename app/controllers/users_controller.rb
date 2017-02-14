class UsersController < ApplicationController

  # GET /users/projects
  def projects
    render partial: 'profiles/project', collection: current_user.projects
  end

  # GET /users/followers
  def followers
    render partial: 'profiles/follower', collection: current_user.followers
  end

  # GET /users/following
  def followees
    render partial: 'profiles/followee', collection: current_user.followees
  end
end