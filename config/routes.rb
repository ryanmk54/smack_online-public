Rails.application.routes.draw do
  root 'projects#new'
  resources(:projects, except: [:index, :destroy]) do
    member do
      post 'receive_service_output'
    end
  end
  # For details on the DSL available within this file, see http://guides.rubyonrails.org/routing.html
end
