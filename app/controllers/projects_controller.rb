class ProjectsController < ApplicationController
  before_action :set_project, only: [:show, :edit, :update]

  SERVICE_REQUEST_URL = "http://httpbin.org/post"

  # GET /projects
  # GET /projects.json
  #def index
  #  @projects = Project.all
  #end

  # GET /projects/1
  # GET /projects/1.json
  def show
    # Encode the associated zip file into Base64 and insert it into the project json
    encoded_zip = Base64.strict_encode64(File.open(Rails.root.join('public', 'system', 'projects', @project.id.to_s)).read)
    json = JSON::parse(@project.to_json).merge({"code" => encoded_zip})

    respond_to do |format|
      format.html
      format.json {render :json => json}
    end
  end

  # GET /projects/new
  def new
    @project = Project.new
  end

  # GET /projects/1/edit
  def edit
  end

  # POST /projects
  # POST /projects.json
  def create
    @project = Project.new(project_params)
    @project[:output] = nil

    # Save the new project to the database
    respond_to do |format|
      if @project.save
        format.html { redirect_to edit_project_path(@project), notice: 'Project was successfully created.' }
        format.json { render :show, status: :created, location: @project }
      else
        format.html { render :new }
        format.json { render json: @project.errors, status: :unprocessable_entity }
      end
    end

    save_input_file_to_file_system
    send_service_input
  end

  # PATCH/PUT /projects/1
  # PATCH/PUT /projects/1.json
  def update
    params[:project][:output] = nil
    respond_to do |format|
      if @project.update(project_params)
        format.html { redirect_to edit_project_path(@project), notice: 'Project was successfully updated.' }
        format.json { render :show, status: :ok, location: @project }
      else
        format.html { render :edit }
        format.json { render json: @project.errors, status: :unprocessable_entity }
      end
    end

    save_input_file_to_file_system
    send_service_input
  end

  # DELETE /projects/1
  # DELETE /projects/1.json
  #def destroy
  #  @project.destroy
  #  respond_to do |format|
  #    format.html { redirect_to projects_url, notice: 'Project was successfully destroyed.' }
  #    format.json { head :no_content }
  #  end
  #end

  # POST /projects/receive_service_output
  # POST /projects/receive_service_output.json
  def receive_service_output
    # Get params and associate :output with the project with id :id
    project = Object.find(params[:id])
    project[:output] = params[:output]
    project.save
  end

  private

    # Sends post request to verification service
    def send_service_input
      # encode zip file as Base64
      encoded_zip = Base64.strict_encode64(File.open(Rails.root.join('public', 'system', 'projects', @project.id.to_s)).read)

      RestClient.post(SERVICE_REQUEST_URL,
      {
          :id => @project[:id],
          :options => @project[:options],
          :code => encoded_zip
      }.to_json, {content_type: :json, accept: :json})
    end

    # Saves the associated project file to %rails.root%/public/sytem/projects/<project_id>
    def save_input_file_to_file_system
      code = params[:project][:code]
      file = File.open(Rails.root.join('public', 'system', 'projects', @project.id.to_s), 'wb')
      file.write(code.read)
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
