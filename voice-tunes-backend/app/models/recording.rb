class Recording < ApplicationRecord
    belongs_to :user

    validates :name,
              presence: { message: "was not entered" }

    validate :validate_user

    validate :validate_midi_data
    has_one_attached :midi_data

    # For use with CarrierWave
    # mount_uploader :attachment, AttachmentUploader # delete later since using active storage

    private

    def validate_user
        if !User.find_by(id: self.user_id)
            errors.add(:user, "could not be found")
        end
    end

    def validate_midi_data
        if midi_data.byte_size >= 500.megabyte # You can adjust this later
            errors.add(:midi_data, "is too large")
        end
        binding.pry
        acceptable_types = ["video/webm", "audio/midi", "audio/mid"]
        
        if !acceptable_types.include?(midi_data.content_type)
            errors.add(:midi_data, "must be an audio file")
        end 
    end

end
