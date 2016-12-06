class ProjectsController < ApplicationController
  before_action :set_project, only: [:show, :edit, :update]

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
    @project[:eta] = send_service_input # Make a request to the SMACK server with the new project
    save_base64_input_to_file_system

    # Save the new project to the database and redirect the user to 'edit'
    respond_to do |format|
      if @project.save
        format.html { redirect_to edit_project_path(@project)}
      else
        format.html { render :new }
      end
    end
  end

  # GET /projects/1/edit
  # Displays an already existing project to the user.
  def edit
    # @base64_input will be used by the front-end js to populate the input editor.
    if(File.file?(Rails.root.join('public', 'system', 'projects', 'input', @project.id.to_s)))
      file = File.open(Rails.root.join('public', 'system', 'projects', 'input', @project.id.to_s))
      @base64_input = file.read
      file.close
    end

    # If output already exists, pass it to the front-end js through @output
    if(File.file?(Rails.root.join('public', 'system', 'projects', 'output', @project.id.to_s)))
      file = File.open(Rails.root.join('public', 'system', 'projects', 'output', @project.id.to_s))
      @output = file.read
      file.close
    else
      @output = 'Processing...'
    end
  end

  # PATCH/PUT /projects/1
  # Updates the project db attributes, saves the new input to the file system,
  # deletes the old output from file system.
  def update
    # Delete the old output so the client doesn't get confused thinking it is the new output.
    output_path = Rails.root.join('public', 'system', 'projects', 'output', @project.id.to_s)
    File.delete(output_path) if File.exist?(output_path)
    params[:project][:eta] = send_service_input # Make a request to the SMACK server with updated project
    params[:project][:output] = nil # The output is nil until the SMACK job is finished.
    save_base64_input_to_file_system
    respond_to do |format|
      if @project.update(project_params)
        format.html { redirect_to edit_project_path(@project), notice: 'Project was successfully updated.' }
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
    @project = Project.find(params[:id])
    save_output_string_to_file_system
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

  # Saves the associated base64 input to %rails.root%/public/system/projects/input/<project_id>
  def save_base64_input_to_file_system
    input = params[:project][:input] # The base64 input is passed here
    file = File.open(Rails.root.join('public', 'system', 'projects', 'input', @project.id.to_s), 'wb')
    file.write(input)
    file.close
  end

  # Saves the output associated with the project to %rails.root%/public/system/projects/output/<project_id>
  def save_output_string_to_file_system
    output = params[:output]
    file = File.open(Rails.root.join('public', 'system', 'projects', 'output', @project.id.to_s), 'wb')
    file.write(output)
    file.close
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
