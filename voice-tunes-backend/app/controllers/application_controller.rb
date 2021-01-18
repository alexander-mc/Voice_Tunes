class ApplicationController < ActionController::API

    def validate_user       
        if !User.find_by(id: params[:recording][:user_id])
            render json: {messages: ["User could not be found"]}
        end
    end

end
