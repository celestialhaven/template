-- 1) Insert Tony Stark into the account table
INSERT INTO public.account (
  account_firstname,
  account_lastname,
  account_email,
  account_password
) VALUES (
  'Tony',
  'Stark',
  'tony@starkent.com',
  'Iam1ronM@n'
);

-- 2) Change Tony Stark to Admin (replace 7 with your actual Tony account_id)
UPDATE public.account
SET account_type = 'Admin'
WHERE account_id = 7;


-- 3) Delete Tony Stark
DELETE FROM public.account
WHERE account_id = 7;
