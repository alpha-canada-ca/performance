FROM tbsacr.azurecr.io/performance_php:1.0.0
RUN echo "Hahasdf"
RUN pecl install xdebug 
RUN docker-php-ext-enable xdebug
COPY docker/performance_debug_php/xdebug.ini /usr/local/etc/php/conf.d/docker-php-ext-xdebug.ini
RUN touch /tmp/xdebug.log
RUN chmod a+rwx /tmp/xdebug.log
RUN php -r "phpinfo();" | grep xdebug      



