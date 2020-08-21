FROM dtobtn/performance_base:latest
COPY docker/performance_php/php.ini /usr/local/etc/php/php.ini
COPY docker/performance_php/www.conf /usr/local/etc/php-fpm.d
COPY assets/ /var/www/html/assets/
COPY js/ /var/www/html/js/
COPY php/ /var/www/html/php/
COPY docker/performance_php/secrets/php/config.php /var/www/html/php/config.php
COPY docker/performance_php/secrets/php/service-account-credentials.json /var/www/html/php/service-account-credentials.json
COPY docker/performance_php/secrets/keys /var/www/html/keys
#COPY docker/performance_php/mongo_connect.php /var/www/html/php/mongo_connect.php
#COPY docker/performance_php/helloworld.php /var/www/html/php/helloworld.php
COPY index.html /var/www/html/index.html

# Reset Cache
RUN php -version
RUN php -r 'opcache_reset();'


 

