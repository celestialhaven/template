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
  const vehicleData = await invModel.getInventoryByInvId(invId)

  if (!vehicleData) {
    const error = new Error("Vehicle not found")
    error.status = 404
    return next(error)
  }

  const nav = await utilities.getNav()
  const vehicleDetail = await utilities.buildVehicleDetail(vehicleData)
  const pageTitle = `${vehicleData.inv_year} ${vehicleData.inv_make} ${vehicleData.inv_model}`

  res.render("./inventory/detail", {
    title: pageTitle,
    nav,
    vehicleDetail,
  })
}

/* ***************************
 *  Inventory Management View
 * ************************** */
invCont.buildManagementView = async function (req, res, next) {
  let nav = await utilities.getNav()
  res.render("inventory/management", {
    title: "Inventory Management",
    nav,
    errors: null,
  })
}

/* ***************************
 *  Deliver Add Classification View
 * ************************** */
invCont.buildAddClassificationView = async function (req, res, next) {
  let nav = await utilities.getNav()
  res.render("inventory/add-classification", {
    title: "Add New Classification",
    nav,
    errors: [],                // 👈 empty array
    classification_name: ""    // 👈 optional, used in value=""
  })
}

/* ***************************
 *  Process Classification Creation
 * ************************** */
invCont.addClassification = async function (req, res, next) {
  const { classification_name } = req.body
  let nav = await utilities.getNav()

  try {
    const result = await invModel.addClassification(classification_name)

    if (result) {
      nav = await utilities.getNav() // Refresh navigation dynamically
      req.flash("notice", `Successfully added classification: ${classification_name}`)
      return res.status(201).render("inventory/management", {
        title: "Inventory Management",
        nav,
        errors: null,
      })
    }

    // If insertion failed
    req.flash("notice", "Failed to add classification. Try again.")
    return res.status(500).render("inventory/add-classification", {
      title: "Add New Classification",
      nav,
      classification_name,
      errors: null,
    })
  } catch (error) {
    console.error("Classification insert error:", error)
    req.flash("notice", "An error occurred while adding classification.")
    return res.status(500).render("inventory/add-classification", {
      title: "Add New Classification",
      nav,
      classification_name,
      errors: null,
    })
  }
}

/* ***************************
 *  Deliver Add Inventory View
 * ************************** */
invCont.buildAddInventoryView = async function (req, res, next) {
  const nav = await utilities.getNav()
  const classificationList = await utilities.buildClassificationList()
  res.render("inventory/add-inventory", {
    title: "Add New Vehicle",
    nav,
    classificationList,
    errors: [],
    classification_id: "",
    inv_make: "",
    inv_model: "",
    inv_year: "",
    inv_description: "",
    inv_image: "",
    inv_thumbnail: "",
    inv_price: "",
    inv_miles: "",
    inv_color: ""
  })
}

/* ***************************
 *  Process Add Inventory
 * ************************** */
invCont.addInventory = async function (req, res, next) {
  const {
    classification_id,
    inv_make,
    inv_model,
    inv_year,
    inv_description,
    inv_image,
    inv_thumbnail,
    inv_price,
    inv_miles,
    inv_color
  } = req.body

  try {
    const addResult = await invModel.addInventory(
      classification_id,
      inv_make,
      inv_model,
      inv_year,
      inv_description,
      inv_image,
      inv_thumbnail,
      inv_price,
      inv_miles,
      inv_color
    )

    if (addResult) {
      const nav = await utilities.getNav()
      req.flash(
        "notice",
        `Successfully added ${inv_year} ${inv_make} ${inv_model} to inventory.`
      )
      return res.status(201).render("inventory/management", {
        title: "Inventory Management",
        nav,
        errors: null
      })
    }

    // Insert failed
    const nav = await utilities.getNav()
    const classificationList = await utilities.buildClassificationList(classification_id)
    req.flash("notice", "Failed to add vehicle. Please try again.")
    return res.status(500).render("inventory/add-inventory", {
      title: "Add New Vehicle",
      nav,
      classificationList,
      errors: [],
      classification_id,
      inv_make,
      inv_model,
      inv_year,
      inv_description,
      inv_image,
      inv_thumbnail,
      inv_price,
      inv_miles,
      inv_color
    })
  } catch (error) {
    console.error("addInventory error:", error)
    const nav = await utilities.getNav()
    const classificationList = await utilities.buildClassificationList(classification_id)
    req.flash("notice", "An error occurred while adding the vehicle.")
    return res.status(500).render("inventory/add-inventory", {
      title: "Add New Vehicle",
      nav,
      classificationList,
      errors: [],
      classification_id,
      inv_make,
      inv_model,
      inv_year,
      inv_description,
      inv_image,
      inv_thumbnail,
      inv_price,
      inv_miles,
      inv_color
    })
  }
}

module.exports = invCont
