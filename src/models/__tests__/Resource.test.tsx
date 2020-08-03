import * as R from '../Resource';

const parser = new DOMParser();

const badInput0 = {};
const badInput1 = 'foo';
const badInput2 = null as unknown;
const badInput3 = { resourceType: true };
const badInput4 = parser.parseFromString('', 'text/xml');
const badInput5 = parser.parseFromString('<Patient></Patient>', 'text/xml');
const badInput6 = parser.parseFromString('<Patient xmlns="foo"></Patient>', 'text/xml');

const input0 = { resourceType: 'Patient' };
const input1 = { resourceType: 'StructureDefinition' };
const input2 = { resourceType: 'StructureDefinition', url: 'http://thebomb.com' };
const input3 = { resourceType: 'OperationOutcome' };
const input4 = { resourceType: 'OperationOutcome', issue: [] as R.Issue[] };
const input5 = { resourceType: 'OperationOutcome', url: 'http://website.com' };

const input10 = parser.parseFromString(
  '<Patient xmlns="http://hl7.org/fhir"></Patient>',
  'text/xml'
);
const input11 = parser.parseFromString(
  '<StructureDefinition xmlns="http://hl7.org/fhir"></StructureDefinition>',
  'text/xml'
);
const input12 = parser.parseFromString(
  '<StructureDefinition xmlns="http://hl7.org/fhir"><url value="http://thebomb.com"/></StructureDefinition>',
  'text/xml'
);
const input13 = parser.parseFromString(
  '<OperationOutcome xmlns="http://hl7.org/fhir"></OperationOutcome>',
  'text/xml'
);
const input14 = parser.parseFromString(
  `
  <OperationOutcome xmlns="http://hl7.org/fhir">
    <issue>
      <severity value="error"/>
      <code value="code-invalid"/>
    </issue>
  </OperationOutcome>
`,
  'text/xml'
);
const input15 = parser.parseFromString(
  '<OperationOutcome xmlns="http://hl7.org/fhir"><url value="http://website.com"/></OperationOutcome>',
  'text/xml'
);

describe('isJsonResource', () => {
  it('correctly determines if the input is a JSONResource', () => {
    expect(R.isJsonResource(badInput0)).toBe(false);
    expect(R.isJsonResource(badInput1)).toBe(false);
    expect(R.isJsonResource(badInput2)).toBe(false);
    expect(R.isJsonResource(badInput3)).toBe(false);
    expect(R.isJsonResource(badInput4)).toBe(false);
    expect(R.isJsonResource(badInput5)).toBe(false);
    expect(R.isJsonResource(badInput6)).toBe(false);

    expect(R.isJsonResource(input0)).toBe(true);
    expect(R.isJsonResource(input1)).toBe(true);
    expect(R.isJsonResource(input2)).toBe(true);
    expect(R.isJsonResource(input3)).toBe(true);
    expect(R.isJsonResource(input4)).toBe(true);
    expect(R.isJsonResource(input5)).toBe(true);

    expect(R.isJsonResource(input10)).toBe(false);
    expect(R.isJsonResource(input11)).toBe(false);
    expect(R.isJsonResource(input12)).toBe(false);
    expect(R.isJsonResource(input13)).toBe(false);
    expect(R.isJsonResource(input14)).toBe(false);
    expect(R.isJsonResource(input15)).toBe(false);
  });

  it('additionally takes an optional "type" and determines if the given type matches the resourceType', () => {
    // badInputs are not valid JSONResources
    expect(R.isJsonResource(badInput0, 'Patient')).toBe(false);
    expect(R.isJsonResource(badInput1, 'Patient')).toBe(false);
    expect(R.isJsonResource(badInput2, 'StructureDefinition')).toBe(false);
    expect(R.isJsonResource(badInput3, 'StructureDefinition')).toBe(false);
    expect(R.isJsonResource(badInput4, 'OperationOutcome')).toBe(false);
    expect(R.isJsonResource(badInput5, 'OperationOutcome')).toBe(false);
    expect(R.isJsonResource(badInput6, 'OperationOutcome')).toBe(false);

    // only input0 is a valid Patient JSONResource
    expect(R.isJsonResource(input0, 'Patient')).toBe(true);
    expect(R.isJsonResource(input1, 'Patient')).toBe(false);
    expect(R.isJsonResource(input2, 'Patient')).toBe(false);
    expect(R.isJsonResource(input3, 'Patient')).toBe(false);
    expect(R.isJsonResource(input4, 'Patient')).toBe(false);
    expect(R.isJsonResource(input5, 'Patient')).toBe(false);

    // only input2 is a valid StructureDefinition JSONResource
    expect(R.isJsonResource(input0, 'StructureDefinition')).toBe(false);
    expect(R.isJsonResource(input1, 'StructureDefinition')).toBe(false);
    expect(R.isJsonResource(input2, 'StructureDefinition')).toBe(true);
    expect(R.isJsonResource(input3, 'StructureDefinition')).toBe(false);
    expect(R.isJsonResource(input4, 'StructureDefinition')).toBe(false);
    expect(R.isJsonResource(input5, 'StructureDefinition')).toBe(false);

    // only input4 is a valid OperationOutcome JSONResource
    expect(R.isJsonResource(input0, 'OperationOutcome')).toBe(false);
    expect(R.isJsonResource(input1, 'OperationOutcome')).toBe(false);
    expect(R.isJsonResource(input2, 'OperationOutcome')).toBe(false);
    expect(R.isJsonResource(input3, 'OperationOutcome')).toBe(false);
    expect(R.isJsonResource(input4, 'OperationOutcome')).toBe(true);
    expect(R.isJsonResource(input5, 'OperationOutcome')).toBe(false);

    // none are valid MedicationRequest JSONResources
    expect(R.isJsonResource(input0, 'MedicationRequest')).toBe(false);
    expect(R.isJsonResource(input1, 'MedicationRequest')).toBe(false);
    expect(R.isJsonResource(input2, 'MedicationRequest')).toBe(false);
    expect(R.isJsonResource(input3, 'MedicationRequest')).toBe(false);
    expect(R.isJsonResource(input4, 'MedicationRequest')).toBe(false);
    expect(R.isJsonResource(input5, 'MedicationRequest')).toBe(false);

    // XMLResources are not JSONResources
    expect(R.isJsonResource(input10, 'Patient')).toBe(false);
    expect(R.isJsonResource(input12, 'StructureDefinition')).toBe(false);
    expect(R.isJsonResource(input14, 'OperationOutcome')).toBe(false);
  });
});

