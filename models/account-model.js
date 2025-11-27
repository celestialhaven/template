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

module.exports = {
  registerAccount,
  checkExistingEmail
}
