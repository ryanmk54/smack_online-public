
class ProjectUser < ActiveRecord::Base
  belongs_to :project
  belongs_to :user

  def initialize( project_id, user_id )
    @project_id = project_id
    @user_id = user_id
  end
end