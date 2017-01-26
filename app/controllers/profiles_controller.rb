class ProfilesController < ApplicationController

  # GET /profiles/show
  def show
    @user = User.find(current_user.id)
    render :show
  end


end