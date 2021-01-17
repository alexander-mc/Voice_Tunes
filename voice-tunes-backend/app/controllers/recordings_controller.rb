class RecordingsController < ApplicationController

    def create
        binding.pry

        
        recording = Recording.new(recording_params)
        
        if recording.save

            filename = params[:recording][:name] + '.txt'
            File.write(filename, params[:recording][:base64data])

            recording.midi_file.attach(
                io: File.open(filename),
                filename: filename,
                content_type: 'text/plain',
                identify: false
            )

            binding.pry

            # encoded_data = Base64.encode64(recording.midi_file.download)
            # base64data = ("data:audio/webm;codecs=opus;base64," + encoded_data).gsub(/\s/,"")
            # binding.pry
            json_obj = {
                name: recording.name,
                user_id: recording.user_id,
                base64data: recording.midi_file.download,
            }

            render json: json_obj # need to fix
        else
            puts (recording.errors.full_messages)
            binding.pry
            # render json: {messages: recording.errors.full_messages}
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
        params.require(:recording).permit(:name, :user_id, :base64data)
        # remove 'attachment' column from database later
    end

end
