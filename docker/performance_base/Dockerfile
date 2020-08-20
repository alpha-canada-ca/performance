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