class Following < ApplicationRecord
  belongs_to :follower, foreign_key: :following_id


  def id= id
    self.user_id = id
  end

  def id
    self.user_id
  end
end