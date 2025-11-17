// database/index.js
const { Pool } = require("pg")
require("dotenv").config()

/* ***************
 * Connection Pool
 * Local vs Production (Render)
 * *************** */

let pool

if (process.env.NODE_ENV === "production") {
  // 🔹 Running on Render (or other host)
  //    Use DATABASE_URL from Render and enable SSL
  pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
      rejectUnauthorized: false,
    },
  })
} else {
  // 🔹 Local development
  //    Use local DATABASE_URL from your .env
  pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    // no ssl needed locally
  })
}

// 🔹 Export a query helper used everywhere in models
module.exports = {
  async query(text, params) {
    try {
      const res = await pool.query(text, params)
      console.log("executed query", { text })
      return res
    } catch (error) {
      console.error("error in query", { text, error })
      throw error
    }
  },
}
