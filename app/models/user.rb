class User < ApplicationRecord

  # Include default devise modules. Others available are:
  # :omniauthable, :lockable
  devise :database_authenticatable, :registerable,
         :recoverable, :rememberable, :trackable, :validatable,
         :confirmable, :timeoutable

  # has_many :project_users
  # has_many :projects, through: :project_users

  has_and_belongs_to_many :projects

  def private_projects
    self.projects
  end

  def public_projects
    # TODO
  end

  # def currently_running_projects
  #   self.projects.
  # end
end


