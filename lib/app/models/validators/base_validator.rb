# frozen_string_literal: true

module FHIRValidator
  # A base/abstract class for defining validator functionality.
  # This way we can eventually add multiple validators and let the user choose.
  class BaseValidator
    attr_accessor :version, :errors, :warnings, :fatals, :informations

    def initialize
    end

    def validate(resource, profile); end
  end
end