describe('isXmlResource', () => {
  it('correctly determines if the input is a XMLResource', () => {
    expect(R.isXmlResource(badInput0)).toBe(false);
    expect(R.isXmlResource(badInput1)).toBe(false);
    expect(R.isXmlResource(badInput2)).toBe(false);
    expect(R.isXmlResource(badInput3)).toBe(false);
    expect(R.isXmlResource(badInput4)).toBe(false);
    expect(R.isXmlResource(badInput5)).toBe(false);
    expect(R.isXmlResource(badInput6)).toBe(false);

    expect(R.isXmlResource(input0)).toBe(false);
    expect(R.isXmlResource(input1)).toBe(false);
    expect(R.isXmlResource(input2)).toBe(false);
    expect(R.isXmlResource(input3)).toBe(false);
    expect(R.isXmlResource(input4)).toBe(false);
    expect(R.isXmlResource(input5)).toBe(false);

    expect(R.isXmlResource(input10)).toBe(true);
    expect(R.isXmlResource(input11)).toBe(true);
    expect(R.isXmlResource(input12)).toBe(true);
    expect(R.isXmlResource(input13)).toBe(true);
    expect(R.isXmlResource(input14)).toBe(true);
    expect(R.isXmlResource(input15)).toBe(true);
  });

  it('additionally takes an optional "type" and determines if the given type matches the XMLResource\'s type', () => {
    // badInputs are not valid XMLResources
    expect(R.isXmlResource(badInput0, 'Patient')).toBe(false);
    expect(R.isXmlResource(badInput1, 'Patient')).toBe(false);
    expect(R.isXmlResource(badInput2, 'StructureDefinition')).toBe(false);
    expect(R.isXmlResource(badInput3, 'StructureDefinition')).toBe(false);
    expect(R.isXmlResource(badInput4, 'OperationOutcome')).toBe(false);
    expect(R.isXmlResource(badInput5, 'OperationOutcome')).toBe(false);
    expect(R.isXmlResource(badInput6, 'OperationOutcome')).toBe(false);

    // only input10 is a valid Patient XMLResource
    expect(R.isXmlResource(input10, 'Patient')).toBe(true);
    expect(R.isXmlResource(input11, 'Patient')).toBe(false);
    expect(R.isXmlResource(input12, 'Patient')).toBe(false);
    expect(R.isXmlResource(input13, 'Patient')).toBe(false);
    expect(R.isXmlResource(input14, 'Patient')).toBe(false);
    expect(R.isXmlResource(input15, 'Patient')).toBe(false);

    // only input12 is a valid StructureDefinition XMLResource
    expect(R.isXmlResource(input10, 'StructureDefinition')).toBe(false);
    expect(R.isXmlResource(input11, 'StructureDefinition')).toBe(false);
    expect(R.isXmlResource(input12, 'StructureDefinition')).toBe(true);
    expect(R.isXmlResource(input13, 'StructureDefinition')).toBe(false);
    expect(R.isXmlResource(input14, 'StructureDefinition')).toBe(false);
    expect(R.isXmlResource(input15, 'StructureDefinition')).toBe(false);

    // only input14 is a valid OperationOutcome XMLResource
    expect(R.isXmlResource(input10, 'OperationOutcome')).toBe(false);
    expect(R.isXmlResource(input11, 'OperationOutcome')).toBe(false);
    expect(R.isXmlResource(input12, 'OperationOutcome')).toBe(false);
    expect(R.isXmlResource(input13, 'OperationOutcome')).toBe(false);
    expect(R.isXmlResource(input14, 'OperationOutcome')).toBe(true);
    expect(R.isXmlResource(input15, 'OperationOutcome')).toBe(false);

    // none are valid MedicationRequest XMLResources
    expect(R.isXmlResource(input10, 'MedicationRequest')).toBe(false);
    expect(R.isXmlResource(input11, 'MedicationRequest')).toBe(false);
    expect(R.isXmlResource(input12, 'MedicationRequest')).toBe(false);
    expect(R.isXmlResource(input13, 'MedicationRequest')).toBe(false);
    expect(R.isXmlResource(input14, 'MedicationRequest')).toBe(false);
    expect(R.isXmlResource(input15, 'MedicationRequest')).toBe(false);

    // JSONResources are not XMLResources
    expect(R.isXmlResource(input0, 'Patient')).toBe(false);
    expect(R.isXmlResource(input2, 'StructureDefinition')).toBe(false);
    expect(R.isXmlResource(input4, 'OperationOutcome')).toBe(false);
  });
});

