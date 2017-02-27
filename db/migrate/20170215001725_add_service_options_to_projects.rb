class AddServiceOptionsToProjects < ActiveRecord::Migration[5.0]
  def change
    add_column :projects, :service_options, :string
  end
end
