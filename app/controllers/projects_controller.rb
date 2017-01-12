class ProjectsController < ApplicationController
  #protect_from_forgery with: :null_session, if: Proc.new { |c| c.request.format == 'application/json'}
  before_action :set_project, only: [:show, :edit, :update, :receive_service_output]

  # Production SMACK server URL
  SERVICE_REQUEST_URL = 'ec2-52-53-187-90.us-west-1.compute.amazonaws.com:3000/job_started'

  # GET /projects/new
  # Displays the initial code editor to the user.
  def new
    @project = Project.new
  end

  # POST /projects.json
  # Creates a new project, makes a request to the SMACK server,
  # and saves the input to the file system as a Base64 string.
  def create
    @project = Project.new(project_params)
    @project.save # Need to save before send_service_input in order to know the project id
    @project.input = params[:project][:input] # Save the input
    @project[:user_ip] =  request.remote_ip
    @project[:eta] = send_service_input # Make a request to the SMACK server with the new project

    # Save the new project to the database and redirect the user to 'edit'
    respond_to do |format|
      if @project.save
        format.html { redirect_to edit_project_path(@project)}
        format.js { render :edit  }
        format.json { render json: @project, only: [:eta, :output] }
      else
        format.html { render :new }
      end
    end
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
    params[:project][:eta] = send_service_input # Make a request to the SMACK server with updated project

    respond_to do |format|
      if @project.update(project_params)
        format.html { redirect_to edit_project_path(@project)}
        format.js { render :edit }
        format.json { render json: @project, only: [:eta, :output] }
      else
        format.html { render :edit } # If the save fails, show the user the edit window again.
      end
    end
  end

  # GET /projects/1.json will be called every "eta" seconds (AJAX)
  # until there is output associated with the open project.
  def show
    respond_to do |format|
      format.json
    end
  end

  # POST /projects/receive_service_output
  # Called by the SMACK server when a project has finished running.
  # Saves the output to the file_system
  def receive_service_output
    # Get params and associate :output with the project with id :id
    @project.output = params[:output]
  end

  private

  # Sends post request to verification service.
  # Returns: eta
  def send_service_input
    # Send the request
    base64Input = params[:project][:input]
    response = RestClient.post(SERVICE_REQUEST_URL,
    {
        :id => @project[:id],
        :options => @project[:options],
        :input => base64Input
    }.to_json, {content_type: :json, accept: :json})
    
    # Set the project's eta to the SMACK server's predicted processing time
    return JSON.parse(response.body)['eta']
  end

  # Use callbacks to share common setup or constraints between actions.
  def set_project
    @project = Project.find(params[:id])
  end

  # Never trust parameters from the scary internet, only allow the white list through.
  def project_params
    params.require(:project).permit(:title, :output, :eta)
  end
end
