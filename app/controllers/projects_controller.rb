class ProjectsController < ApplicationController
  protect_from_forgery with: :null_session, if: Proc.new { |c| c.request.format == 'application/json'}
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
    @base64_input = File.open(Rails.root.join('public', 'system', 'projects', 'input', @project.id.to_s)).read
    @output = File.open(Rails.root.join('public', 'system', 'projects', 'output', @project.id.to_s)).read
  end

  # POST /projects.json
  def create
    @project = Project.new(project_params)

    # This line is used for testing until the view is sending base64 directly over
    #params[:project][:input] = Base64.strict_encode64(params[:project][:input].read)

    @project.save # Need to save before send_service_input so the project id is known

    @project[:output] = nil # The project is processing until output is non-null
    @project[:eta] = send_service_input # Make a request to the SMACK server with the new project
    save_base64_input_to_file_system
    # Save the new project to the database
    respond_to do |format|
      if @project.save
        format.html { redirect_to edit_project_path(@project)}
      else
        format.html { render :new }
      end
    end
  end

  # PATCH/PUT /projects/1
  def update
    # This line is used for testing until the view is sending base64 directly over
    #params[:project][:input] = Base64.strict_encode64(params[:project][:input].read)

    params[:project][:eta] = send_service_input # Make a request to the SMACK server with updated project
    params[:project][:output] = nil # The output is nil until the SMACK job is finished.

    save_base64_input_to_file_system
    respond_to do |format|
      if @project.update(project_params)
        format.html { redirect_to edit_project_path(@project), notice: 'Project was successfully updated.' }
      else
        format.html { render :edit }
      end
    end
  end

  # POST /projects/receive_service_output
  def receive_service_output
    # Get params and associate :output with the project with id :id
    @project = Project.find(params[:id])
    @project[:eta] = 0 # Processing finished, estimated time left is 0
    @project.save
    save_output_string_to_file_system
  end

  private
  # Sends post request to verification service
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
    #return response[:eta]
    return 5
  end

  # Saves the associated base64 input to %rails.root%/public/sytem/projects/<project_id>
  def save_base64_input_to_file_system
    input = params[:project][:input] # The base64 input is passed here
    file = File.open(Rails.root.join('public', 'system', 'projects', 'input', @project.id.to_s), 'wb')
    file.write(input)
    file.close
  end

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
