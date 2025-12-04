// routes/accountRoute.js

// Required resources
const express = require("express")
const router = express.Router()
const utilities = require("../utilities")
const accountController = require("../controllers/accountController")
const accountValidate = require("../utilities/account-validation") // 👈 single validator object

/* *******************************
 *  Login & Registration Views
 * ****************************** */

// Login view
router.get(
  "/login",
  utilities.handleErrors(accountController.buildLogin)
)

// Registration view
router.get(
  "/register",
  utilities.handleErrors(accountController.buildRegister)
)

/* *******************************
 *  Account Management View
 * ****************************** */

router.get(
  "/",
  utilities.checkLogin,
  utilities.handleErrors(accountController.buildAccountManagement)
)

/* *******************************
 *  Process registration
 * ****************************** */

router.post(
  "/register",
  accountValidate.registerRules(),   // ① apply validation rules
  accountValidate.checkRegData,      // ② handle validation errors
  utilities.handleErrors(accountController.registerAccount) // ③ controller
)

/* *******************************
 *  Process login attempt
 * ****************************** */

router.post(
  "/login",
  accountValidate.loginRules(),      // ① login validation rules
  accountValidate.checkLoginData,    // ② rerender view if errors
  utilities.handleErrors(accountController.accountLogin) // ③ controller
)

/* ****************************************
 *  Deliver account update view
 * *************************************** */

router.get(
  "/update/:accountId",
  utilities.checkLogin,
  utilities.handleErrors(accountController.buildUpdateAccountView)
)

/* ****************************************
 *  Process account info update
 * *************************************** */

router.post(
  "/update",
  accountValidate.updateAccountRules(),
  accountValidate.checkUpdateAccountData,
  utilities.handleErrors(accountController.updateAccount)
)

/* ****************************************
 *  Process password change
 * *************************************** */

router.post(
  "/update-password",
  accountValidate.updatePasswordRules(),
  accountValidate.checkUpdatePasswordData,
  utilities.handleErrors(accountController.updatePassword)
)

/* ****************************************
 *  Logout Route
 * *************************************** */
router.get(
  "/logout",
  (req, res) => {
    res.clearCookie("jwt")   // delete the JWT cookie
    req.flash("notice", "You have been logged out.")
    return res.redirect("/") // go back to home page
  }
)

// Export the router
module.exports = router
