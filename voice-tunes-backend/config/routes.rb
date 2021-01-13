Rails.application.routes.draw do
  
  resources :users, only: [:index, :create, :destroy]  do
    resources :recordings
  end

end
