class AddPublicColumnToUsers < ActiveRecord::Migration[5.0]
  def change
    add_column :projects, :public, :boolean, :default => true
  end
end
