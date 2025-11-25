
// Optional: Toggle password visibility
const togglePassword = document.getElementById("togglePassword")
const passwordInput = document.getElementById("account_password")

if (togglePassword && passwordInput) {
    togglePassword.addEventListener("click", () => {
        const currentType = passwordInput.getAttribute("type")
        const newType = currentType === "password" ? "text" : "password"
        passwordInput.setAttribute("type", newType)
        togglePassword.textContent = newType === "password" ? "Show Password" : "Hide Password"
    })
}
