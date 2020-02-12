# frozen_string_literal: true

require 'active_support/all'
require 'sinatra'
require 'sinatra/namespace'
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

    # This class method gets used here in the route namespacing
    def self.base_path
      if ENV['validator_base_path']
        "/#{ENV['validator_base_path']}"
      else
        ""
      end
    end

    helpers do
      # This helper is used in templates to get the base path, for building URL paths
      def base_path
        App.base_path
      end
    end

    namespace "#{base_path}" do
      get '/?' do
        erb :index
      end

      # Returns the static files associated with web app
      get '/static/*' do
        call! env.merge('PATH_INFO' => '/' + params['splat'].first)
      end

      get '/profiles' do
        content_type :json
        GrahameValidator.profiles_by_ig.to_json
      end

      post '/validate' do
        # if params[:implementation_guide] == 'us_core'
        #   profile_url = "http://hl7.org/fhir/us/core/StructureDefinition/#{params[:profile]}"
        # end

        resource = get_resource(params)

        # NOTE: We've disabled the FHIRModelsValidator (and the radio button) for the time being
        # @validator = case params[:validator]
        #              when 'hl7'
        #                GrahameValidator.new
        #              when 'inferno'
        #                FHIRModelsValidator.new
        #              end
        @validator = GrahameValidator.new

        if params[:profile]
          @profile_url = GrahameValidator.profile_url_by_name(params[:profile])
        else
          profile = get_profile(params)
          @profile_url = @validator.add_profile(profile)
        end

        @validator.validate(resource, @profile_url)

        erb :validate
      end
    end

    private

    def get_resource(params)
      resource_file = params.dig(:resource, :tempfile)
      resource_blob = params[:resource_field]
      if resource_file
        File.read(resource_file)
      else
        resource_blob
      end
    end

    def get_profile(params)
      profile_file = params.dig(:profile_file, :tempfile)
      profile_blob = params[:profile_field]
      if profile_file
        File.read(profile_file)
      else
        profile_blob
      end
    end
  end
end
