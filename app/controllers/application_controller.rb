class ApplicationController < ActionController::Base
  before_action :configure_permitted_parameters, if: :devise_controller?


  def configure_permitted_parameters
    added_attrs = [:email, :password, :current_password, :password_confirmation, :avatar]
    devise_parameter_sanitizer.permit :account_update, keys: added_attrs
  end
end
