class ApplicationController < ActionController::API

    def validate_user
        if !current_user
            render json: {messages: ["User could not be found"]}
        end
    end

    def current_user
        User.find_by(id: params[:user_id])
    end

end
