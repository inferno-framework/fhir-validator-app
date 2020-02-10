FROM ruby:2.5.6

WORKDIR /var/www/fhir_validator

### Install dependencies

COPY Gemfile* /var/www/fhir_validator/
RUN gem install bundler
# Throw an error if Gemfile & Gemfile.lock are out of sync
RUN bundle config --global frozen 1
RUN bundle install

COPY . /var/www/fhir_validator/

### Set up environment

ENV APP_ENV=production
EXPOSE 4567

CMD ["bundle", "exec", "rackup", "-o", "0.0.0.0"]
