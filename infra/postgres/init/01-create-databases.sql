-- One database and one owner role per service (database-per-service pattern).
-- Each role can connect only to its own database.
-- Dev-only credentials: password = role name. Never reuse in production.

CREATE ROLE consumer_service      LOGIN PASSWORD 'consumer_service';
CREATE ROLE restaurant_service    LOGIN PASSWORD 'restaurant_service';
CREATE ROLE order_service         LOGIN PASSWORD 'order_service';
CREATE ROLE kitchen_service       LOGIN PASSWORD 'kitchen_service';
CREATE ROLE delivery_service      LOGIN PASSWORD 'delivery_service';
CREATE ROLE accounting_service    LOGIN PASSWORD 'accounting_service';
CREATE ROLE order_history_service LOGIN PASSWORD 'order_history_service';

CREATE DATABASE consumer_db      OWNER consumer_service;
CREATE DATABASE restaurant_db    OWNER restaurant_service;
CREATE DATABASE order_db         OWNER order_service;
CREATE DATABASE kitchen_db       OWNER kitchen_service;
CREATE DATABASE delivery_db      OWNER delivery_service;
CREATE DATABASE accounting_db    OWNER accounting_service;
CREATE DATABASE order_history_db OWNER order_history_service;

REVOKE CONNECT ON DATABASE consumer_db      FROM PUBLIC;
REVOKE CONNECT ON DATABASE restaurant_db    FROM PUBLIC;
REVOKE CONNECT ON DATABASE order_db         FROM PUBLIC;
REVOKE CONNECT ON DATABASE kitchen_db       FROM PUBLIC;
REVOKE CONNECT ON DATABASE delivery_db      FROM PUBLIC;
REVOKE CONNECT ON DATABASE accounting_db    FROM PUBLIC;
REVOKE CONNECT ON DATABASE order_history_db FROM PUBLIC;
