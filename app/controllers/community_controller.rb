class CommunityController < ApplicationController

	helper_method :get_top_projects
	helper_method :get_top_users

	def get_top_projects
		$projects = Project.order(:created_at).reverse_order.first(10)
	end

	def get_top_users
		$users = User.order(:sign_in_count).reverse_order.first(10)
	end


end
