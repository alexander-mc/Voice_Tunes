class AddMidiFileToRecordings < ActiveRecord::Migration[6.0]
  def change
    add_column :recordings, :midi_file, :string
  end
end
