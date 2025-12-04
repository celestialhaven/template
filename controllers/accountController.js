// controllers/accountController.js

// Require utilities
const utilities = require("../utilities")
// Require account model
const accountModel = require("../models/account-model")
// hashing using Bcryptjs
const bcrypt = require("bcryptjs")

// JWT
const jwt = require("jsonwebtoken")
require("dotenv").config()

// Controller Object
const accountController = {}

/* ****************************************
 *  Deliver login view
 * *************************************** */
accountController.buildLogin = async function (req, res, next) {
  const nav = await utilities.getNav()
  res.render("account/login", {
    title: "Login",
    nav,
    errors: [], // always an array
  })
}

/* ****************************************
 *  Deliver registration view
 * *************************************** */
accountController.buildRegister = async function (req, res, next) {
  const nav = await utilities.getNav()
  res.render("account/register", {
    title: "Register",
    nav,
    errors: [], // always an array
  })
}

/* ***************************
 *  Build Account Management View
 * ************************** */
accountController.buildAccountManagement = async function (req, res, next) {
  try {
    const nav = await utilities.getNav()

    // `accountData` and `loggedin` are set in checkJWTToken middleware
    const accountData = res.locals.accountData
    const loggedin = res.locals.loggedin

    if (!loggedin || !accountData) {
      req.flash("notice", "Please log in to view your account.")
      return res.redirect("/account/login")
    }

    return res.render("account/management", {
      title: "Account Management",
      nav,
      errors: [],
      accountData,
    })
  } catch (error) {
    next(error)
  }
}

/* ****************************************
 *  Process Registration
 * *************************************** */
accountController.registerAccount = async function (req, res, next) {
  const nav = await utilities.getNav()

  try {
    const {
      account_firstname,
      account_lastname,
      account_email,
      account_password,
    } = req.body

    // Hash the password before storing
    let hashedPassword
    try {
      hashedPassword = await bcrypt.hash(account_password, 10)
    } catch (error) {
      console.error("Password hash error:", error)
      req.flash(
        "notice",
        "Sorry, there was an error processing the registration."
      )
      return res.status(500).render("account/register", {
        title: "Registration",
        nav,
        errors: [],
      })
    }

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
        errors: [],
      })
    }

    req.flash("notice", "Sorry, the registration failed.")
    return res.status(501).render("account/register", {
      title: "Register",
      nav,
      errors: [],
    })
  } catch (error) {
    console.error("registerAccount controller error:", error)
    req.flash("notice", "Sorry, the registration failed.")
    return res.status(500).render("account/register", {
      title: "Register",
      nav,
      errors: [],
    })
  }
}

/* ****************************************
 *  Process login request
 * *************************************** */
async function accountLogin(req, res, next) {
  const nav = await utilities.getNav()
  const { account_email, account_password } = req.body

  const accountData = await accountModel.getAccountByEmail(account_email)
  if (!accountData) {
    req.flash("notice", "Please check your credentials and try again.")
    return res.status(400).render("account/login", {
      title: "Login",
      nav,
      errors: [],
      account_email,
    })
  }

  try {
    const isValid = await bcrypt.compare(
      account_password,
      accountData.account_password
    )

    if (!isValid) {
      req.flash("notice", "Please check your credentials and try again.")
      return res.status(400).render("account/login", {
        title: "Login",
        nav,
        errors: [],
        account_email,
      })
    }

    // Remove password before putting into token / locals
    delete accountData.account_password

    // Create JWT
    const accessToken = jwt.sign(
      accountData, // or { ...accountData } if you prefer
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: "1h" }
    )

    // Common cookie options
    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV !== "development",
      sameSite: "lax",
      maxAge: 3600 * 1000, // 1 hour in ms
    }

    // Set the jwt cookie (must match name used in logout)
    res.cookie("jwt", accessToken, cookieOptions)

    return res.redirect("/account/")
  } catch (error) {
    console.error("accountLogin error:", error)
    return next(new Error("Access Forbidden"))
  }
}


/* ****************************************
 *  Deliver Account Update View
 * *************************************** */
accountController.buildUpdateAccountView = async function (req, res, next) {
  try {
    const nav = await utilities.getNav()
    const accountId = parseInt(req.params.accountId, 10)

    const result = await accountModel.getAccountById(accountId)

    // Support either a query result or a direct row
    const accountData = result?.rows ? result.rows[0] : result

    if (!accountData) {
      req.flash("notice", "Account not found.")
      return res.redirect("/account/")
    }

    // Save for validators that use res.locals.accountData
    res.locals.accountData = accountData

    return res.render("account/update", {
      title: "Update Account",
      nav,
      errors: [],
      // ❌ do NOT override res.locals.messages here
      account_id: accountData.account_id,
      account_firstname: accountData.account_firstname,
      account_lastname: accountData.account_lastname,
      account_email: accountData.account_email,
    })
  } catch (error) {
    console.error("buildUpdateAccountView error:", error)
    next(error)
  }
}

/* ****************************************
 *  Process Account Info Update
 * *************************************** */
accountController.updateAccount = async function (req, res, next) {
  const nav = await utilities.getNav()

  const {
    account_id,
    account_firstname,
    account_lastname,
    account_email,
  } = req.body

  try {
    const updatedAccount = await accountModel.updateAccount(
      account_id,
      account_firstname,
      account_lastname,
      account_email
    )

    if (!updatedAccount) {
      req.flash("notice", "Sorry, the account update failed.")
      return res.redirect(`/account/update/${account_id}`)
    }

    // If your model returns a query result, grab the row
    const updatedRow =
      updatedAccount.rows && updatedAccount.rows[0]
        ? updatedAccount.rows[0]
        : updatedAccount

    // Refresh JWT so header + res.locals use updated info
    if (updatedRow) {
      delete updatedRow.account_password
      const accessToken = jwt.sign(
        updatedRow,
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: "1h" }
      )
      res.cookie("jwt", accessToken, {
        httpOnly: true,
        secure: false,
        maxAge: 3600 * 1000,
      })
    }

    req.flash("notice", "Account information was successfully updated.")
    return res.redirect("/account/")
  } catch (error) {
    console.error("updateAccount controller error:", error)
    req.flash("notice", "An error occurred while updating the account.")
    return res.redirect(`/account/update/${account_id}`)
  }
}

/* ****************************************
 *  Process Password Change
 * *************************************** */
accountController.updatePassword = async function (req, res, next) {
  const { account_id, account_password } = req.body

  try {
    const hashedPassword = await bcrypt.hash(account_password, 10)

    const updatedAccount = await accountModel.updatePassword(
      account_id,
      hashedPassword
    )

    if (!updatedAccount) {
      req.flash("notice", "Sorry, the password update failed.")
      return res.redirect(`/account/update/${account_id}`)
    }

    req.flash("notice", "Password was successfully updated.")
    return res.redirect("/account/")
  } catch (error) {
    console.error("updatePassword controller error:", error)
    req.flash("notice", "An error occurred while changing the password.")
    return res.redirect(`/account/update/${account_id}`)
  }
}

accountController.accountLogin = accountLogin
module.exports = accountController
