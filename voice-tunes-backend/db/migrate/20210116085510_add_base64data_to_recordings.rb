class AddBase64dataToRecordings < ActiveRecord::Migration[6.0]
  def change
    add_column :recordings, :base64data, :string
  end
end
