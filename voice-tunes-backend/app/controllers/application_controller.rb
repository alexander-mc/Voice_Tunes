class ApplicationController < ActionController::API

    def is_valid_user
        if !current_user
            render json: {messages: ["User could not be found"]}
        end

        return true
    end

    def current_user
        User.find_by(id: params[:user_id])
    end

end
