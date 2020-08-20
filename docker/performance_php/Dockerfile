#FROM drupalwxt/site-wxt:latest
FROM php:fpm-alpine
RUN apk update
RUN apk add nano
RUN apk add curl
RUN apk add php-curl
RUN apk add openssl
RUN apk add php-openssl
RUN apk add --no-cache $PHPIZE_DEPS
RUN pecl install mongodb
RUN docker-php-ext-install opcache
COPY docker/performance_php/php.ini /usr/local/etc/php/php.ini
COPY docker/performance_php/www.conf /usr/local/etc/php-fpm.d
RUN yes | rm -R /var/www/html
COPY assets/ /var/www/html/assets/
COPY js/ /var/www/html/js/
COPY php/ /var/www/html/php/
COPY docker/performance_php/secrets/php/config.php /var/www/html/php/config.php
COPY docker/performance_php/secrets/php/service-account-credentials.json /var/www/html/php/service-account-credentials.json
COPY docker/performance_php/secrets/keys /var/www/html/keys
#COPY docker/performance_php/mongo_connect.php /var/www/html/php/mongo_connect.php
#COPY docker/performance_php/helloworld.php /var/www/html/php/helloworld.php
COPY index.html /var/www/html/index.html
RUN chown -R -f www-data:www-data /var/www/html/
RUN chmod -R ug+rwx /var/www/html

# Reset Cache
RUN php -version
RUN php -r 'opcache_reset();'


 

