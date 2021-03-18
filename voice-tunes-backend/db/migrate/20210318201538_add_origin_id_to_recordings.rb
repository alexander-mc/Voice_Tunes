class AddOriginIdToRecordings < ActiveRecord::Migration[6.0]
  def change
    add_column :recordings, :origin_id, :integer

    reversible do |dir|
      dir.up { Recording.update_all('origin_id = id') }
    end
  end
end
