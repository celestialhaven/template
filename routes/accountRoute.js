// routes/accountRoute.js

// Required resources
const express = require("express")
const router = express.Router()
const utilities = require("../utilities")
const accountController = require("../controllers/accountController")

// Login route - handles "/account/login"
router.get("/login", utilities.handleErrors(accountController.buildLogin))

// Registration view route - handles "/account/register"
router.get("/register", utilities.handleErrors(accountController.buildRegister))

/* ****************************************
*  Process registration data
* *************************************** */
router.post(
  "/register",
  utilities.handleErrors(accountController.registerAccount)
)

// Export the router
module.exports = router
