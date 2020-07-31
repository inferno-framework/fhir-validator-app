#!/bin/sh

export validator_base_path

envsubst '${validator_base_path}' <  /nginx.conf.template > /etc/nginx/conf.d/default.conf

exec "$@"
