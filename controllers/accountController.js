// controllers/accountController.js

// Require utilities
const utilities = require("../utilities")
// Require account model
const accountModel = require("../models/account-model")
// hashing using Bcryptjs
const bcrypt = require("bcryptjs")
// Controller Object
const accountController = {}
// JWT
const jwt = require("jsonwebtoken")
require("dotenv").config()

/* ****************************************
*  Deliver login view
* *************************************** */
accountController.buildLogin = async function (req, res, next) {
  let nav = await utilities.getNav()
  res.render("account/login", {
    title: "Login",
    nav,
  })
}

/* ****************************************
*  Deliver registration view
* *************************************** */
accountController.buildRegister = async function (req, res, next) {
  let nav = await utilities.getNav()
  res.render("account/register", {
    title: "Register",
    nav,
    errors: null,
  })
}

/* ****************************************
*  Deliver account management view
* *************************************** */
accountController.buildAccountManagement = async function (req, res, next) {
  const nav = await utilities.getNav()
  const accountData = res.locals.accountData  // comes from checkJWTToken

  res.render("account/management", {
    title: "Account Management",
    nav,
    notice: req.flash("notice"),
    errors: null,
    accountData
  })
}

/* ****************************************
*  Process Registration
* *************************************** */
accountController.registerAccount = async function (req, res, next) {
  console.log("➡️ Hit registerAccount controller")
  let nav = await utilities.getNav()

  try {
    console.log("Register form data:", req.body)

    const {
      account_firstname,
      account_lastname,
      account_email,
      account_password,
    } = req.body

    // Hash the password before storing
    let hashedPassword
    try {
      // regular password and cost (salt is generated automatically)
      hashedPassword = await bcrypt.hashSync(account_password, 10)
    } catch (error) {
      console.error("Password hash error:", error)
      req.flash(
        "notice",
        "Sorry, there was an error processing the registration."
      )
      return res.status(500).render("account/register", {
        title: "Registration",
        nav,
        errors: null,
      })
    }

    // Use the hashed password when saving to DB
    const regResult = await accountModel.registerAccount(
      account_firstname,
      account_lastname,
      account_email,
      hashedPassword
    )

    if (regResult && regResult.rowCount > 0) {
      req.flash(
        "notice",
        `Congratulations, you're registered ${account_firstname}. Please log in.`
      )
      return res.status(201).render("account/login", {
        title: "Login",
        nav,
      })
    }

    req.flash("notice", "Sorry, the registration failed.")
    return res.status(501).render("account/register", {
      title: "Register",
      nav,
      errors: null,
    })
  } catch (error) {
    console.error("registerAccount controller error:", error)
    req.flash("notice", "Sorry, the registration failed.")
    return res.status(500).render("account/register", {
      title: "Register",
      nav,
      errors: null,
    })
  }
}

/* ****************************************
 *  Process login request
 * ************************************ */
async function accountLogin(req, res) {
  let nav = await utilities.getNav()
  const { account_email, account_password } = req.body
  const accountData = await accountModel.getAccountByEmail(account_email)
  if (!accountData) {
    req.flash("notice", "Please check your credentials and try again.")
    res.status(400).render("account/login", {
      title: "Login",
      nav,
      errors: null,
      account_email,
    })
    return
  }
  try {
    if (await bcrypt.compare(account_password, accountData.account_password)) {
      delete accountData.account_password

      const accessToken = jwt.sign(
        accountData,
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: 3600 * 1000 }
      )

      if (process.env.NODE_ENV === 'development') {
        res.cookie("jwt", accessToken, { httpOnly: true, maxAge: 3600 * 1000 })
      } else {
        res.cookie("jwt", accessToken, { httpOnly: true, secure: true, maxAge: 3600 * 1000 })
      }

      // ✅ Success notice for the management view
      req.flash("notice", "You’re logged in.")

      return res.redirect("/account/")
    }
    else {
      req.flash("notice", "Please check your credentials and try again.")
      res.status(400).render("account/login", {
        title: "Login",
        nav,
        errors: null,
        account_email,
      })
    }
  } catch (error) {
    throw new Error('Access Forbidden')
  }
}

accountController.accountLogin = accountLogin
module.exports = accountController
