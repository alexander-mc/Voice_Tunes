class UsersController < ApplicationController

    def create
        user = User.new(user_params)

        if user.save
            render json: user
        else
            render json: {messages: user.errors.full_messages}
        end
    end

    def index
        users = User.all
        render json: users
    end

    def destroy

        current_user.recordings.each do |r|
            r.midi_data.purge
            r.destroy
        end

        current_user.destroy
    end

    private

    def user_params
        params.require(:user).permit(:name)
    end

end
