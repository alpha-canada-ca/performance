FROM tbsacr.azurecr.io/performance_php:latest
RUN pecl install xdebug 
RUN docker-php-ext-enable xdebug
COPY docker/performance_debug_php/xdebug.ini /usr/local/etc/php/conf.d/docker-php-ext-xdebug.ini
RUN php -r "phpinfo();" | grep xdebug

RUN touch /usr/local/etc/php/xdebug.log
RUN chown www-data:www-data /usr/local/etc/php/xdebug.log
RUN chmod 755 /usr/local/etc/php/xdebug.log 



