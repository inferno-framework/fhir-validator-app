# frozen_string_literal: true

require 'active_support/all'
require 'sinatra'
require 'byebug'
require 'json'
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

    get '/profiles' do
      content_type :json
      GrahameValidator.profiles_by_ig.to_json
    end

    post '/validate' do
      resource_file = params.dig(:resource, :tempfile)
      resource_blob = params[:resource_field]
      if params[:implementation_guide] == 'us_core'
        profile_url = "http://hl7.org/fhir/us/core/StructureDefinition/#{params[:profile]}"
      end

      resource = if resource_file
                   File.read(resource_file)
                 else
                   resource_blob
                 end

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
