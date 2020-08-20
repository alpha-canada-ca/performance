FROM nginx:alpine
COPY docker/performance_nginx/nginx.conf /etc/nginx/nginx.conf
RUN mkdir -p /var/www/html
COPY assets/ /var/www/html/assets/
COPY js/ /var/www/html/js/
COPY php/ /var/www/html/php/
COPY index.html /var/www/html/index.html
COPY docker/performance_php/mongo_connect.php /var/www/html/php/mongo_connect.php
COPY docker/performance_php/helloworld.php /var/www/html/php/helloworld.php


