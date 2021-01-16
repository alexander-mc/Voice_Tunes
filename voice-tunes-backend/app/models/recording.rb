class Recording < ApplicationRecord
    belongs_to :user

    validates :name,
              presence: { message: "was not entered" }

    validate :validate_user

    # validate :validate_midi_file
    has_one_attached :midi_file

    # mount_uploader :attachment, AttachmentUploader # delete later since using active storage

    private

    def validate_user
        if !User.find_by(id: self.user_id)
            errors.add(:user, "could not be found")
        end
    end

    # def validate_midi_file
    #     if midi_file.byte_size >= 500.megabyte # you can adjust this later
    #         errors.add(:midi_file, "is too large")
    #     end

    #     acceptable_types = ["audio/midi", "audio/mid"]
        
    #     if !acceptable_types.include?(midi_file.content_type)
    #         errors.add(:midi_file, "must be a MIDI file")
    #     end
        
    # end
end
