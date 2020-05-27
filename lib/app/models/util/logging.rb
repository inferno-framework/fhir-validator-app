# frozen_string_literal: true

# This mixin adds logging to the FHIRValidator module, so it's globally available
module FHIRValidator
  # Returns the Inferno Logger
  #
  # @return the logger object
  def self.logger
    @logger || default_logger
  end

  # Allows setting the logger object
  #
  # A virtual attribute assignment method
  #
  # @return the logger object
  def self.logger=(logger)
    @logger = logger
  end

  # Creates a default logger which outputs to STDOUT
  #
  # @return the default logger
  def self.default_logger
    @default_logger ||= FHIRValidator::Logger.new(STDOUT)
  end
end
