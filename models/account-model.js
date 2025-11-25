const pool = require("../database/")

/* *****************************
*   Register new account
* *************************** */
async function registerAccount(account_firstname, account_lastname, account_email, account_password) {
  try {
    const sql =
      "INSERT INTO account (account_firstname, account_lastname, account_email, account_password, account_type) VALUES ($1, $2, $3, $4, 'Client') RETURNING *"

    //  store the result instead of returning directly
    const data = await pool.query(sql, [
      account_firstname,
      account_lastname,
      account_email,
      account_password,
    ])

    //  This will show ONLY in the terminal when an account is created
    console.log(
      `ACCOUNT CREATED → id: ${data.rows[0].account_id}, email: ${data.rows[0].account_email}`
    )

    return data
  } catch (error) {
    console.error("REGISTER ERROR:", error)
    return null
  }
}

module.exports = { registerAccount }
