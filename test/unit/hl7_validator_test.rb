# frozen_string_literal: true

require_relative '../test_helper'

describe FHIRValidator::HL7Validator do
  before do
    @validator_url = 'http://localhost:8080'
    @validator = FHIRValidator::HL7Validator.new
  end

  describe 'Validating a good resource' do
    it "Shouldn't pass back any messages" do
      patient = FHIR::Patient.new
      stub_request(:post, "#{@validator_url}/validate")
        .with(
          query: { profile: 'http://hl7.org/fhir/StructureDefinition/Patient' },
          body: patient.to_json
        )
        .to_return(status: 200, body: load_fixture('resources/validator_good_response.json'))
      result = @validator.validate(patient.to_json, FHIR)

      assert_empty result[:errors]
      assert_empty result[:warnings]
      assert_empty result[:information]
    end

    it 'Should not reject code-invalid issues' do
      patient = FHIR::Patient.new
      stub_request(:post, "#{@validator_url}/validate")
        .with(
          query: { profile: 'http://hl7.org/fhir/StructureDefinition/Patient' },
          body: patient.to_json
        )
        .to_return(status: 200, body: load_fixture('resources/validator_invalid_code_response.json'))
      result = @validator.validate(patient.to_json, FHIR)

      assert_equal 2, result[:errors].size
      assert_equal 1, result[:warnings].size
      assert_equal 1, result[:information].size
    end
  end

  describe 'Validating a bad resource' do
    it 'Should pass back an error message' do
      patient = FHIR::Patient.new(gender: 'robot')

      stub_request(:post, "#{@validator_url}/validate")
        .with(
          query: { profile: 'http://hl7.org/fhir/StructureDefinition/Patient' },
          body: patient.to_json
        )
        .to_return(status: 200, body: load_fixture('resources/validator_bad_response.json'))
      result = @validator.validate(patient.to_json, FHIR)

      assert_equal 2, result[:errors].size
      assert_equal 1, result[:warnings].size
      assert_equal 1, result[:information].size
    end
  end
end
