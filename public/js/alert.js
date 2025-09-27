const alertBox = document.querySelector(".alert-message");
const cancelBtn = document.querySelector(".cancel-btn");

if (alertBox) {
  setTimeout(() => {
    alertBox.classList.add("hide");
    setTimeout(() => alertBox.remove(), 500);
  }, 2500);

  if (cancelBtn) {
    cancelBtn.addEventListener("click", () => {
      alertBox.classList.add("hide");
      setTimeout(() => alertBox.remove(), 500);
    });
  }
}