FROM node:10 AS nodejs

FROM ruby:2.5.6

ENV LANG C.UTF-8

ENV NODE_MAJOR 10

RUN groupadd --gid 1000 node \
  && useradd --uid 1000 --gid node --shell /bin/bash --create-home node

COPY --from=nodejs /usr/local/bin/node /usr/local/bin/
COPY --from=nodejs /usr/local/lib/node_modules /usr/local/lib/node_modules
COPY --from=nodejs /opt/ /opt/

RUN ln -sf /usr/local/bin/node /usr/local/bin/nodejs \
  && ln -sf ../lib/node_modules/npm/bin/npm-cli.js /usr/local/bin/npm \
  && ln -sf ../lib/node_modules/npm/bin/npx-cli.js /usr/local/bin/npx

WORKDIR /var/www/fhir_validator

### Install dependencies

COPY Gemfile* /var/www/fhir_validator/
RUN /usr/local/bin/gem update --system
RUN /usr/local/bin/gem install bundler
# Throw an error if Gemfile & Gemfile.lock are out of sync
RUN /usr/local/bin/bundle config --global frozen 1
RUN /usr/local/bin/bundle install

COPY . /var/www/fhir_validator/

RUN npm install
RUN npm run build
# remnove node_modules, as it's not needed after the build is run
RUN rm -rf /var/www/fhir_validator/node_modules

### Set up environment

ENV APP_ENV=production
EXPOSE 4567

CMD ["bundle", "exec", "rackup", "-o", "0.0.0.0"]
