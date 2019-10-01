# frozen_string_literal: true

require 'sinatra'

module FHIRValidator
  class App < Sinatra::Application
    set :views, settings.root + '/app/views'
    get '/' do
      erb :index
    end
  end
end
