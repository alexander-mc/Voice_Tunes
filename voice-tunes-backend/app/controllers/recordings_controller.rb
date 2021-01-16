class RecordingsController < ApplicationController

    def create
        binding.pry
        recording = Recording.new(recording_params)

        if recording.save
            binding.pry
            # Return information about attachment

            # data = recording.midi_file.download

            json_obj = {
                name: recording.name,
                user_id: recording.user_id,
                base64data: recording.base64data,
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
