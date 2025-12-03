// Needed Resources 
const express = require("express")
const router = new express.Router()
const invController = require("../controllers/invController")
const utilities = require("../utilities")
const invValidate = require("../utilities/inventory-validation")

/* **************
 * Public Inventory Views
 * ************** */

// View inventory by classification (PUBLIC)
router.get(
  "/type/:classificationId",
  utilities.handleErrors(invController.buildByClassificationId)
)

// View inventory details (PUBLIC)
router.get(
  "/detail/:invId",
  utilities.handleErrors(invController.buildByInvId)
)

/* **************
 * Protected Inventory Management Views
 * ************** */

// Inventory management dashboard (EMPLOYEE / ADMIN ONLY)
router.get(
  "/",
  utilities.checkEmployeeOrAdmin,
  utilities.handleErrors(invController.buildManagementView)
)

/* ***************************
 *  Get inventory by classification as JSON
 *  (used by management page – PROTECTED)
 * ************************** */
router.get(
  "/getInventory/:classification_id",
  utilities.checkEmployeeOrAdmin,
  utilities.handleErrors(invController.getInventoryJSON)
)

/* ***************************
 *  Edit inventory item view
 *  URL example: /inv/edit/3  (PROTECTED)
 * ************************** */
router.get(
  "/edit/:inv_id",
  utilities.checkEmployeeOrAdmin,
  utilities.handleErrors(invController.buildEditInventoryView)
)

/* ***************************
 *  Delete inventory item view
 *  URL example: /inv/delete/3  (PROTECTED)
 * ************************** */
router.get(
  "/delete/:inv_id",
  utilities.checkEmployeeOrAdmin,
  utilities.handleErrors(invController.buildDeleteInventoryView)
)

/* **************
 * Task 2 — Add Classification (PROTECTED)
 * ************** */

// Show form
router.get(
  "/add-classification",
  utilities.checkEmployeeOrAdmin,
  utilities.handleErrors(invController.buildAddClassificationView)
)

// Process submission
router.post(
  "/add-classification",
  utilities.checkEmployeeOrAdmin,
  invValidate.classificationRules(),
  invValidate.checkClassificationData,
  utilities.handleErrors(invController.addClassification)
)

/* **************
 * Task 3 — Add Inventory (PROTECTED)
 * ************** */

// Show form
router.get(
  "/add-inventory",
  utilities.checkEmployeeOrAdmin,
  utilities.handleErrors(invController.buildAddInventoryView)
)

// Process submission
router.post(
  "/add-inventory",
  utilities.checkEmployeeOrAdmin,
  invValidate.inventoryRules(),
  invValidate.checkInventoryData,
  utilities.handleErrors(invController.addInventory)
)

/* **************
 *  Update Inventory (PROTECTED)
 * ************** */
router.post(
  "/update",
  utilities.checkEmployeeOrAdmin,
  invValidate.inventoryRules(),
  invValidate.checkUpdateData,        // uses the update-specific validator
  utilities.handleErrors(invController.updateInventory)
)

/* **************
 *  Delete Inventory (POST, PROTECTED)
 * ************** */
router.post(
  "/delete",
  utilities.checkEmployeeOrAdmin,
  utilities.handleErrors(invController.deleteInventory)
)

/* **************
 * Export routes
 * ************** */
module.exports = router
