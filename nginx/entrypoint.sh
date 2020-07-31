#!/bin/sh

envsubst '${VALIDATOR_BASE_PATH}' <  /nginx.conf.template > /etc/nginx/conf.d/default.conf
sh ./create_config.sh > /validator/config.js

exec "$@"
