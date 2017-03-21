class ProfilesController < ApplicationController

  # GET /profiles/show
  def show
    if params[:id].nil?
      @user = User.find(current_user.id)
      render :home
    else
      @user = User.find(params[:id])
      render :show
    end

  end

  def load_project_previews
      @user = User.find(params[:id])
      json_list = []
      projects = @user.projects
      projects.each do |project|
        json_list.append(project.to_json(:include => [:title, :id] ))
      end
  end
end

