class ProfilesController < ApplicationController

  # GET /users/#
  def show
    @user = User.where(id: params[:id])
    puts params[:id]
    puts @user.name
    render :show
  end


end