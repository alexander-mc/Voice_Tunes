class RecordingsController < ApplicationController

    before_action :is_valid_user
    before_action :is_valid_recording, only: [:show, :update, :destroy]
    # before_action :is_available_name, only: [:update]

    def create
        recording = Recording.new(name: recording_params[:name].strip,
                                  user_id: recording_params[:user_id],
                                  midi_data: recording_params[:midi_data],
                                  outgoing_id: recording_params[:outgoing_id]
                                  )
        # binding.pry
        ## Save params to db and blob to Google Cloud Storage
        if recording.save
            render json: recording
        else
            render json: {messages: recording.errors.full_messages}
        end

        ## ALTERNATIVE CODE: Save data to local drive
        # filename = params[:recording][:name] + '.txt'
        # File.write(filename, params[:recording][:base64data])
        # recording.midi_data.attach(
        #     io: File.open(filename),
        #     filename: filename,
        #     content_type: 'text/plain',
        #     identify: false
        # )
    end

    def index
        render json: current_user.recordings
    end

    def show       
        render json: current_recording.as_json.merge(:midi_data => data_url)
    end

    def update
        recording = current_recording
        # if recording.update(name: recording_params[:name].strip)
        #     render json: recording
        # else
        #     render json: {messages: recording.errors.full_messages}
        # end

        # Unused code
        # if recording.has_available_name(recording_params[:name].strip)
        #     new_recording = Recording.new(name: recording_params[:name].strip, user_id: recording.user_id, midi_data: recording.midi_data.blob)
        #     if new_recording.save
        #         # PURGE GCS RECORD AND DELETE FROM DATABASE
        #         # recording.midi_data.purge
        #         # recording.destroy
        #         render json: new_recording
        #     else
        #         render json: {messages: new_recording.errors.full_messages}
        #     end
        # else
        #     render json: {messages: recording.errors.full_messages}
        # end

    end

    def destroy
        current_recording.midi_data.purge
        current_recording.destroy
    end

    private

    def recording_params
        params.require(:recording).permit(:name, :user_id, :midi_data, :outgoing_id)
    end

    def current_recording
        current_user.recordings.find_by(id: params[:id])
    end

    def is_valid_recording
        if !current_recording
            render json: {messages: ["That recording could not be found"]}
        end

        return true
    end

    def data_url
        ## Send "Data URL" within json object to browser
        ## This sends because Data URLs are treated as unique opaque origins by modern browsers, rather than inheriting the origin of the settings object responsible for the navigation.
        ## "Data URL" is a base64 encoded string prepended with "data:audio/webm;codecs=opus;base64," (a Data URL declaration)
        ## The download property returns base64 decoded data and needs to be encoded to be embedded into a Data URL
        encoded_data = Base64.encode64(current_recording.midi_data.download)
        data_url = ("data:audio/webm;codecs=opus;base64," + encoded_data).gsub(/\s/,"")
    end

    # def is_available_name
    #     # Validates recording name when updating an existing recording
    #     db_recording = current_recording
    #     proposed_name = recording_params[:name].strip

    #     if proposed_name.downcase != db_recording.name.downcase
    #         current_user.recordings.each do |rec|
    #             if db_recording.id != rec.id && db_recording.name.downcase == rec.name.downcase
    #                 errors.add(:midi_data, "name has already been used. Please type in a different name for the recording.")
    #             end
    #         end
    #     end
    # end

end
