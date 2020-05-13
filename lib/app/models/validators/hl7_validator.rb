# frozen_string_literal: true

require_relative '../util/issue.rb'
require 'rest-client'

module FHIRValidator
  # A validator that calls out to the HL7 validator API
  class HL7Validator
    DEFAULT_EXTERNAL_VALIDATOR_URL = 'http://localhost:8080'
    @profile_urls = nil
    @profile_names = nil
    @profiles_by_ig = nil

    def validate(resource_blob, resource_type, fhir_models_klass, profile_url = nil)
      resource = fhir_models_klass.from_contents(resource_blob)
      profile_url ||= fhir_models_klass::Definitions.resource_definition(resource.resourceType).url

      FHIRValidator.logger.info("Validating #{resource.resourceType} resource with id #{resource.id}")
      FHIRValidator.logger.info("POST #{@validator_url}/validate?profile=#{profile_url}")

      result = RestClient.post "#{HL7Validator.external_validator_url}/validate", resource_blob, params: { profile: profile_url }
      outcome = fhir_models_klass.from_contents(result.body)
      fatals = issues_by_severity(outcome.issue, 'fatal')
      errors = issues_by_severity(outcome.issue, 'error')
      warnings = issues_by_severity(outcome.issue, 'warning')
      information = issues_by_severity(outcome.issue, 'information')
      {
        errors: fatals.concat(errors),
        warnings: warnings,
        information: information
      }
    end

    def add_profile(profile)
      RestClient.post "#{HL7Validator.external_validator_url}/profile", profile
      FHIR.from_contents(profile).url
    end

    private

    def issues_by_severity(issues, severity)
      issues # .reject { |i| i.code == 'code-invalid' } temporarily enable code validation
        .select { |i| i.severity == severity }
        .map { |iss| Issue.new(line: issue_line(iss), text: "#{issue_location(iss)}: #{iss&.details&.text}") }
    end

    def issue_location(issue)
      if issue.respond_to?(:expression)
        issue&.expression&.join(', ')
      else
        issue&.location&.join(', ')
      end
    end

    def issue_line(issue)
      # The HL7 Validator returns issue lines indexed from 0 rather than 1
      issue
        &.extension
        &.find { |e| e.url == 'http://hl7.org/fhir/StructureDefinition/operationoutcome-issue-line' }
        &.valueInteger
    end

    def self.profile_urls
      @profile_urls ||= JSON.parse(RestClient.get("#{external_validator_url}/profiles"))
    end

    def self.profile_names
      @profile_names ||= profile_urls.map { |url| url.split('/').last }
    end

    def self.profile_url_by_name(name)
      profile_urls.detect { |url| url.include? name }
    end

    def self.external_validator_url
      ENV['external_validator_url'] || DEFAULT_EXTERNAL_VALIDATOR_URL
    end
  end
end
