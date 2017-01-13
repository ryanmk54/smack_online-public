class AddCityToProject < ActiveRecord::Migration[5.0]
  def change
    add_column :projects, :city, :string
  end
end
