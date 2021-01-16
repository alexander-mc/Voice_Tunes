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
        User.find(params[:id]).destroy
    end

    private

    def user_params
        params.require(:user).permit(:name)
    end

end
