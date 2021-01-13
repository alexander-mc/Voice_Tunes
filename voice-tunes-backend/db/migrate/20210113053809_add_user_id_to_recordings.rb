class AddUserIdToRecordings < ActiveRecord::Migration[6.0]
  def change
    add_column :recordings, :user_id, :integer
  end
end
