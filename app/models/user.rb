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

  def self.search input = nil
    if input.blank? or input.nil?
      self.all
    end
    where('username like ?', "%#{input}%")
  end

  def created_at
    self[:created_at].strftime("%D")
  end

  def private_projects
  end

  def public_projects
    # TODO
  end

  def followers
    follower_ids = Follower.where(following_id: self.id).select(:follower_id).map {|entry| entry.follower_id}
    User.find(follower_ids)
  end

  def followees
    following_ids = Follower.where(follower_id: self.id).select(:following_id).map {|entry| entry.following_id}
    User.find(following_ids)
  end

  def follow followee_id
    Follower.create(follower_id: self.id, following_id: followee_id)
  end

  def unfollow followee_id
    entries = Follower.where(follower_id: self.id).where(following_id: followee_id)
    Follower.delete(entries.map{ |f| f.id})
  end



  def is_following user_id
    return self.followees.include? User.find(user_id)
  end
end
