/* ******************************************
 * This server.js file is the primary file of the 
 * application. It is used to control the project.
 *******************************************/
/* ***********************
 * Require Statements
 *************************/
const baseController = require("./controllers/baseController")
const express = require("express")
const env = require("dotenv").config()
const app = express()
const static = require("./routes/static")
const inventoryRoute = require("./routes/inventoryRoute")
const accountRoute = require("./routes/accountRoute")
const expressLayouts = require("express-ejs-layouts")
const utilities = require("./utilities")
const session = require("express-session")
const pool = require("./database/")
const cookieParser = require("cookie-parser")

/* ***********************
 * Middleware
 *************************/

// MUST come BEFORE routes – allows form data handling
app.use(express.urlencoded({ extended: true }))
app.use(express.json())

// Session storage
app.use(session({
  store: new (require("connect-pg-simple")(session))({
    createTableIfMissing: true,
    pool,
  }),
  secret: process.env.SESSION_SECRET,
  resave: true,
  saveUninitialized: true,
  name: "sessionId",
}))

// Flash Message Middleware
app.use(require("connect-flash")())
app.use(function (req, res, next) {
  res.locals.messages = require("express-messages")(req, res)
  next()
})

app.use(cookieParser())

/* ***********************
 * View Engine and Templates
 *************************/
app.set("view engine", "ejs")
app.use(expressLayouts)
app.set("layout", "./layouts/layout") // not at views root

// Static Files (CSS/JS/images)
app.use(express.static("public"))

/* ***********************
 * Routes
 *************************/
app.use(static)

// Index route
app.get("/", utilities.handleErrors(baseController.buildHome))

// Intentional 500 error simulation for assignment
app.get("/trigger-error", utilities.handleErrors(baseController.triggerError))

// Inventory routes
app.use("/inv", inventoryRoute)

// Account routes (login & registration)
app.use("/account", accountRoute)

// File Not Found Route (must be last)
app.use(async (req, res, next) => {
  next({ status: 404, message: "Sorry, we appear to have lost that page." })
})

/* ***********************
 * Express Error Handler – after all routes
 *************************/
app.use(async (err, req, res, next) => {
  let nav = await utilities.getNav()
  console.error(`Error at: "${req.originalUrl}": ${err.message}`)

  let message = err.status == 404
    ? err.message
    : "Oh no! There was a crash. Maybe try a different route?"

  res.status(err.status || 500).render("errors/error", {
    title: err.status || "Server Error",
    message,
    nav,
  })
})

/* ***********************
 * Local Server Info from .env
 *************************/
const port = process.env.PORT
const host = process.env.HOST

/* ***********************
 * Confirm server running
 *************************/
app.listen(port, () => {
  console.log(`app listening on ${host}:${port}`)
})
