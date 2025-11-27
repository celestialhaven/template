// Needed Resources 
const express = require("express")
const router = new express.Router()
const invController = require("../controllers/invController")
const utilities = require("../utilities")
const invValidate = require("../utilities/inventory-validation")

/* **************
 * Inventory Views
 * ************** */

// View inventory by classification
router.get(
  "/type/:classificationId",
  utilities.handleErrors(invController.buildByClassificationId)
)

// View inventory details
router.get(
  "/detail/:invId",
  utilities.handleErrors(invController.buildByInvId)
)

// Inventory management dashboard
router.get(
  "/",
  utilities.handleErrors(invController.buildManagementView)
)

/* **************
 * Task 2 — Add Classification
 * ************** */

// Show form
router.get(
  "/add-classification",
  utilities.handleErrors(invController.buildAddClassificationView)
)

// Process submission
router.post(
  "/add-classification",
  invValidate.classificationRules(),
  invValidate.checkClassificationData,
  utilities.handleErrors(invController.addClassification)
)

/* **************
 * Task 3 — Add Inventory
 * ************** */

// Show form
router.get(
  "/add-inventory",
  utilities.handleErrors(invController.buildAddInventoryView)
)

// Process submission
router.post(
  "/add-inventory",
  invValidate.inventoryRules(),
  invValidate.checkInventoryData,
  utilities.handleErrors(invController.addInventory)
)

/* **************
 * Export routes
 * ************** */
module.exports = router
