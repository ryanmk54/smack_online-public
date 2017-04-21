class User < ApplicationRecord
  # Include default devise modules. Others available are:
  # :omniauthable, :lockable
  devise :database_authenticatable, :registerable,
         :recoverable, :rememberable, :trackable, :validatable,
         :confirmable, :timeoutable

  has_many :followers

  has_many :project_users
  has_many :projects, through: :project_users

  has_attached_file :avatar, styles: { medium: "300x300>", thumb: "100x100>" }, default_url: "missing.png"
  validates_attachment_content_type :avatar, content_type: /\Aimage\/.*\z/

  # Static method
  # returns a list of users where the username is similar to input
  def self.search input = nil
    if input.blank? or input.nil?
      self.all
    end
    where('username like ?', "%#{input}%")
  end

  # Returns the time that the project was created
  def created_at
    self[:created_at].strftime("%D")
  end

  # returns a list of users that follow this user
  def followers
    follower_ids = Follower.where(following_id: self.id).select(:follower_id).map {|entry| entry.follower_id}
    User.find(follower_ids)
  end

  # returns a list of users that this user follows
  def followees
    following_ids = Follower.where(follower_id: self.id).select(:following_id).map {|entry| entry.following_id}
    User.find(following_ids)
  end

  # adds the user identified by followee_id to this user's followees
  def follow followee_id
    Follower.create(follower_id: self.id, following_id: followee_id)
  end

  # removes the user identified by followee_id from this user's followees
  def unfollow followee_id
    entries = Follower.where(follower_id: self.id).where(following_id: followee_id)
    Follower.delete(entries.map{ |f| f.id})
  end

  # returns true if this user is following the user associated with user_id
  # otherwise, returns false
  def is_following user_id
    return self.followees.include? User.find(user_id)
  end

  # returns a list of projects that are owned by this user and
  # are also public
  def public_projects
    projects.where(public: true)
  end

  # returns a list of projects owned by this user whose output
  # attribute is currently marked as 'pending'
  def running_projects
    running_projects = []
    self.projects.each do |p|
      if p.output == 'pending'
        running_projects.push p
      end
    end
    running_projects
  end
end
