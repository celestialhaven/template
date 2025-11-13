-- 1) Insert Tony Stark
INSERT INTO account
  (account_firstname, account_lastname, account_email, account_password)
VALUES
  ('Tony', 'Stark', 'tony@starkent.com', 'Iam1ronM@n');


-- Checking Tony Stark
SELECT account_id, account_firstname, account_lastname, account_email, account_type
FROM account
WHERE account_email = 'tony@starkent.com';

-- 2) Make Tony Stark an Admin
UPDATE account
SET account_type = 'Admin'
WHERE account_id = 1;

-- Checking Tony Stark as Admin
SELECT account_id, account_firstname, account_lastname, account_email, account_type
FROM account
WHERE account_id = 1;

-- 3) Delete Tony Stark
DELETE FROM account
WHERE account_id = 1;

-- Checking Tony Stark if deleted
SELECT *
FROM account
WHERE account_id = 1
   OR account_email = 'tony@starkent.com';

-- Finding GM Hummer
SELECT inv_id, inv_make, inv_model, inv_description
FROM inventory
WHERE inv_make = 'GM' AND inv_model = 'Hummer';

-- 4) Change "small interiors" to "a huge interior" for GM Hummer
UPDATE inventory
SET inv_description = REPLACE(inv_description, 'small interiors', 'a huge interior')
WHERE inv_id = 10; 

-- 5) Make, model, and classification for Sport vehicles
SELECT i.inv_make,
       i.inv_model,
       c.classification_name
FROM inventory AS i
INNER JOIN classification AS c
  ON i.classification_id = c.classification_id
WHERE c.classification_name = 'Sport';

-- 6) Add "/vehicles" inside image paths
UPDATE inventory
SET inv_image = REPLACE(inv_image, '/images/', '/images/vehicles/'),
    inv_thumbnail = REPLACE(inv_thumbnail, '/images/', '/images/vehicles/');