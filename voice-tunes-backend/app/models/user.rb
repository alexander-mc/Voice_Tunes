class User < ApplicationRecord
    has_many :recordings

    validates :name,
              presence: { message: "was not entered" },
              format: { with: /\A[a-zA-Z]*\z/, message: "can only contain letters." },
              uniqueness: { case_sensitive: false, message: "is already taken" }

    # def self.find_or_create_by_name(name)
    #     user = User.find_by(name: name)
    #     if user.present?
    #         user.new_user = false
    #         user.save
    #         user
    #     else
    #         User.create(name: name)
    #     end
    # end

end
