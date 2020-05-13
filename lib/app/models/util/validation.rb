# frozen_string_literal: true

require 'json'

module FHIRValidator
  class ValidationUtil
    def self.get_resource(json, version)
      if version == :dstu2
        FHIR::DSTU2.from_contents(json)
      else
        FHIR.from_contents(json)
      end
    end

    # Cache the Argonaut IG definitions
    validation_packs = File.join('resources', '*', '*.json')

    def self.definitions
      DEFINITIONS
    end

    DEFINITIONS = {}
    RESOURCES = { dstu2: {}, stu3: {}, r4: {} }
    VALUESETS = {}

    VERSION_MAP = { '1.0.2' => :dstu2, '3.0.1' => :stu3, '4.0.0' => :r4, '4.0.1' => :r4 }.freeze

    Dir.glob(validation_packs).each do |definition|
      json = File.read(definition)
      version = VERSION_MAP[JSON.parse(json)['fhirVersion']]
      resource = get_resource(json, version)
      DEFINITIONS[resource.url] = resource
      if resource.resourceType == 'StructureDefinition'
        profiled_type = resource.snapshot.element.first.path # will this always be the first?
        RESOURCES[version][profiled_type] ||= []
        RESOURCES[version][profiled_type] << resource
      elsif resource.resourceType == 'ValueSet'
        VALUESETS[resource.url] = resource
      end
    end

    ARGONAUT_URIS = {
      smoking_status: 'http://fhir.org/guides/argonaut/StructureDefinition/argo-smokingstatus',
      observation_results: 'http://fhir.org/guides/argonaut/StructureDefinition/argo-observationresults',
      vital_signs: 'http://fhir.org/guides/argonaut/StructureDefinition/argo-vitalsigns',
      care_team: 'http://fhir.org/guides/argonaut/StructureDefinition/argo-careteam',
      care_plan: 'http://fhir.org/guides/argonaut/StructureDefinition/argo-careplan'
    }.freeze

    BLUEBUTTON_URIS = {
      carrier: 'https://bluebutton.cms.gov/assets/ig/StructureDefinition-bluebutton-carrier-claim',
      dme: 'https://bluebutton.cms.gov/assets/ig/StructureDefinition-bluebutton-dme-claim',
      hha: 'https://bluebutton.cms.gov/assets/ig/StructureDefinition-bluebutton-hha-claim',
      hospice: 'https://bluebutton.cms.gov/assets/ig/StructureDefinition-bluebutton-hospice-claim',
      inpatient: 'https://bluebutton.cms.gov/assets/ig/StructureDefinition-bluebutton-inpatient-claim',
      outpatient: 'https://bluebutton.cms.gov/assets/ig/StructureDefinition-bluebutton-outpatient-claim',
      pde: 'https://bluebutton.cms.gov/assets/ig/StructureDefinition-bluebutton-pde-claim',
      snf: 'https://bluebutton.cms.gov/assets/ig/StructureDefinition-bluebutton-snf-claim'
    }.freeze

    US_CORE_R4_URIS = {
      smoking_status: 'http://hl7.org/fhir/us/core/StructureDefinition/us-core-smokingstatus',
      diagnostic_report_lab: 'http://hl7.org/fhir/us/core/StructureDefinition/us-core-diagnosticreport-lab',
      diagnostic_report_note: 'http://hl7.org/fhir/us/core/StructureDefinition/us-core-diagnosticreport-note',
      lab_results: 'http://hl7.org/fhir/us/core/StructureDefinition/us-core-observation-lab',
      pediatric_bmi_age: 'http://hl7.org/fhir/us/core/StructureDefinition/pediatric-bmi-for-age',
      pediatric_weight_height: 'http://hl7.org/fhir/us/core/StructureDefinition/pediatric-weight-for-height',
      pulse_oximetry: 'http://hl7.org/fhir/us/core/StructureDefinition/us-core-pulse-oximetry',
      vitals_panel: 'http://hl7.org/fhir/StructureDefinition/vitalspanel',
      resp_rate: 'http://hl7.org/fhir/StructureDefinition/resprate',
      heart_rate: 'http://hl7.org/fhir/StructureDefinition/heartrate',
      oxygen_saturation: 'http://hl7.org/fhir/StructureDefinition/oxygensat',
      body_temperature: 'http://hl7.org/fhir/StructureDefinition/bodytemp',
      body_height: 'http://hl7.org/fhir/StructureDefinition/bodyheight',
      head_circumference: 'http://hl7.org/fhir/StructureDefinition/headcircum',
      body_weight: 'http://hl7.org/fhir/StructureDefinition/bodyweight',
      bmi: 'http://hl7.org/fhir/StructureDefinition/bmi',
      blood_pressure: 'http://hl7.org/fhir/StructureDefinition/bp'
    }.freeze

    SANER_STRUCTDEFS = [
      'http://hl7.org/fhir/us/saner/StructureDefinition/audit-event-read',
      'http://hl7.org/fhir/us/saner/StructureDefinition/audit-event-write',
      'http://hl7.org/fhir/us/saner/StructureDefinition/MeasureCriteria',
      'http://hl7.org/fhir/us/saner/StructureDefinition/MeasuredItemDescription',
      'http://hl7.org/fhir/us/saner/StructureDefinition/PreciseDateTime',
      'http://hl7.org/fhir/us/saner/StructureDefinition/PublicHealthMeasure',
      'http://hl7.org/fhir/us/saner/StructureDefinition/PublicHealthMeasureReport',
      'http://hl7.org/fhir/us/saner/StructureDefinition/PublicHealthMeasureStratifier',
      'http://hl7.org/fhir/us/saner/StructureDefinition/saner-resource-location',
      'http://hl7.org/fhir/us/saner/StructureDefinition/saner-supporting-device'
    ].freeze.sort

    US_CORE_310_STRUCTDEFS = ['http://hl7.org/fhir/us/core/StructureDefinition/us-core-ethnicity',
                              'http://hl7.org/fhir/us/core/StructureDefinition/pediatric-weight-for-height',
                              'http://hl7.org/fhir/us/core/StructureDefinition/us-core-practitionerrole',
                              'http://hl7.org/fhir/us/core/StructureDefinition/us-core-diagnosticreport-lab',
                              'http://hl7.org/fhir/us/core/StructureDefinition/us-core-allergyintolerance',
                              'http://hl7.org/fhir/us/core/StructureDefinition/us-core-race',
                              'http://hl7.org/fhir/us/core/StructureDefinition/us-core-provenance',
                              'http://hl7.org/fhir/us/core/StructureDefinition/us-core-careplan',
                              'http://hl7.org/fhir/us/core/StructureDefinition/us-core-birthsex',
                              'http://hl7.org/fhir/us/core/StructureDefinition/us-core-implantable-device',
                              'http://hl7.org/fhir/us/core/StructureDefinition/us-core-practitioner',
                              'http://hl7.org/fhir/us/core/StructureDefinition/us-core-pulse-oximetry',
                              'http://hl7.org/fhir/us/core/StructureDefinition/us-core-medicationrequest',
                              'http://hl7.org/fhir/us/core/StructureDefinition/pediatric-bmi-for-age',
                              'http://hl7.org/fhir/us/core/StructureDefinition/us-core-organization',
                              'http://hl7.org/fhir/us/core/StructureDefinition/us-core-careteam',
                              'http://hl7.org/fhir/us/core/StructureDefinition/us-core-encounter',
                              'http://hl7.org/fhir/us/core/StructureDefinition/us-core-direct',
                              'http://hl7.org/fhir/us/core/StructureDefinition/us-core-observation-lab',
                              'http://hl7.org/fhir/us/core/StructureDefinition/us-core-goal',
                              'http://hl7.org/fhir/us/core/StructureDefinition/us-core-immunization',
                              'http://hl7.org/fhir/us/core/StructureDefinition/us-core-patient',
                              'http://hl7.org/fhir/us/core/StructureDefinition/us-core-condition',
                              'http://hl7.org/fhir/us/core/StructureDefinition/us-core-smokingstatus',
                              'http://hl7.org/fhir/us/core/StructureDefinition/us-core-medication',
                              'http://hl7.org/fhir/us/core/StructureDefinition/us-core-location',
                              'http://hl7.org/fhir/us/core/StructureDefinition/us-core-documentreference',
                              'http://hl7.org/fhir/us/core/StructureDefinition/us-core-diagnosticreport-note',
                              'http://hl7.org/fhir/us/core/StructureDefinition/us-core-procedure'].freeze.sort

    def self.fhir_profiles
      fhir_profiles = FHIR::Definitions.send(:profiles).map { |p| p['url'] }
        .concat(FHIR::Definitions.send(:resources).map { |t| t['url'] })
        .sort

      {
        fhir: fhir_profiles,
        us_core: US_CORE_310_STRUCTDEFS,
        saner: SANER_STRUCTDEFS
      }
    end

    def self.guess_profile(resource, version)
      # if the profile is given, we don't need to guess
      if resource&.meta&.profile&.present?
        resource.meta.profile.each do |uri|
          return DEFINITIONS[uri] if DEFINITIONS[uri]
        end
      end

      if version == :dstu2
        guess_dstu2_profile(resource)
      elsif version == :stu3
        guess_stu3_profile(resource)
      elsif version == :r4
        guess_r4_profile(resource)
      end
    end

    def self.guess_dstu2_profile(resource)
      return if resource.blank?

      candidates = RESOURCES[:dstu2][resource.resourceType]
      return if candidates.blank?

      # Special cases where there are multiple profiles per Resource type
      if resource.resourceType == 'Observation'
        if resource&.code&.coding&.any? { |coding| coding&.code == '72166-2' }
          return DEFINITIONS[ARGONAUT_URIS[:smoking_status]]
        elsif resource&.category&.coding&.any? { |coding| coding&.code == 'laboratory' }
          return DEFINITIONS[ARGONAUT_URIS[:observation_results]]
        elsif resource&.category&.coding&.any? { |coding| coding&.code == 'vital-signs' }
          return DEFINITIONS[ARGONAUT_URIS[:vital_signs]]
        end
      elsif resource.resourceType == 'CarePlan'
        if resource&.category&.any? { |category| category&.coding&.any? { |coding| coding&.code == 'careteam' } }
          return DEFINITIONS[ARGONAUT_URIS[:care_team]]
        else
          return DEFINITIONS[ARGONAUT_URIS[:care_plan]]
        end
      end

      # Otherwise, guess the first profile that matches on resource type
      candidates.first
    end

    def self.guess_stu3_profile(resource)
      return if resource.blank?

      candidates = RESOURCES[:stu3][resource.resourceType]
      return if candidates.blank?

      # Special cases where there are multiple profiles per Resource type
      if resource.resourceType == 'ExplanationOfBenefit'
        if resource&.type&.coding&.any? { |coding| coding.code == 'CARRIER' }
          return DEFINITIONS[BLUEBUTTON_URIS[:carrier]]
        elsif resource&.type&.coding&.any? { |coding| coding.code == 'DME' }
          return DEFINITIONS[BLUEBUTTON_URIS[:dme]]
        elsif resource&.type&.coding&.any? { |coding| coding.code == 'HHA' }
          return DEFINITIONS[BLUEBUTTON_URIS[:hha]]
        elsif resource&.type&.coding&.any? { |coding| coding.code == 'HOSPICE' }
          return DEFINITIONS[BLUEBUTTON_URIS[:hospice]]
        elsif resource&.type&.coding&.any? { |coding| coding.code == 'INPATIENT' }
          return DEFINITIONS[BLUEBUTTON_URIS[:inpatient]]
        elsif resource&.type&.coding&.any? { |coding| coding.code == 'OUTPATIENT' }
          return DEFINITIONS[BLUEBUTTON_URIS[:outpatient]]
        elsif resource&.type&.coding&.any? { |coding| coding.code == 'PDE' }
          return DEFINITIONS[BLUEBUTTON_URIS[:pde]]
        elsif resource&.type&.coding&.any? { |coding| coding.code == 'SNF' }
          return DEFINITIONS[BLUEBUTTON_URIS[:snf]]
        end
      end

      # Otherwise, guess the first profile that matches on resource type
      candidates.first
    end

    def self.guess_r4_profile(resource)
      return if resource.blank?

      candidates = RESOURCES[:r4][resource.resourceType]
      return if candidates.blank?

      if resource.resourceType == 'Observation'
        if observation_contains_code(resource, '72166-2')
          return DEFINITIONS[US_CORE_R4_URIS[:smoking_status]]
        end

        if resource&.category&.first&.coding&.any? { |coding| coding&.code == 'laboratory' }
          return DEFINITIONS[US_CORE_R4_URIS[:lab_results]]
        end

        if observation_contains_code(resource, '59576-9')
          return DEFINITIONS[US_CORE_R4_URIS[:pediatric_bmi_age]]
        end

        if observation_contains_code(resource, '77606-2')
          return DEFINITIONS[US_CORE_R4_URIS[:pediatric_weight_height]]
        end

        if observation_contains_code(resource, '59408-5')
          return DEFINITIONS[US_CORE_R4_URIS[:pulse_oximetry]]
        end

        if observation_contains_code(resource, '85353-1')
          return DEFINITIONS[US_CORE_R4_URIS[:vitals_panel]]
        end

        if observation_contains_code(resource, '9279-1')
          return DEFINITIONS[US_CORE_R4_URIS[:resp_rate]]
        end

        if observation_contains_code(resource, '8867-4')
          return DEFINITIONS[US_CORE_R4_URIS[:heart_rate]]
        end

        if observation_contains_code(resource, '8310-5')
          return DEFINITIONS[US_CORE_R4_URIS[:body_temperature]]
        end
      elsif resource.resourceType == 'DiagnosticReport'
        if resource&.category&.first&.coding&.any? { |coding| coding&.code == 'LAB' }
          return DEFINITIONS[US_CORE_R4_URIS[:diagnostic_report_lab]]
        end

        return DEFINITIONS[US_CORE_R4_URIS[:diagnostic_report_note]]
      end

      candidates.first
    end

    def self.observation_contains_code(observation_resource, code)
      observation_resource&.code&.coding&.any? { |coding| coding&.code == code }
    end
  end
end
