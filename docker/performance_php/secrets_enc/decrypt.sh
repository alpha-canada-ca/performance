#!/bin/sh
export GPG_TTY=$(tty)
gpg --quiet --batch --yes --decrypt --passphrase="$SECRETS_PASSPHRASE" \
--output ../secrets/keys/certificate.pem ./keys/certificate.pem.gpg
gpg --quiet --batch --yes --decrypt --passphrase="$SECRETS_PASSPHRASE" \
--output ../secrets/keys/secret.key ./keys/secret.key.gpg
gpg --quiet --batch --yes --decrypt --passphrase="$SECRETS_PASSPHRASE" \
--output ../secrets/keys/secret.pem ./keys/secret.pem.gpg
gpg --quiet --batch --yes --decrypt --passphrase="$SECRETS_PASSPHRASE" \
--output ../secrets/php/config.php ./php/config.php.gpg
gpg --quiet --batch --yes --decrypt --passphrase="$SECRETS_PASSPHRASE" \
--output ../secrets/php/service-account-credentials.json ./php/service-account-credentials.json.gpg
cd ../secrets/keys
ls -la
cd ..
cd ../secrets/php
ls -la



