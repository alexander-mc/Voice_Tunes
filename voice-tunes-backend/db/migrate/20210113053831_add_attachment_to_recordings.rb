class AddAttachmentToRecordings < ActiveRecord::Migration[6.0]
  def change
    add_column :recordings, :attachment, :string
  end
end
