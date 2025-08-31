CREATE USER uch_user WITH PASSWORD 'uch_password';
CREATE DATABASE uch_dev OWNER uch_user;
GRANT ALL PRIVILEGES ON DATABASE uch_dev TO uch_user;