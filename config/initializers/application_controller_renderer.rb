# Be sure to restart your server when you modify this file.

# ApplicationController.renderer.defaults.merge!(
#   http_host: 'example.org',
#   https: false
# )

ENV["PORT"] = Rails::Server.new.options[:Port].to_s
