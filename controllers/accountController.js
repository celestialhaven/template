// controllers/accountController.js

// Require utilities
const utilities = require("../utilities")
// Require account model
const accountModel = require("../models/account-model")

// Controller Object
const accountController = {}

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
*  Process Registration
* *************************************** */
accountController.registerAccount = async function (req, res, next) {
  console.log("➡️ Hit registerAccount controller")  // 👈 step-1 check
  let nav = await utilities.getNav()

  try {
    console.log("Register form data:", req.body)    // 👈 step-2 check

    const {
      account_firstname,
      account_lastname,
      account_email,
      account_password,
    } = req.body

    const regResult = await accountModel.registerAccount(
      account_firstname,
      account_lastname,
      account_email,
      account_password
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

module.exports = accountController
