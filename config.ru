# frozen_string_literal: true

#\ -s Thin -p 4567 -q
require_relative './lib/app'

run FHIRValidator::App
