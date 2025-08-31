CREATE USER uch_user WITH PASSWORD 'uch_password';
CREATE DATABASE uch_db OWNER uch_user;
GRANT ALL PRIVILEGES ON DATABASE uch_db TO uch_user;