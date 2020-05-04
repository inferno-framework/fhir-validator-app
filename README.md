This app is a stand-alone [FHIR](http://fhir.hl7.org/) resource validator. Using this app, you can validate a FHIR resource against an optional FHIR Profile.

## Running the FHIR Validator App in Docker
* Build the image, using `docker build . -t fhir_validator_app`
* Run the container, using `docker run -p 8080:4567 -e external_validator_url=<URL to external validator> fhir_validator_app`
* Visit the site at `http://localhost:8080`

## Running the FHIR Validator App using Docker Compose
* Build the image, using `docker-compose build`
* Run the compose file, using `docker-compose up`. This will run both the standalone validator app, as well as the [fhir-validator-wrapper](https://github.com/inferno-community/fhir-validator-wrapper) Docker container required to do exterrnal validation.

## Contact Us
The Inferno development team can be reached by email at
inferno@groups.mitre.org.  Inferno also has a dedicated [HL7 FHIR chat
channel](https://chat.fhir.org/#narrow/stream/153-inferno).

## License

Copyright 2020 The MITRE Corporation

Licensed under the Apache License, Version 2.0 (the "License"); you may not use
this file except in compliance with the License. You may obtain a copy of the
License at
```
http://www.apache.org/licenses/LICENSE-2.0
```
Unless required by applicable law or agreed to in writing, software distributed
under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR
CONDITIONS OF ANY KIND, either express or implied. See the License for the
specific language governing permissions and limitations under the License.
