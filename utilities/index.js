const invModel = require("../models/inventory-model")
const Util = {}
const jwt = require("jsonwebtoken")
require("dotenv").config()

/* ************************
 * Constructs the nav HTML unordered list
 ************************** */
Util.getNav = async function () {
  let data = await invModel.getClassifications()
  let list = "<ul>"
  list += '<li><a href="/" title="Home page">Home</a></li>'
  data.rows.forEach((row) => {
    list += "<li>"
    list +=
      '<a href="/inv/type/' +
      row.classification_id +
      '" title="See our inventory of ' +
      row.classification_name +
      ' vehicles">' +
      row.classification_name +
      "</a>"
    list += "</li>"
  })
  list += "</ul>"
  return list
}

/* **************************************
 * Build the classification <select> list
 * ************************************ */
Util.buildClassificationList = async function (classification_id = null) {
  let data = await invModel.getClassifications()
  let classificationList =
    '<select name="classification_id" id="classificationList" required>'
  classificationList += "<option value=''>Choose a Classification</option>"

  data.rows.forEach((row) => {
    classificationList += '<option value="' + row.classification_id + '"'
    if (
      classification_id != null &&
      row.classification_id == classification_id
    ) {
      classificationList += " selected"
    }
    classificationList += ">" + row.classification_name + "</option>"
  })

  classificationList += "</select>"
  return classificationList
}

/* ****************************************
 * Middleware For Handling Errors
 * Wrap other function in this for 
 * General Error Handling
 **************************************** */
Util.handleErrors = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next)

/* **************************************
 * Build the classification view HTML
 * ************************************ */
Util.buildClassificationGrid = async function (data) {
  let grid = ""
  if (data.length > 0) {
    grid = '<ul id="inv-display">'
    data.forEach((vehicle) => {
      grid += "<li>"
      grid +=
        '<a href="../../inv/detail/' +
        vehicle.inv_id +
        '" title="View ' +
        vehicle.inv_make +
        " " +
        vehicle.inv_model +
        'details"><img src="' +
        vehicle.inv_thumbnail +
        '" alt="Image of ' +
        vehicle.inv_make +
        " " +
        vehicle.inv_model +
        ' on CSE Motors" /></a>'
      grid += '<div class="namePrice">'
      grid += "<hr />"
      grid += "<h2>"
      grid +=
        '<a href="../../inv/detail/' +
        vehicle.inv_id +
        '" title="View ' +
        vehicle.inv_make +
        " " +
        vehicle.inv_model +
        ' details">' +
        vehicle.inv_make +
        " " +
        vehicle.inv_model +
        "</a>"
      grid += "</h2>"
      grid +=
        "<span>$" +
        new Intl.NumberFormat("en-US").format(vehicle.inv_price) +
        "</span>"
      grid += "</div>"
      grid += "</li>"
    })
    grid += "</ul>"
  } else {
    grid +=
      '<p class="notice">Sorry, no matching vehicles could be found.</p>'
  }
  return grid
}

/* **************************************
 * Build the vehicle detail view HTML
 * ************************************ */
Util.buildVehicleDetail = async function (vehicle) {
  // Format price as US currency
  const price = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(vehicle.inv_price)

  // Format mileage with commas
  const miles = new Intl.NumberFormat("en-US").format(vehicle.inv_miles)

  let detail = ""

  detail += '<section id="inv-detail" class="vehicle-detail">'
  detail += '  <div class="vehicle-detail__image-wrapper">'
  detail +=
    '    <img src="' +
    vehicle.inv_image +
    '" alt="Image of ' +
    vehicle.inv_year +
    " " +
    vehicle.inv_make +
    " " +
    vehicle.inv_model +
    ' on CSE Motors" />'
  detail += "  </div>"

  detail += '  <div class="vehicle-detail__info">'
  detail +=
    "    <h2>" +
    vehicle.inv_year +
    " " +
    vehicle.inv_make +
    " " +
    vehicle.inv_model +
    "</h2>"
  detail += '    <p class="vehicle-detail__price">' + price + "</p>"
  detail +=
    '    <p class="vehicle-detail__miles"><strong>Mileage:</strong> ' +
    miles +
    " miles</p>"
  detail +=
    '    <p><strong>Color:</strong> ' + vehicle.inv_color + "</p>"
  detail +=
    '    <p><strong>Classification:</strong> ' +
    vehicle.classification_name +
    "</p>"
  detail +=
    '    <p class="vehicle-detail__description">' +
    vehicle.inv_description +
    "</p>"
  detail += "  </div>"

  detail += "</section>"

  return detail
}

/* ****************************************
* Middleware to check token validity
**************************************** */
Util.checkJWTToken = (req, res, next) => {
  if (req.cookies.jwt) {
    jwt.verify(
      req.cookies.jwt,
      process.env.ACCESS_TOKEN_SECRET,
      function (err, accountData) {
        if (err) {
          req.flash("notice", "Please log in.")
          res.clearCookie("jwt")
          return res.redirect("/account/login")
        }
        res.locals.accountData = accountData
        res.locals.loggedin = 1
        next()
      }
    )
  } else {
    next()
  }
}

/* ****************************************
 *  Check Login (any logged-in user)
 * ************************************ */
Util.checkLogin = (req, res, next) => {
  if (res.locals.loggedin) {
    next()
  } else {
    req.flash("notice", "Please log in.")
    return res.redirect("/account/login")
  }
}

/* ****************************************
 *  Check Employee or Admin role
 *  (for inventory management, etc.)
 * ************************************ */
Util.checkEmployeeOrAdmin = (req, res, next) => {
  const accountData = res.locals.accountData

  // Not logged in
  if (!accountData) {
    req.flash("notice", "Please log in to access that page.")
    return res.redirect("/account/login")
  }

  // Logged in but wrong role
  if (
    accountData.account_type !== "Employee" &&
    accountData.account_type !== "Admin"
  ) {
    req.flash("notice", "You are not authorized to view that page.")
    return res.redirect("/account/")
  }

  // Authorized
  next()
}

/* ***************
 * Export Utility
 * ************* */
module.exports = Util
