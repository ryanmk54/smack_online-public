class ProjectsController < ApplicationController
  before_action :set_project, only: [:show, :edit, :update]

  # Production SMACK server URL
  SERVICE_REQUEST_URL = "ec2-52-53-187-90.us-west-1.compute.amazonaws.com:3000/job_started"

  # GET /projects/1.json
  def show
    respond_to do |format|
      format.json
    end
  end

  # GET /projects/new
  def new
    @project = Project.new
  end

  # GET /projects/1/edit
  def edit
    @encoded_zip = File.open(Rails.root.join('public', 'system', 'projects', @project.id.to_s)).read
  end

  # POST /projects.json
  def create
    @project = Project.new(project_params)
    @project[:output] = nil # The project is processing until output is non-null

    # Save the new project to the database
    respond_to do |format|
      if @project.save
        format.html { redirect_to edit_project_path(@project)}
      else
        format.html { render :new }
      end
    end

    # This line is used for testing until the view is sending base64 directly over
    params[:project][:code] = Base64.strict_encode64(params[:project][:code].read)

    save_base64_input_to_file_system
    send_service_input # Make a request to the SMACK server with the new project
  end

  # PATCH/PUT /projects/1
  def update
    # The output is nil until the SMACK job is finished.
    params[:project][:output] = nil

    respond_to do |format|
      if @project.update(project_params)
        format.html { redirect_to edit_project_path(@project), notice: 'Project was successfully updated.' }
      else
        format.html { render :edit }
      end
    end

    # This line is used for testing until the view is sending base64 directly over
    params[:project][:code] = Base64.strict_encode64(params[:project][:code].read)

    save_base64_input_to_file_system 
    send_service_input # Make a request to the SMACK server with updated project
  end

  # POST /projects/receive_service_output
  def receive_service_output
    # Get params and associate :output with the project with id :id
    project = Object.find(params[:id])
    project[:eta] = 0 # Processing finished, estimated time left is 0
    project[:output] = params[:output]
    project.save
  end

  private
  # Sends post request to verification service
  def send_service_input
    # Send the request
    base64Input = params[:project][:code]
    response = RestClient.post(SERVICE_REQUEST_URL,
    {
        :id => @project[:id],
        :options => @project[:options],
        :code => base64Input
    }.to_json, {content_type: :json, accept: :json})

    # Set the project's eta to the SMACK server's predicted processing time
    #@project[:eta] = response[:eta]
  end

  # Saves the associated base64 input to %rails.root%/public/sytem/projects/<project_id>
  def save_base64_input_to_file_system
    code = params[:project][:code] # The base64 input is passed here
    file = File.open(Rails.root.join('public', 'system', 'projects', @project.id.to_s), 'wb')
    file.write(code)
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
