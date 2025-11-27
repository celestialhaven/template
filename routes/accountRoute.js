// routes/accountRoute.js

// Required resources
const express = require("express")
const router = express.Router()
const utilities = require("../utilities")
const accountController = require("../controllers/accountController")
const regValidate = require('../utilities/account-validation')

// Login route - handles "/account/login"
router.get("/login", utilities.handleErrors(accountController.buildLogin))

// Registration view route - handles "/account/register"
router.get("/register", utilities.handleErrors(accountController.buildRegister))

router.post(
  "/register",
  regValidate.registerRules(),     // ① apply validation rules
  regValidate.checkRegData,       // ② handle validation errors (rerender form)
  utilities.handleErrors(accountController.registerAccount) // ③ only runs if valid
)

// Export the router
module.exports = router
