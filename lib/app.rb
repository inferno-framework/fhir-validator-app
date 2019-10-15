# frozen_string_literal: true

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
      profile_file = params.dig(:implementation_guide, :tempfile)

      resource = File.read(resource_file) if resource_file
      profile = File.read(profile_file) if profile_file

      @validator = FHIRModelsValidator.new(params[:fhirVersion].downcase)

      @validator.validate(resource, profile)

      erb :validate
    end
  end
end
