# frozen_string_literal: true

require 'rake/testtask'

task :default do
  ENV['RACK_ENV'] = 'test'
  Rake::Task['test'].invoke
end

Rake::TestTask.new(:test) do |t|
  t.libs << 'test'
  t.pattern = 'test/**/*_test.rb'
  t.verbose = true
  t.warning = false
end

task default: %i[test]
