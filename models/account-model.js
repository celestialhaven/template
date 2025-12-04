const pool = require("../database/")

/* *****************************
*   Register new account
* *************************** */
async function registerAccount(account_firstname, account_lastname, account_email, account_password) {
  try {
    const sql =
      "INSERT INTO account (account_firstname, account_lastname, account_email, account_password, account_type) VALUES ($1, $2, $3, $4, 'Client') RETURNING *"

    const data = await pool.query(sql, [
      account_firstname,
      account_lastname,
      account_email,
      account_password,
    ])

    console.log(
      `ACCOUNT CREATED → id: ${data.rows[0].account_id}, email: ${data.rows[0].account_email}`
    )

    return data
  } catch (error) {
    console.error("REGISTER ERROR:", error)
    return null
  }
}

/* **********************
 *   Check for existing email
 * ********************* */
async function checkExistingEmail(account_email) {
  try {
    const sql = "SELECT * FROM account WHERE account_email = $1"
    const email = await pool.query(sql, [account_email])
    return email.rowCount // returns 1 or 0
  } catch (error) {
    console.error("CHECK EMAIL ERROR:", error)
    throw error
  }
}

/* *****************************
* Return account data using email address
* ***************************** */
async function getAccountByEmail (account_email) {
  try {
    const result = await pool.query(
      'SELECT account_id, account_firstname, account_lastname, account_email, account_type, account_password FROM account WHERE account_email = $1',
      [account_email])
    return result.rows[0]
  } catch (error) {
    return new Error("No matching email found")
  }
}

/* ****************************************
 *  Get account by ID
 * *************************************** */
async function getAccountById(account_id) {
  try {
    const sql = "SELECT * FROM public.account WHERE account_id = $1"
    const data = await pool.query(sql, [account_id])
    return data.rows[0]
  } catch (error) {
    console.error("getAccountById error " + error)
    throw error
  }
}

/* ****************************************
 *  Update account profile (name + email)
 * *************************************** */
async function updateAccount(account_id, firstname, lastname, email) {
  try {
    const sql = `
      UPDATE public.account
      SET account_firstname = $1,
          account_lastname  = $2,
          account_email     = $3
      WHERE account_id = $4
      RETURNING *
    `
    const data = await pool.query(sql, [firstname, lastname, email, account_id])
    return data.rows[0]
  } catch (error) {
    console.error("updateAccount error " + error)
    throw error
  }
}

/* ****************************************
 *  Update account password (hash)
 * *************************************** */
async function updatePassword(account_id, hashedPassword) {
  try {
    const sql = `
      UPDATE public.account
      SET account_password = $1
      WHERE account_id = $2
      RETURNING *
    `
    const data = await pool.query(sql, [hashedPassword, account_id])
    return data.rows[0]
  } catch (error) {
    console.error("updatePassword error " + error)
    throw error
  }
}


module.exports = {
  registerAccount,
  checkExistingEmail,
  getAccountByEmail,
  getAccountById,
  updateAccount,
  updatePassword
}
