# frozen_string_literal: true

ENV['RACK_ENV'] = 'test'
require 'minitest/autorun'
require 'rack/test'

require_relative '../lib/app'

def load_fixture(file)
  root = File.dirname(File.absolute_path(__FILE__))
  File.read(File.join(root, 'fixtures', file))
end
