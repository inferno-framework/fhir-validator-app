# frozen_string_literal: true

require_relative '../../test_helper'
require_relative '../../../lib/app/models/validators/base_validator'
require_relative '../../../lib/app/models/validators/fhir_models_validator'

FHIRModelsValidator = FHIRValidator::FHIRModelsValidator

describe FHIRModelsValidator do
  before do
    @validator = FHIRModelsValidator.new('r4')
  end

  describe '.initialize' do
    it 'creates a new object if given a version' do
      assert @validator.instance_of? FHIRModelsValidator
    end
  end

  describe '#validate' do
    it 'Raises an Exception if no resource is passed in' do
      assert_raises(ArgumentError) { @validator.validate(nil, nil) }
    end

    describe 'a valid XML resource' do
      before do
        @resource = load_fixture(File.join('resources', 'Patient-example-good.xml'))
      end

      it 'Validates without errors against the base spec' do
        @validator.validate(@resource, nil)
        assert_empty @validator.errors
      end

      it 'Validates without errors against a valid XML profile' do
        profile = load_fixture(File.join('profiles', 'us-core-patient.xml'))

        @validator.validate(@resource, profile)
        assert_empty @validator.errors
      end

      it 'Validates but has errors against the wrong JSON profile' do
        profile = load_fixture(File.join('profiles', 'us-core-observationresults.json'))

        @validator.validate(@resource, profile)
        assert_equal 4, @validator.errors.size
      end
    end
  end
end
