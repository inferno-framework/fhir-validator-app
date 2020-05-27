# frozen_string_literal: true

ENV['RACK_ENV'] = 'test'
require 'minitest/autorun'
require 'webmock/minitest'
require 'rack/test'

require_relative '../lib/app'

l = ::Logger.new(STDOUT, level: 'warn', progname: 'Inferno')
l.formatter = proc do |severity, _datetime, progname, msg|
  "#{severity} | #{progname} | #{msg}\n"
end
FHIRValidator.logger = l

def load_fixture(file)
  root = File.dirname(File.absolute_path(__FILE__))
  File.read(File.join(root, 'fixtures', file))
end
