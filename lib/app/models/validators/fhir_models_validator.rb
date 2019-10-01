# frozen_string_literal: true

require 'fhir_models'
require 'fhir_stu3_models'
require 'fhir_dstu2_models'

module FHIRValidator
  # FHIRModelsValidator extends BaseValidator to use the validation in fhir_models.
  # It passes the validation off to the correct model version.
  class FHIRModelsValidator < BaseValidator
    def validate(resource, profile)
      model_klass = case @version
                    when 'dstu2'
                      FHIR::DSTU2
                    when 'stu3'
                      FHIR::STU3
                    when 'r4'
                      FHIR
                    end

      run_validation(resource, profile, model_klass)
    end

    private

    def run_validation(resource, profile, model_klass)
      begin
        parsed_resource = model_klass.from_contents(resource)
      rescue StandardError => e
        raise ArgumentError, e.message
      end
      raise ArgumentError, 'No resource provided' unless parsed_resource

      @errors = if profile
                  parsed_profile = model_klass.from_contents(profile)
                  parsed_profile.validate_resource(parsed_resource)
                else
                  parsed_resource.validate
                end
    end
  end
end
