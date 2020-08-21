FROM drupalwxt/site-wxt:latest
RUN apk update
RUN apk add nano
RUN apk add curl
RUN apk add php-curl
RUN apk add openssl
RUN apk add php-openssl
RUN apk add --no-cache $PHPIZE_DEPS
RUN pecl install mongodb
RUN docker-php-ext-install opcache
RUN yes | rm -R /var/www/html
RUN mkdir -p /var/www/html
RUN chown -R -f www-data:www-data /var/www/html/
RUN chmod -R ug+rwx /var/www/html