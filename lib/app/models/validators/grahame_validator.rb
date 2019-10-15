# frozen_string_literal: true

require 'rest-client'

module FHIRValidator
  # A validator that calls out to Grahame's validator API
  class GrahameValidator < BaseValidator
    VALIDATOR_URL = 'http://localhost:8080/validate'

    def validate(resource, profile)
      result = RestClient.post VALIDATOR_URL, resource, params: { profile: profile }
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
  end
end
