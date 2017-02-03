class AddStateToProjects < ActiveRecord::Migration[5.0]
  def change
    add_column :projects, :state, :string
  end
end
