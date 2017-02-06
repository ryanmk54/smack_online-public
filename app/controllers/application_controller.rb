class ApplicationController < ActionController::Base
  before_action :configure_permitted_parameters, if: :devise_controller?


  def configure_permitted_parameters
    update_attrs = [:email, :password, :current_password, :password_confirmation, :avatar, :username]
    sign_up_attrs = [:email, :password, :username, :password_confirmation, :avatar]
    devise_parameter_sanitizer.permit :account_update, keys: update_attrs
    devise_parameter_sanitizer.permit :sign_up, keys: sign_up_attrs
  end
end
