#!/bin/sh

cat << EOF
CONFIG = {
  validatorBasePath: "$VALIDATOR_BASE_PATH",
  externalValidatorUrl: "$EXTERNAL_VALIDATOR_URL",
};
EOF
