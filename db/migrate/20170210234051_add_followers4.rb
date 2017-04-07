class AddFollowers4 < ActiveRecord::Migration[5.0]
  create_table :followers do |t|
    t.integer :follower_id, references: :users
    t.integer :following_id, references: :users
  end
end
