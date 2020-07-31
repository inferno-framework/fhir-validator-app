#!/bin/sh

echo "CONFIG = {" > ./config.js
echo "  validatorBasePath: \"$VALIDATOR_BASE_PATH\"," >> ./config.js
echo "  externalValidatorUrl: \"$EXTERNAL_VALIDATOR_URL\"," >> ./config.js
echo "};" >> ./config.js
