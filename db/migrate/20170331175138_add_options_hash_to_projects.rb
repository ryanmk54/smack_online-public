class AddOptionsHashToProjects < ActiveRecord::Migration[5.0]
  def change
    add_column :projects, :options_hash, :string
  end
end
