class Follower < ActiveRecord::Base
  belongs_to :user, foreign_key: 'following_id'
  has_many :users, foreign_key: 'follower_id'
end