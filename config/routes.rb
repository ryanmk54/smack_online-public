Rails.application.routes.draw do
  devise_for :users
  # root is the homepage
  # root is the page devise goes to after logging in
  root 'projects#new'

  get 'analytics/usage', to: 'analytics#usage'
  get 'community/home', to: 'community#home'

  get 'profile', to: 'profiles#show'

  get 'analytics/project_location_csv'
  get 'analytics/project_runtimes'

  resources(:projects, except: [:index, :destroy]) do
    member do
      post 'receive_service_output', to: 'projects#receive_service_output'
    end
  end
  # For details on the DSL available within this file, see http://guides.rubyonrails.org/routing.html
end
