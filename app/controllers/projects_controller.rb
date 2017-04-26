require 'csv'
require 'json'
require 'digest/md5'

class ProjectsController < ApplicationController
  #protect_from_forgery with: :null_session, if: Proc.new { |c| c.request.format == 'application/json'}
  before_action :set_project, only: [:show, :edit, :update, :receive_service_output]

  # Production SMACK server URL
  #SERVICE_REQUEST_HOST = ENV['SMACK_SERVER_HOST']
  SERVICE_REQUEST_HOST = "ec2-52-53-187-90.us-west-1.compute.amazonaws.com:3000"
  PROJECT_CSV_PATH = Rails.root.join('public', 'assets', 'ProjectLocations.csv')
  RUNTIME_THRESHOLD = 500; # Ignore projects with runtimes more than this number when calculating average runtimes for eta.

  Geocoder.configure(:timeout => 10000)

  # GET /projects/1
  # GET /projects/1.json
  def show
    respond_to do |format|
      format.json
    end
  end

  def fork
    Project.find(params[:id]).fork(current_user.id)
  end

  # GET /projects/new
  # Displays the initial code editor to the user.
  def new
    if current_user == nil
      @project = Project.new
      return
    end
    @project = current_user.projects.new
  end

  # POST /projects.json
  # Creates a new project, makes a request to the SMACK server,
  # and saves the input to the file system as a Base64 string.
  def create
    puts project_params.to_h
    if current_user == nil
      @project = Project.new( project_params )
    else
      @project = current_user.projects.create project_params
      @project.save
    end

    @project.input = params[:project][:input]

    # Need to save before send_service_input in order to know the project id
    # current_user.projects.push @project if current_user
    if params[:run]

      @project[:service_options] = generateOptionsString('smack-options.json')
      op_hash = generateMD5ForImportantOptions('smack-options.json')
      @project[:options_hash] = op_hash
      @project.input = params[:project][:input] # Save the input
      send_service_input # Make a request to the SMACK server with the new project


      avg =  Project.where('options_hash = ? and runtime <= ?', op_hash, RUNTIME_THRESHOLD).average('runtime');
      if(avg != nil)
        @project[:eta] = (avg == 0) ? 1 : avg; #if it is expected to run for 0 seconds make the eta 1 second
      else
        avg = Project.where('runtime <= ?', RUNTIME_THRESHOLD).average('runtime');
        @project[:eta] = (avg == 0) ? 1 : avg;
      end
    end

    # Save the new project to the database and redirect the user to 'edit'
    respond_to do |format|
      puts "which format"
      if @project.save
        format.html { redirect_to edit_project_path(@project)}
        format.js
        format.json { render json: @project, only: [:eta, :output, :id] }
      else
        format.any(:js, :json) do
          render json: @project.errors, status: :unprocessable_entity
        end
        format.html { render :new }
      end
    end
    updateCSV
  end

  # GET /projects/1/edit
  # Displays an already existing project to the user.
  def edit
    @base64_input = @project.input
    @output = @project.output
  end

  # PATCH/PUT /projects/1
  # Updates the project db attributes, saves the new input to the file system,
  # deletes the old output from file system.
  def update
    # Delete the old output so the client doesn't get confused thinking it is the new output.
    @project.output = nil

    @project.input = params[:project][:input]
    @project[:service_options] = generateOptionsString('smack-options.json')

    if params[:run]
      send_service_input # Make a request to the SMACK server with updated project
      op_hash = generateMD5ForImportantOptions('smack-options.json')
      @project[:options_hash] = op_hash
      avg =  Project.where('options_hash = ? and runtime <= ?', op_hash, RUNTIME_THRESHOLD).average('runtime');
      if(avg != nil)
        @project[:eta] = (avg == 0) ? 1 : avg; #if it is expected to run for 0 seconds make the eta 1 second
      else
        avg = Project.where('runtime <= ?', RUNTIME_THRESHOLD).average('runtime');
        @project[:eta] = (avg == 0) ? 1 : avg;
      end
    end

    respond_to do |format|
      if @project.update(project_params)
        format.html { redirect_to edit_project_path(@project)}
        format.js {}
        format.json { render json: @project, only: [:eta, :output, :id] }
      else
        format.any(:js, :json) do
          render json: @project.errors, status: :unprocessable_entity
        end
        format.html { render :edit } # If the save fails, show the user the edit window again.
      end
    end
  end

  # GET /projects/1.json will be called every "eta" seconds (AJAX)
  # until there is output associated with the open project.
  def show
    respond_to do |format|
      format.json { render json: @project, only: [:eta, :output, :id] }
    end
  end

  # POST /projects/receive_service_output
  # Called by the SMACK server when a project has finished running.
  # Saves the output to the file_system
  def receive_service_output
    # Get params and associate :output with the project with id :id
    if params[:output] != nil && params[:output] != ''
      @project.output = params[:output]
    else
      @project.output = 'SMACK did not return any output.';
    end

    @project[:runtime] = params[:time_elapsed]
    @project[:eta] = 0
    @project.save
  end

  # DELETE /projects/:id
  def destroy
    if current_user == nil
      Project.find(params[:id].to_i).destroy
    else
      user = User.find(current_user.id.to_i)
      user.projects.destroy(params[:id].to_i)
    end
    puts 'deleted'
    respond_to do |format|
      format.html { render :nothing => true }
      format.json { head :no_content }
      format.js   { render :layout => false }
    end
  end

  def toggle
    owned_project_ids = current_user.projects.map { |proj| proj.id.to_i }
    if owned_project_ids.include? params[:id].to_i
      project = Project.find(params[:id])
      if params[:visibility] == 'public'
        project.public = true
      end
      if params[:visibility] == 'private'
        project.public = false
      end
      project.save
      render json: nil, status: :ok
      return
    end
      render status: :forbidden
  end

  def run
     @project = Project.find(params[:id])
     @project.time_started = DateTime.now
     @project.output = 'pending'
     @project.eta = Project.where('runtime <= ?', RUNTIME_THRESHOLD).average('runtime').to_i
     @project.save
     response = RestClient.post("#{SERVICE_REQUEST_HOST}/job_started",
     {
         :id => @project[:id],
         :options => @project[:service_options],
         :input => @project.input,
         return_port: request.port
     }.to_json, {content_type: :json, accept: :json})
     # Set the project's eta to the SMACK server's predicted processing time
    render partial: 'profiles/running_project', locals: { project: @project }
    # render json: {eta: JSON.parse(response.body)['eta']  }
  end

  def progress
    @project = Project.find(params[:id])
    render json: {progress: @project.progress, output: @project.output}
  end

  def cancel
    @project = Project.find(params[:id])
    @project.output = nil
  end

    private

  # Sends post request to verification service.
  # Returns: eta
  def send_service_input
    # Send the request
    puts "entered send_service_input"
    base64Input = params[:project][:input]
    response = RestClient.post("#{SERVICE_REQUEST_HOST}/job_started",
    {
        id: @project[:id],
        options: @project[:service_options],
        input: base64Input,
        return_port: request.port
    }.to_json, {content_type: :json, accept: :json})
    # Set the project's eta to the SMACK server's predicted processing time
    eta = JSON.parse(response.body)['eta']
    puts "send_service_input eta"
    puts eta
    return eta
  end

  # Use callbacks to share common setup or constraints between actions.
  def set_project
    @project = Project.find(params[:id])
  end

  # Never trust parameters from the scary internet, only allow the white list through.
  def project_params
    puts params.to_h
    params.require(:project).permit(:title, :input, :public)
  end

  # Looks at the service options config file and creates
  # an options string to be passed to the command-line
  # service.
  def generateOptionsString(optionsConfigFile)
    optionsString = ''
    json = File.read("#{Rails.root}/public/config/" + optionsConfigFile)
    json = JSON.parse(json)

    json['Group Options'].each do |group|
      if params.include? group['name']
        optionsString += '--' + group['name'] + ' ' + params[group['name']] + ' '
      end
    end

    json['Integer Options'].each do |option|
      if params.include? option['name']
        optionsString += '--' + option['name'] + ' ' + params[option['name']] + ' '
      end
    end

    json['String Options'].each do |option|
      if params.include? option['name'] and params[option['name']] != ''
        optionsString += '--' + option['name'] + ' ' + params[option['name']] + ' '
      end
    end

    json['Boolean Options'].each do |option|
      if params.include? option['name']
        optionsString += '--' + option['name'] + ' '
      end
    end
    return optionsString
  end

  # Creates an MD5 checksum hash for the options. This
  # is used to estimate the runtime for projects with the
  # same options.
  # String options have too much variability. The hashed
  # options are integer, group, and boolean options.
  # Ineger options are rounded to the nearest 100 to
  # prevent too much variablility.
  def generateMD5ForImportantOptions(optionsConfigFile)
    options = ''
    json = File.read("#{Rails.root}/public/config/" + optionsConfigFile)
    json = JSON.parse(json)
    json['Group Options'].each do |group|
      if params.include? group['name']
        options += group['name'] + ' ' + params[group['name']] + ' '
      end
    end

    json['Integer Options'].each do |option|
      if params.include? option['name']
        n = params[option['name']].to_i
        # round to the nearest 100
        options += option['name'] + ' ' + (n.round(-2)).to_s + ' '
      end
    end

    json['Boolean Options'].each do |option|
      if params.include? option['name']
        options += option['name'] + ' '
      end
    end

    return Digest::MD5.hexdigest(options)
  end

  # Increments a 'location counter' in the
  # geograph CSV file, or creates a new entry
  # for a location that does not yet exist.
  def updateCSV
    state = request.location.state
    city = request.location.city
    @project.city = city;
    @project.state = state;
    @project.save

    # Creates the CSV file if it doesn't exist
    CSV.open(PROJECT_CSV_PATH, 'a') do end

    # Read the CSV file and increment the value associated with the
    # state if the row exists. This puts the entire csv file into
    # the variable 'csv'
    rowExists = false;
    csv = CSV.read(PROJECT_CSV_PATH, headers:true);
    csv.each do |row|
      if(row[0] == state)
        row[1] = row[1].to_i + 1;
        rowExists = true;
      end
    end

    # This library does not allow you to simply add a row.
    # Every line in the csv variable is rewritten to the file
    CSV.open(PROJECT_CSV_PATH, 'w', write_headers:true, :headers=>['name','pop','lat','lon']) do |file|
      csv.each do |row|
        file << row
      end
      if !rowExists
        file << [state, 1, request.location.latitude, request.location.longitude]
      end
    end
  end
end
