FROM php:8.2-apache

# Install extension PDO MySQL
RUN docker-php-ext-install pdo pdo_mysql

# Pastikan hanya satu MPM yang aktif (base image kadang punya mpm_event & mpm_prefork
# sama-sama enabled, menyebabkan "AH00534: More than one MPM loaded").
# Hapus symlink modul MPM lain secara langsung, lalu pastikan prefork aktif.
RUN rm -f /etc/apache2/mods-enabled/mpm_event.load /etc/apache2/mods-enabled/mpm_event.conf \
           /etc/apache2/mods-enabled/mpm_worker.load /etc/apache2/mods-enabled/mpm_worker.conf \
    && a2enmod mpm_prefork

# Aktifkan mod_rewrite (dipakai .htaccess untuk routing ke index.php)
RUN a2enmod rewrite

# Izinkan .htaccess override (default Apache image ini AllowOverride None)
RUN sed -i '/<Directory \/var\/www\/>/,/<\/Directory>/ s/AllowOverride None/AllowOverride All/' /etc/apache2/apache2.conf

# Copy source code api/ ke document root Apache
COPY . /var/www/html/

# Pastikan folder uploads bisa ditulis oleh web server
RUN chown -R www-data:www-data /var/www/html/uploads \
    && chmod -R 755 /var/www/html/uploads

# Script untuk set port Apache sesuai $PORT dari Railway saat runtime
RUN chmod +x /var/www/html/docker-entrypoint.sh

EXPOSE 80

ENTRYPOINT ["/var/www/html/docker-entrypoint.sh"]