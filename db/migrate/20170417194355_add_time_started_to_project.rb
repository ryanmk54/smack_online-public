class AddTimeStartedToProject < ActiveRecord::Migration[5.0]
  def change
    add_column :projects, :time_started, :datetime
  end
end
