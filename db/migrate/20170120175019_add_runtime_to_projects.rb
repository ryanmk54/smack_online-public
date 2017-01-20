class AddRuntimeToProjects < ActiveRecord::Migration[5.0]
  def change
    add_column :projects, :runtime, :integer
  end
end
