class RemoveRecordingDataFromRecordings < ActiveRecord::Migration[6.0]
  def change
    remove_column :recordings, :recording_data, :string
  end
end
