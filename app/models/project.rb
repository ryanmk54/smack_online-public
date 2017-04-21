class Project < ApplicationRecord
  default_scope { order updated_at: :desc }

  # has_and_belongs_to_many :users
  has_many :project_users
  has_many :users, through: :project_users

  # returns the time that this project was created
  def created_at
    self[:created_at].strftime("%D")
  end

  # sets this project's 'public' attribute to either
  # true or false
  def set_visibility(visibility)
    self.public = visibility
  end

  # creates a project for the user associated with user_id
  # that is an exact copy of this project
  def fork user_id
    user = User.find(user_id)
    project = user.projects.create
    project.title = self.title
    project.eta = self.eta
    project.input = self.input
    project.service_options = self.service_options
    project.save
  end

  # returns the input for this project. This is what will
  # be the input for the SMACK process
  def input
    if self.id == nil
      return nil
    end

    input_path = Rails.root.join('public', 'system', 'projects', 'input', self.id.to_s)
    if(File.file?(input_path))
      file = File.open(input_path)
      input = file.read
      file.close
      return input
    else
      return nil
    end
  end

  # Sets the input for this project
  # MUST FIRST SAVE PROJECT BEFORE CALLING THIS SO THE ID IS POPULATED
  def input=(value)
    if value == nil
      return nil
    end

    # Need to make sure a save is done before writing to file so we know the id.
    if self.id == nil
      self.save
    end

    file = File.open(Rails.root.join('public', 'system', 'projects', 'input', self.id.to_s), 'w')
    file.write(value)
    file.close
  end

  # returns the output given by the SMACK process for this project.
  # if a SMACK process has yet to be executed, the output is nil
  # if there is a SMACK process currently running for this project,
  # then the output is 'pending'
  def output
    if self.id == nil
      return nil
    end

    output_path = Rails.root.join('public', 'system', 'projects', 'output', self.id.to_s)

    # If the file exists, return the file's contents
    if(File.file?(output_path))
      file = File.open(output_path)
      output = file.read
      file.close
    else # Otherwise, the job is still processing
      output = nil
    end

    return output
  end

  # Sets the output for this project
  def output=(value)
    # If there is no ID associated with the project, create one by saving the project.
    if self.id == nil
      self.save
    end

    output_path = Rails.root.join('public', 'system', 'projects', 'output', self.id.to_s)
    # Delete the output file if value is nil
    if value == nil
      File.delete(output_path) if File.exist?(output_path)
      return nil
    else # Otherwise write the output value to file
      file = File.open(output_path, 'w')
      file.write(formatOutput(value))
      file.close
    end
  end

  def ajax_json
    (self.to_json only: [:eta, :output, :id]).html_safe
  end

  def formatOutput(output)
    formatted = ''
    output.each_line do |line|
      formatted += line.gsub(/\/home\/ubuntu\/src\/smack_server\/public\/system\/projects\/[0-9]+\//, '');
    end
    return formatted;
  end

  # Returns the time-to-completion progress for the SMACK process associated with this project as a decimal.
  # When the progress is 1, the process for this project is completed.
  def progress
    if self.eta = 0
      return 1
    end
    time_elapsed = ((DateTime.now - self.time_started.to_datetime) * 24 * 60 * 60).to_f
    progress = (time_elapsed / self.eta.to_f).to_f
    progress
  end
end
