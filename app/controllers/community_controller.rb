class CommunityController < ApplicationController

	helper_method :get_top_projects

	def get_top_projects
		$projects = Project.order(:created_at).reverse_order.first(10)
	end

end
