class RecordingsController < ApplicationController

    before_action :validate_user
    before_action :validate_recording, only: [:show, :update, :destroy]

    def create
        recording = Recording.new(name: recording_params[:name].strip, user_id: recording_params[:user_id], midi_data: recording_params[:midi_data])

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

        if recording.update(name: recording_params[:name].strip)
            render json: recording
        else
            render json: {messages: recording.errors.full_messages}
        end
    end

    def destroy
        current_recording.midi_data.purge
        current_recording.destroy
    end

    private

    def recording_params
        params.require(:recording).permit(:name, :user_id, :midi_data, :old_name)
    end

    def current_recording
        current_user.recordings.find_by(id: params[:id])
    end

    def validate_recording
        if !current_recording
            render json: {messages: ["That recording could not be found"]}
        end
    end

    def data_url
        ## Send "Data URL" within json object to browser
        ## This sends because Data URLs are treated as unique opaque origins by modern browsers, rather than inheriting the origin of the settings object responsible for the navigation.
        ## "Data URL" is a base64 encoded string prepended with "data:audio/webm;codecs=opus;base64," (a Data URL declaration)
        ## The download property returns base64 decoded data and needs to be encoded to be embedded into a Data URL
        encoded_data = Base64.encode64(current_recording.midi_data.download)
        data_url = ("data:audio/webm;codecs=opus;base64," + encoded_data).gsub(/\s/,"")
    end

end
