// routes/accountRoute.js

// Required resources
const express = require("express")
const router = express.Router()
const utilities = require("../utilities")
const accountController = require("../controllers/accountController")

// Login route - handles "/account/login"
router.get("/login", utilities.handleErrors(accountController.buildLogin))

// Registration route - handles "/account/register"
router.get("/register", utilities.handleErrors(accountController.buildRegister))

// Export the router
module.exports = router
