class Recording < ApplicationRecord
    belongs_to :user

    attr_accessor :outgoing_id

    validates :name,
              presence: { message: "was not entered" }
    validate :validate_midi_data
    validate :is_name_available?

    before_save :update_metadata
    after_create :set_origin_id_default

    has_one_attached :midi_data

    # For use with CarrierWave
    # mount_uploader :attachment, AttachmentUploader # delete later since using active storage

    private

    def validate_midi_data

            # Size
            if midi_data.byte_size >= 500.megabyte
                errors.add(:midi_data, "is too large")
            end
            
            # Content types
            acceptable_types = ["video/webm", "audio/midi", "audio/mid"]
            if !acceptable_types.include?(midi_data.content_type)
                errors.add(:midi_data, "must be an audio file")
            end

    end

    # For renaming a recording, name_exists? only checks for duplicates in records other than its own
    # This is purposefully done so that a user can make case sensitive changes to a name (e.g., test => Test)
    def is_name_available?
        user = User.find(user_id)
        
        user.recordings.each do |db_recording|
            if outgoing_id != db_recording.id.to_s && name.downcase == db_recording.name.downcase
                errors.add(:midi_data, "name has already been used. Please type in a different name for the recording.")
                return false
            end
        end
        
        return true
    end

    def update_metadata
        midi_data.filename = name
        Recording.all.size == 0 ? midi_data.key = name +  "_1" : midi_data.key = name + "_" + (Recording.all.last.id + 1).to_s
    end

    def set_origin_id_default
        update_columns(origin_id: id)
    end

end
