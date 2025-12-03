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
  const classificationSelect = await utilities.buildClassificationList()

  return res.render("inventory/management", {
    title: "Inventory Management",
    nav,
    errors: null,
    classificationSelect,
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
    errors: [],
    classification_name: "",
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
      req.flash("notice", `Successfully added classification: ${classification_name}`)
      // ✅ Let /inv/ rebuild the management view (with classificationSelect)
      return res.redirect("/inv/")
    }

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
    inv_color: "",
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
    inv_color,
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
      req.flash(
        "notice",
        `Successfully added ${inv_year} ${inv_make} ${inv_model} to inventory.`
      )
      // ✅ Redirect so buildManagementView builds classificationSelect
      return res.redirect("/inv/")
    }

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
      inv_color,
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
      inv_color,
    })
  }
}

/* ***************************
 *  Return Inventory by Classification As JSON
 * ************************** */
invCont.getInventoryJSON = async (req, res, next) => {
  const classification_id = parseInt(req.params.classification_id)
  const invData = await invModel.getInventoryByClassificationId(classification_id)
  if (invData[0].inv_id) {
    return res.json(invData)
  } else {
    next(new Error("No data returned"))
  }
}

/* ***************************
 *  Build edit inventory view
 * ************************** */
invCont.buildEditInventoryView = async function (req, res, next) {
  const inv_id = parseInt(req.params.inv_id)
  let nav = await utilities.getNav()
  const itemData = await invModel.getInventoryByInvId(inv_id)

  if (!itemData) {
    const error = new Error("Vehicle not found")
    error.status = 404
    return next(error)
  }

  const classificationSelect = await utilities.buildClassificationList(
    itemData.classification_id
  )

  const itemName = `${itemData.inv_make} ${itemData.inv_model}`

  res.render("inventory/edit-inventory", {
    title: "Edit " + itemName,
    nav,
    classificationSelect,
    errors: null,
    inv_id: itemData.inv_id,
    inv_make: itemData.inv_make,
    inv_model: itemData.inv_model,
    inv_year: itemData.inv_year,
    inv_description: itemData.inv_description,
    inv_image: itemData.inv_image,
    inv_thumbnail: itemData.inv_thumbnail,
    inv_price: itemData.inv_price,
    inv_miles: itemData.inv_miles,
    inv_color: itemData.inv_color,
    classification_id: itemData.classification_id,
  })
}

/* ***************************
 *  Build delete confirmation view
 * ************************** */
invCont.buildDeleteInventoryView = async function (req, res, next) {
  const inv_id = parseInt(req.params.inv_id)
  let nav = await utilities.getNav()
  const itemData = await invModel.getInventoryByInvId(inv_id)

  if (!itemData) {
    const error = new Error("Vehicle not found")
    error.status = 404
    return next(error)
  }

  const itemName = `${itemData.inv_make} ${itemData.inv_model}`

  res.render("inventory/delete-confirm", {
    title: "Delete " + itemName,
    nav,
    errors: null,
    inv_id: itemData.inv_id,
    inv_make: itemData.inv_make,
    inv_model: itemData.inv_model,
    inv_year: itemData.inv_year,
    inv_price: itemData.inv_price,
  })
}

/* ***************************
 *  Update Inventory Data
 * ************************** */
invCont.updateInventory = async function (req, res, next) {
  let nav = await utilities.getNav()

  const {
    inv_id,
    inv_make,
    inv_model,
    inv_description,
    inv_image,
    inv_thumbnail,
    inv_price,
    inv_year,
    inv_miles,
    inv_color,
    classification_id,
  } = req.body

  const updateResult = await invModel.updateInventory(
    inv_id,
    inv_make,
    inv_model,
    inv_description,
    inv_image,
    inv_thumbnail,
    inv_price,
    inv_year,
    inv_miles,
    inv_color,
    classification_id
  )

  if (updateResult) {
    const itemName = `${inv_make} ${inv_model}`
    req.flash("notice", `The ${itemName} was successfully updated.`)
    return res.redirect("/inv/")
  } else {
    const classificationSelect = await utilities.buildClassificationList(classification_id)
    const itemName = `${inv_make} ${inv_model}`

    req.flash("notice", "Sorry, the update failed.")
    return res.status(501).render("inventory/edit-inventory", {
      title: "Edit " + itemName,
      nav,
      classificationSelect,
      errors: null,
      inv_id,
      inv_make,
      inv_model,
      inv_year,
      inv_description,
      inv_image,
      inv_thumbnail,
      inv_price,
      inv_miles,
      inv_color,
      classification_id,
    })
  }
}

/* ***************************
 *  Delete Inventory Data
 * ************************** */
invCont.deleteInventory = async function (req, res, next) {
  const inv_id = parseInt(req.body.inv_id, 10)
  const { inv_make, inv_model } = req.body
  const itemName = `${inv_make} ${inv_model}`

  const deleteResult = await invModel.deleteInventory(inv_id)

  if (deleteResult) {
    req.flash("notice", `The ${itemName} was successfully deleted.`)
    return res.redirect("/inv/")
  } else {
    req.flash("notice", "Sorry, the delete failed.")
    return res.redirect(`/inv/delete/${inv_id}`)
  }
}

module.exports = invCont
