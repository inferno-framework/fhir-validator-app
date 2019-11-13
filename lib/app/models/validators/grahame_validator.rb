# frozen_string_literal: true

require 'rest-client'
require 'json'

module FHIRValidator
  # A validator that calls out to Grahame's validator API
  class GrahameValidator < BaseValidator
    VALIDATOR_URL = 'http://localhost:8080'
    @profile_urls = nil
    @profile_names = nil
    @profiles_by_ig = nil

    def validate(resource, profile)
      result = RestClient.post "#{VALIDATOR_URL}/validate", resource, params: { profile: profile }
      outcome = FHIR.from_contents(result.body)
      @fatals = issues_by_severity(outcome.issue, 'fatal')
      @errors = issues_by_severity(outcome.issue, 'error')
      @warnings = issues_by_severity(outcome.issue, 'warning')
      @informations = issues_by_severity(outcome.issue, 'information')
    end

    def issues_by_severity(issues, severity)
      issues.select { |i| i.severity == severity }
        .map { |iss| "#{iss&.expression&.join(', ')}: #{iss&.details&.text}" }
    end

    def self.profile_urls
      @profile_urls ||= JSON.parse(RestClient.get("#{VALIDATOR_URL}/profiles"))
    end

    def self.profile_names
      @profile_names ||= profile_urls.map { |url| url.split('/').last }
    end

    def self.profiles_by_ig
      @profiles_by_ig ||= profile_urls.group_by do |url|
        # byebug
      end
    end
  end
end
