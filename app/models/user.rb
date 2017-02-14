class User < ApplicationRecord
  # Include default devise modules. Others available are:
  # :omniauthable, :lockable
  devise :database_authenticatable, :registerable,
         :recoverable, :rememberable, :trackable, :validatable,
         :confirmable, :timeoutable



  has_many :followers




  has_attached_file :avatar, styles: { medium: "300x300>", thumb: "100x100>" }, default_url: "missing.png"
  validates_attachment_content_type :avatar, content_type: /\Aimage\/.*\z/


  has_and_belongs_to_many :projects

  def created_at
    self[:created_at].strftime("%D")
  end

  def private_projects
  end

  def public_projects
    # TODO
  end

  def followers
    follower_ids = Follower.where(following_id: self.id).select(:follower_id).map {|follower| follower.follower_id}
    if follower_ids.empty?
      return
    end
    User.find(follower_ids)
  end

  def followees
    following_ids = Follower.where(follower_id: self.id).select(:following_id).map {|following| following.following_id}
    if following_ids.empty?
      return
    end
    User.find(following_ids)
  end

  def add_follower follower_id
    Follower.create(follower_id: follower_id, following_id: self.id)
  end

  def add_followee following_id
    Follower.create(following_id: following_id, follower_id: self.id)
  end


end