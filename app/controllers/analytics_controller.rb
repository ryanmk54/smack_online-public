class AnalyticsController < ApplicationController

  def usage
    projects = Project.all

    respond_to do |format|
      format.html
      format.js
      format.json {render json: projects, :only => [:created_at]};
    end
  end
end
