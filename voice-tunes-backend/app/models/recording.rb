class Recording < ApplicationRecord
    belongs_to :user

    validates :name,
              presence: { message: "was not entered" }


end
