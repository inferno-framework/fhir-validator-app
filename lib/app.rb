# frozen_string_literal: true

require 'active_support/all'
require 'sinatra'
require 'byebug'
Dir[File.join(__dir__, 'app', 'models', 'validators', '*.rb')].each { |file| require file }
Dir[File.join(__dir__, 'app', 'models', 'util', '*.rb')].each { |file| require file }

module FHIRValidator
  # Top-level Sinatra app for the FHIR Validator webapp
  class App < Sinatra::Application
    set :views, settings.root + '/app/views'
    set :public_folder, (proc { File.join(settings.root, '..', 'public') })
    set :static, true

    get '/' do
      erb :index
    end

    post '/validate' do
      resource_file = params.dig(:resource, :tempfile)
      profile_url = params[:profile]

      resource = File.read(resource_file) if resource_file

      @validator = case params[:validator]
      when 'hl7'
        GrahameValidator.new
      when 'inferno'
        FHIRModelsValidator.new
      end

      @validator.validate(resource, profile_url)

      erb :validate
    end
  end
end
