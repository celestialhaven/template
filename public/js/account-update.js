// public/js/account-update.js

document.addEventListener("DOMContentLoaded", function () {
  const form = document.getElementById("account-update-form");
  if (!form) return;

  const saveBtn = document.getElementById("saveAccountBtn");

  // Capture initial values on load
  const initialValues = {
    first: form.account_firstname.value,
    last: form.account_lastname.value,
    email: form.account_email.value,
  };

  function checkIfChanged() {
    const changed =
      form.account_firstname.value !== initialValues.first ||
      form.account_lastname.value !== initialValues.last ||
      form.account_email.value !== initialValues.email;

    saveBtn.disabled = !changed;
    saveBtn.classList.toggle("btn-disabled", !changed);
  }

  // Run once on load
  checkIfChanged();

  // Add listeners for all input changes
  ["account_firstname", "account_lastname", "account_email"].forEach(
    (fieldName) => {
      form[fieldName].addEventListener("input", checkIfChanged);
      form[fieldName].addEventListener("change", checkIfChanged);
    }
  );
});
