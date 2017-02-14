class UsersController < ApplicationController

  # GET /users/projects
  def projects
    render partial: 'profiles/project', collection: current_user.projects
  end

  # GET /users/followers
  def followers
    render partial: 'profiles/follower', collection: current_user.followers
  end

  # # GET /users/following
  # def projects
  #   render partial: 'profiles/following', collection: current_user.following
  # end
end