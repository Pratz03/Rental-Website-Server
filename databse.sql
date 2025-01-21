CREATE DATABASE client_DB;

CREATE TABLE clients (
    client_id SERIAL PRIMARY KEY, 
    client_username VARCHAR(50) NOT NULL UNIQUE,
    client_password VARCHAR(255) NOT NULL,
    client_database_name VARCHAR(100) NOT NULL UNIQUE
);

SELECT * FROM company_info;

DELETE FROM clients
WHERE client_id = 3
RETURNING *;

-- SERIAL PRIMARY KEY it will make this client unique and serial will make sure that it is