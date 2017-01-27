class ProfilesController < ApplicationController

  # GET /profiles/show
  def show
    @user = User.find(current_user.id)
    render :show
  end

  def load_project_previews
    @user = User.find(current_user.id)
    json_list = []
    projects = @user.projects
    projects.each do |project|
      json_list.append(project.to_json(:include => [:title, :id] ))
    end
  end

end

