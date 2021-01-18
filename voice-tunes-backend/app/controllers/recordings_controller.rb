class RecordingsController < ApplicationController

    def create
       
        recording = Recording.new(recording_params)

        ## Assign db filename and key (this is the object name in Google Cloud Storage)
        filename = params[:recording][:name]
        recording.midi_data.filename = filename
        recording.midi_data.key = filename +  + "_" + (Recording.all.last.id + 1).to_s

        ## Save params to db and blob to Google Cloud Storage
        if recording.save

            ## Send "Data URL" within json object to browser
            ## This sends because Data URLs are treated as unique opaque origins by modern browsers, rather than inheriting the origin of the settings object responsible for the navigation.
            ## "Data URL" is a base64 encoded string prepended with "data:audio/webm;codecs=opus;base64," (a Data URL declaration)
            ## The download property returns base64 decoded data and needs to be encoded to be embedded into a Data URL
            encoded_data = Base64.encode64(recording.midi_data.download)
            data_url = ("data:audio/webm;codecs=opus;base64," + encoded_data).gsub(/\s/,"")

            ## ALTERNATIVE CODE: Save data to local drive
            # filename = params[:recording][:name] + '.txt'
            # File.write(filename, params[:recording][:base64data])
            # recording.midi_data.attach(
            #     io: File.open(filename),
            #     filename: filename,
            #     content_type: 'text/plain',
            #     identify: false
            # )

            json_obj = {
                name: recording.name,
                user_id: recording.user_id,
                midi_data: data_url,
            }

            render json: json_obj
        else
            render json: {messages: recording.errors.full_messages}
        end
    end

    def index
    end

    def show
    end

    def update
    end

    def destroy
    end

    private

    def recording_params
        params.require(:recording).permit(:name, :user_id, :midi_data)
    end

end