describe('parseResource', () => {
  it('throws an error for invalid JSON/XML', () => {
    const invalidJsonXml = /invalid.*(JSON.*XML|XML.*JSON)/i;

    expect(() => R.parseResource('{')).toThrow(invalidJsonXml);
    expect(() => R.parseResource("{ 'singleQuotes': true }")).toThrow(invalidJsonXml);
    expect(() => R.parseResource('{ "trailingComma": true, }')).toThrow(invalidJsonXml);
    expect(() => R.parseResource('{ "validJson": true }')).not.toThrow(invalidJsonXml);
    expect(() => R.parseResource('{ "resourceType": "Patient" }')).not.toThrow(invalidJsonXml);

    expect(() => R.parseResource('>')).toThrow(invalidJsonXml);
    expect(() => R.parseResource('</NoStartTag>')).toThrow(invalidJsonXml);
    expect(() =>
      R.parseResource('<MisplacedAttribute></MisplacedAttribute xmlns="hello">')
    ).toThrow(invalidJsonXml);
    expect(() => R.parseResource('<ValidXML></ValidXML>')).not.toThrow(invalidJsonXml);
    expect(() =>
      R.parseResource('<Observation xmlns="http://hl7.org/fhir"></Observation>')
    ).not.toThrow(invalidJsonXml);
  });

  it('detects missing/incorrect properties for FHIR resources', () => {
    const missingResourceType = /missing.*resourceType/i;
    expect(() => R.parseResource('{ "validJson": true }')).toThrow(missingResourceType);
    expect(() => R.parseResource('{ "resourceType": "Patient", "validJson": true }')).not.toThrow(
      missingResourceType
    );

    const missingXmlns = /missing.*xmlns/i;
    expect(() => R.parseResource('<Patient></Patient>')).toThrow(missingXmlns);
    expect(() => R.parseResource('<Patient xmlns="foo"></Patient>')).toThrow(missingXmlns);
    expect(() => R.parseResource('<Patient xmlns="http://hl7.org/fhir"></Patient>')).not.toThrow(
      missingXmlns
    );
  });
});
