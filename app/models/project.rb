class Project < ApplicationRecord
  default_scope { order updated_at: :desc }

  has_and_belongs_to_many :users

  def created_at
    self[:created_at].strftime("%D")
  end

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

  # MUST FIRST SAVE PROJECT BEFORE CALLING THIS SO THE ID IS POPULATED
  def input=(value)
    if value == nil
      return nil
    end

    # Need to make sure a save is done before writing to file so we know the id.
    if self.id == nil
      self.save
    end

    file = File.open(Rails.root.join('public', 'system', 'projects', 'input', self.id.to_s), 'wb')
    file.write(value)
    file.close
  end

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
      output = 'Processing...'
    end

    return output
  end

  def output=(value)
    if self.id == nil
      self.save
    end

    output_path = Rails.root.join('public', 'system', 'projects', 'output', self.id.to_s)

    # Delete the output file if value is nil
    if value == nil
      File.delete(output_path) if File.exist?(output_path)
      return nil
    else # Otherwise write the output value to file
      file = File.open(output_path, 'wb')
      file.write(value)
      file.close
    end
  end

  def ajax_json
    (self.to_json only: [:eta, :output, :id]).html_safe
  end

end
