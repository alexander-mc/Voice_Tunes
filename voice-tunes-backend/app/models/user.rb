class User < ApplicationRecord
    has_many :recordings

    validates :name,
              presence: { message: "was not entered" },
              format: { with: /\A[a-zA-Z]*\z/, message: "can only contain letters." },
              uniqueness: { case_sensitive: false, message: "is already taken" }

end
