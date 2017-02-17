class ChangeServiceOptionsTypeInProjects < ActiveRecord::Migration[5.0]
  def change
    change_column :projects, :service_options, :text
  end
end
