class AnalyticsController < ApplicationController

  PROJECT_CSV_PATH = Rails.root.join('public', 'assets', 'ProjectLocations.csv')
  USER_CSV_PATH = Rails.root.join('public', 'assets', 'UserLocations.csv')

  def usage
    projects = Project.all
    respond_to do |format|
      format.html
      format.js
      format.json {render json: projects, :only => [:created_at, :id]}
    end
  end

  def project_runtimes
    projects = Project.where('runtime is NOT NULL and name != ""')
    respond_to do |format|
      format.html
      format.js
      format.json {render json: projects, :only => [:runtime, :id]}
    end
  end

  def project_location_csv
    send_file(PROJECT_CSV_PATH, :type => 'text/csv; charset=utf-8')
  end

  def user_location_csv
    send_file(PROJECT_CSV_PATH, :type => 'text/csv; charset=utf-8')
  end
end
