This app is a stand-alone [FHIR](http://fhir.hl7.org/) resource validator. Using this app, you can validate a FHIR resource against an optional FHIR Profile.

## Running the FHIR Validator App in Docker
* Build the image, using `docker build . -t fhir_validator_app`
* Run the container, using `docker run -p 8080:4567 -e external_validator_url=<URL to external validator> fhir_validator_app`
* Visit the site at `http://localhost:8080`

## Running the FHIR Validator App using Docker Compose
* Build the image, using `docker-compose build`
* Run the compose file, using `docker-compose up`. This will run both the standalone validator app, as well as the [fhir-validator-wrapper](https://github.com/inferno-community/fhir-validator-wrapper) Docker container required to do exterrnal validation.