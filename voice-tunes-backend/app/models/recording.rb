class Recording < ApplicationRecord
    belongs_to :user

    validates :name,
              presence: { message: "was not entered" }

    validate :validate_user

    validate :validate_midi_data
    before_save :sanitize_name

    has_one_attached :midi_data

    # For use with CarrierWave
    # mount_uploader :attachment, AttachmentUploader # delete later since using active storage

    private

    def validate_user
        if !User.find_by(id: user_id)
            errors.add(:user, "could not be found")
        end
    end

    def validate_midi_data
        
        # Size -- you can adjust this later
        if midi_data.byte_size >= 500.megabyte
            errors.add(:midi_data, "is too large")
        end

        # Content types
        acceptable_types = ["video/webm", "audio/midi", "audio/mid"]
        if !acceptable_types.include?(midi_data.content_type)
            errors.add(:midi_data, "must be an audio file")
        end

        # Name
        user = User.find_by(id: user_id)
        
        if user
            r_names = user.recordings.map{ |r| r.name.downcase }
            if r_names.any?(name.downcase)
                errors.add(:midi_data, "name has already been used. Please type in a different name for the recording.")
            end
        end

    end

    def sanitize_name

        ## Assign db midi_data filename and key (this is the name assigned in Google Cloud Storage)
        midi_data.filename = name
        Recording.all.size == 0 ? midi_data.key = name +  + "_1" : midi_data.key = name +  + "_" + (Recording.all.last.id + 1).to_s
    end

end
