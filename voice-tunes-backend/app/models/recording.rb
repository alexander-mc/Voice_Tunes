class Recording < ApplicationRecord
    belongs_to :user

    attr_accessor :outgoing_id # necessary?

    validates :name,
              presence: { message: "was not entered" }
    validate :validate_midi_data
    validate :is_name_available?

    before_save :update_metadata

    has_one_attached :midi_data

    # For use with CarrierWave
    # mount_uploader :attachment, AttachmentUploader # delete later since using active storage

    # Validates recording name when updating an existing recording
    # def has_available_name(proposed_name)
    #     if proposed_name.downcase != name.downcase
    #         user.recordings.each do |rec|
    #             if id != rec.id && proposed_name.downcase == rec.name.downcase
    #                 errors.add(:midi_data, "name has already been used. Please type in a different name for the recording.")
    #                 return false
    #             end
    #         end
    #     end

    #     return true
    # end

    private

    def validate_midi_data
        # binding.pry
        # user = User.find(user_id)
        
        # # Validates recording name when updating an existing recording
        # # outgoing_recording = Recording.find_by(id: outgoing_id)

        # # if outgoing_recording
        #     # if name.downcase != outgoing_recording.name.downcase
        #         user.recordings.each do |db_recording|

        #             if outgoing_id != db_recording.id.to_s && name.downcase == db_recording.name.downcase
        #                 errors.add(:midi_data, "name has already been used. Please type in a different name for the recording.")
        #                 return false
        #             end

        #         end
            # end
        # end #temp
        # binding.pry
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
            # user_recording_names = user.recordings.map{ |r| r.name.downcase }

            # if user_recording_names.any?(name.downcase)
            #     errors.add(:midi_data, "name has already been used. Please type in a different name for the recording.")
            # end

        # end

    end

    # For renaming a recording, name_exists? only checks for duplicates in records other than its own
    # This is purposefully done so that a user can make case sensitive changes to a name (e.g., test => Test)
    def is_name_available?

        user = User.find(user_id)
        
        # Validates recording name when updating an existing recording
        # outgoing_recording = Recording.find_by(id: outgoing_id)

        # if outgoing_recording
            # if name.downcase != outgoing_recording.name.downcase
                user.recordings.each do |db_recording|
                    if outgoing_id != db_recording.id.to_s && name.downcase == db_recording.name.downcase
                        errors.add(:midi_data, "name has already been used. Please type in a different name for the recording.")
                        return false
                    end
                end
                
                return true

    end

    def update_metadata
        
        ## Assign db midi_data filename and key (this is the name assigned in Google Cloud Storage)
        ## NOTE: When updating the name of an existing recording, the metadata will not be changed.
        ## This was intentionally done to streamline the development of this program.
        ## Thus, if the name of an existing recording is changed, the name will change in the SQL database but not in Google Cloud Storage (GCS).
        ## To find an object in GCS after its name has changed, you can find the recording's original name located in its metadata, which is stored in the object located in the database
        ## E.G. recording.midi_file.filename
        ## E.G. recording.midi_file.key
        
        # db_recording = Recording.find_by(id: id)

        ## Use this code to update the metadata of an existing object
        # if db_recording
        #   midi_data.key = name + "_" + db_recording.id.to_s
        # else
        #   <ADD 2 LINES OF CODE BELOW>
        # end

        # if !db_recording
            midi_data.filename = name
            Recording.all.size == 0 ? midi_data.key = name +  "_1" : midi_data.key = name + "_" + (Recording.all.last.id + 1).to_s
        # end
    end

end
