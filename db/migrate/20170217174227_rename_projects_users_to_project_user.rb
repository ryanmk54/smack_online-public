class RenameProjectsUsersToProjectUser < ActiveRecord::Migration[5.0]
  def change
    rename_table :projects_users, :project_users
  end
end
