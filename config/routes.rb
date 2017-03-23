Rails.application.routes.draw do
  devise_for :users
  # root is the homepage
  # root is the page devise goes to after logging in
  root 'projects#new'

  get 'analytics/usage', to: 'analytics#usage'
  get 'community/home', to: 'community#home'
  get 'profile', to: 'profiles#show'
  get 'profile/:id', to: 'profiles#show'
  get 'profile/projects', to: 'profiles#load_project_previews'
  get 'analytics/project_location_csv'
  get 'analytics/project_runtimes'
  get 'analytics/users_created'
  get 'users/projects', to: 'users#projects'

  get 'users/projects/:id', to: 'users#projects'
  get 'users/followers', to: 'users#followers'
  get 'users/following', to: 'users#followees'
  get '/users/newProject', to: 'users#newProjectButton'

  get 'users/index', to: 'users#index'
  get 'users/searchbar', to: 'users#searchbar'
  post 'users/search', to: 'users#search'
  post 'users/follow', to: 'users#follow'
  post 'users/unfollow', to: 'users#unfollow'

  resources(:projects,  except: [:index]) do
    member do
      post 'receive_service_output', to: 'projects#receive_service_output'
      get 'fork', to: 'projects#fork'
    end
  end
  # For details on the DSL available within this file, see http://guides.rubyonrails.org/routing.html
end
