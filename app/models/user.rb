class User < ApplicationRecord
  # Include default devise modules. Others available are:
  # :omniauthable, :lockable
  devise :database_authenticatable, :registerable,
         :recoverable, :rememberable, :trackable, :validatable,
         :confirmable, :timeoutable

  has_many :projects
  has_many :project_user

  attr_accessor :id, :email, :name


  def all_projects
    relationships = ProjectUser.find_by(user_id: self.id)
    relationships.map { |relationship| relationship.project_id }
  end

  def private_projects
    projects = []
    relationships = ProjectUser.find_by(user_id: self.id)
    relationships.each do |user_id, project_id|
      if ProjectUser.find_by(project_id: project_id).size == 1
        projects.append(Project.find_by(project_id))
      end
    end
    return projects
  end

  def public_projects
    projects = []
    relationships = ProjectUser.find_by(user_id: self.id)
    relationships.each do |user_id, project_id|
      if ProjectUser.find_by(project_id: project_id).size > 1
        projects.append(Project.find_by(project_id))
      end
    end
    return projects
  end



end



