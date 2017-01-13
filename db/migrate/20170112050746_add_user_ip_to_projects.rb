class AddUserIpToProjects < ActiveRecord::Migration[5.0]
  def change
    add_column :projects, :user_ip, :string
  end
end
