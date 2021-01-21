class Recording < ApplicationRecord
    belongs_to :user

    validates :name,
              presence: { message: "was not entered" }

    validate :validate_midi_data
    before_save :sanitize_name

    has_one_attached :midi_data

    # For use with CarrierWave
    # mount_uploader :attachment, AttachmentUploader # delete later since using active storage

    def test1
        binding.pry
    
    end

    private

    def test2
        binding.pry
    end

    def validate_midi_data
        user = User.find(user_id)
        
        # Validates recording name when updating an existing recording
        # db_recording = Recording.find_by(id: id)

        # if db_recording
        #     if name.downcase != db_recording.name.downcase
        #         user.recordings.each do |db_recording|
        #             if id != db_recording.id && name.downcase == db_recording.name.downcase
        #                 errors.add(:midi_data, "name has already been used. Please type in a different name for the recording.")
        #             end
        #         end
        #     end
        
        # Validates all midi data when creating a new recording
        # else
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
            user_recording_names = user.recordings.map{ |r| r.name.downcase }

            if user_recording_names.any?(name.downcase)
                errors.add(:midi_data, "name has already been used. Please type in a different name for the recording.")
            end

        # end

    end

    def sanitize_name
        
        ## Assign db midi_data filename and key (this is the name assigned in Google Cloud Storage)
        ## NOTE: When updating the name of an existing recording, the metadata will not be changed.
        ## This was intentionally done to streamline the development of this program.
        ## Thus, if the name of an existing recording is changed, the name will change in the SQL database but not in Google Cloud Storage (GCS).
        ## To find an object in GCS after its name has changed, you can find the recording's original name located in its metadata, which is stored in the object located in the database
        ## E.G. recording.midi_file.filename
        ## E.G. recording.midi_file.key
        
        db_recording = Recording.find_by(id: id)

        ## Use this code to update the metadata of an existing object
        # if db_recording
        #   midi_data.key = name + "_" + db_recording.id.to_s
        # else
        #   <ADD 2 LINES OF CODE BELOW>
        # end

        if !db_recording
            midi_data.filename = name
            Recording.all.size == 0 ? midi_data.key = name +  "_1" : midi_data.key = name + "_" + (Recording.all.last.id + 1).to_s
        end
    end

end
