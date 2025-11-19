const invModel = require("../models/inventory-model")
const utilities = require("../utilities/")

const invCont = {}

/* ***************************
 *  Build inventory by classification view
 * ************************** */
invCont.buildByClassificationId = async function (req, res, next) {
  const classification_id = req.params.classificationId
  const data = await invModel.getInventoryByClassificationId(classification_id)
  const grid = await utilities.buildClassificationGrid(data)
  let nav = await utilities.getNav()
  const className = data[0].classification_name
  res.render("./inventory/classification", {
    title: className + " vehicles",
    nav,
    grid,
  })
}

/* ***************************
 *  Build inventory detail view by inv_id
 * ************************** */
invCont.buildByInvId = async function (req, res, next) {
  const invId = req.params.invId

  // Get one vehicle from the model
  const vehicleData = await invModel.getInventoryByInvId(invId)

  // If nothing came back, pass an error to next()
  if (!vehicleData) {
    const error = new Error("Vehicle not found")
    error.status = 404
    return next(error)
  }

  // Build navigation
  const nav = await utilities.getNav()

  // Build detail HTML (we'll create this helper in utilities next)
  const vehicleDetail = await utilities.buildVehicleDetail(vehicleData)

  // Title: "Year Make Model"
  const pageTitle = `${vehicleData.inv_year} ${vehicleData.inv_make} ${vehicleData.inv_model}`

  res.render("./inventory/detail", {
    title: pageTitle,
    nav,
    vehicleDetail,
  })
}

module.exports = invCont
