#!/bin/sh
set -e

# Railway inject PORT saat runtime (default 80 kalau tidak ada, misal saat run lokal)
PORT="${PORT:-80}"

sed -i "s/Listen 80/Listen ${PORT}/" /etc/apache2/ports.conf
sed -i "s/:80>/:${PORT}>/" /etc/apache2/sites-available/000-default.conf

exec apache2-foreground
