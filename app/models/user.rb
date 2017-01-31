class User < ApplicationRecord
  # Include default devise modules. Others available are:
  # :omniauthable, :lockable
  devise :database_authenticatable, :registerable,
         :recoverable, :rememberable, :trackable, :validatable,
         :confirmable, :timeoutable


  has_attached_file :avatar, styles: { medium: "300x300>", thumb: "100x100>" }, default_url: "/images/:style/missing.png"
  validates_attachment_content_type :avatar, content_type: /\Aimage\/.*\z/

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


