class RecordingsController < ApplicationController

    def create
        binding.pry
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
        params.require(:recording).permit(:name, :user_id, :attachment)
    end

end
