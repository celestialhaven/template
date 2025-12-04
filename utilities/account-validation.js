const utilities = require(".")
const accountModel = require("../models/account-model")
const { body, validationResult } = require("express-validator")

// Single shared validator object
const accountValidate = {}

/*  **********************************
 *  Registration Data Validation Rules
 * ********************************* */
accountValidate.registerRules = () => {
  return [
    // firstname is required and must be string
    body("account_firstname")
      .trim()
      .escape()
      .notEmpty()
      .isLength({ min: 1 })
      .withMessage("Please provide a first name."),

    // lastname is required and must be string
    body("account_lastname")
      .trim()
      .escape()
      .notEmpty()
      .isLength({ min: 2 })
      .withMessage("Please provide a last name."),

    // valid email is required and cannot already exist in the database
    body("account_email")
      .trim()
      .escape()
      .notEmpty()
      .withMessage("A valid email is required.")
      .bail()
      .isEmail()
      .withMessage("A valid email is required.")
      .bail()
      .normalizeEmail()
      .custom(async (account_email) => {
        const emailExists = await accountModel.checkExistingEmail(account_email)
        if (emailExists) {
          throw new Error(
            "Email exists. Please log in or use a different email."
          )
        }
        return true
      }),

    // password is required and must be strong password
    body("account_password")
      .trim()
      .notEmpty()
      .isStrongPassword({
        minLength: 12,
        minLowercase: 1,
        minUppercase: 1,
        minNumbers: 1,
        minSymbols: 1,
      })
      .withMessage("Password does not meet requirements."),
  ]
}

/* ******************************
 * Check registration data and return errors or continue
 * ***************************** */
accountValidate.checkRegData = async (req, res, next) => {
  const { account_firstname, account_lastname, account_email } = req.body
  const errors = validationResult(req)

  if (!errors.isEmpty()) {
    const nav = await utilities.getNav()
    return res.render("account/register", {
      title: "Registration",
      nav,
      errors: errors.array(),
      account_firstname,
      account_lastname,
      account_email,
    })
  }
  next()
}

/*  **********************************
 *  Login Data Validation Rules
 * ********************************* */
accountValidate.loginRules = () => {
  return [
    body("account_email")
      .trim()
      .escape()
      .notEmpty()
      .withMessage("Please provide an email address.")
      .bail()
      .isEmail()
      .withMessage("Please provide a valid email address.")
      .bail()
      .normalizeEmail(),

    body("account_password")
      .trim()
      .notEmpty()
      .withMessage("Please provide a password."),
  ]
}

/* ******************************
 * Check login data and either show errors or continue
 * ***************************** */
accountValidate.checkLoginData = async (req, res, next) => {
  const { account_email } = req.body
  const errors = validationResult(req)

  if (!errors.isEmpty()) {
    const nav = await utilities.getNav()
    return res.render("account/login", {
      title: "Login",
      nav,
      errors: errors.array(),
      account_email,
    })
  }
  next()
}

/* ****************************************
 *  Rules for updating account info
 * *************************************** */
accountValidate.updateAccountRules = () => {
  return [
    body("account_firstname")
      .trim()
      .escape()
      .isLength({ min: 1 })
      .withMessage("First name is required."),

    body("account_lastname")
      .trim()
      .escape()
      .isLength({ min: 1 })
      .withMessage("Last name is required."),

    body("account_email")
      .trim()
      .notEmpty()
      .withMessage("Email is required.")
      .bail()
      .isEmail()
      .withMessage("A valid email is required.")
      .normalizeEmail()
      .custom(async (account_email, { req }) => {
        // If the email didn’t change, skip duplicate check
        const currentEmail = req.body.current_email
        if (currentEmail && currentEmail === account_email) {
          return true
        }

        const emailExists = await accountModel.checkExistingEmail(account_email)
        if (emailExists) {
          throw new Error("That email already exists. Please use another.")
        }
        return true
      }),
  ]
}

/* ****************************************
 *  Check update account data
 * *************************************** */
accountValidate.checkUpdateAccountData = async (req, res, next) => {
  const errors = validationResult(req)

  if (!errors.isEmpty()) {
    const nav = await utilities.getNav()

    return res.status(400).render("account/update", {
      title: "Update Account",
      nav,
      errors: errors.array(),
      account_id: req.body.account_id,
      account_firstname: req.body.account_firstname,
      account_lastname: req.body.account_lastname,
      account_email: req.body.account_email,
    })
  }
  next()
}

/* ****************************************
 *  Rules for updating password
 * *************************************** */
accountValidate.updatePasswordRules = () => {
  return [
    body("account_password")
      .trim()
      .isLength({ min: 12 })
      .withMessage("Password must be at least 12 characters long.")
      .matches(/\d/)
      .withMessage("Password must contain at least one number.")
      .matches(/[A-Z]/)
      .withMessage("Password must contain at least one uppercase letter.")
      .matches(/[a-z]/)
      .withMessage("Password must contain at least one lowercase letter.")
      .matches(/[^A-Za-z0-9]/)
      .withMessage("Password must contain at least one special character."),
  ]
}

/* ****************************************
 *  Check update password data
 * *************************************** */
accountValidate.checkUpdatePasswordData = async (req, res, next) => {
  const errors = validationResult(req)

  if (!errors.isEmpty()) {
    const nav = await utilities.getNav()
    const accountData = res.locals.accountData || {
      account_id: req.body.account_id,
      account_firstname: req.body.account_firstname,
      account_lastname: req.body.account_lastname,
      account_email: req.body.account_email,
    }

    return res.status(400).render("account/update", {
      title: "Update Account",
      nav,
      errors: errors.array(),
      account_id: accountData.account_id,
      account_firstname: accountData.account_firstname,
      account_lastname: accountData.account_lastname,
      account_email: accountData.account_email,
    })
  }
  next()
}

module.exports = accountValidate
