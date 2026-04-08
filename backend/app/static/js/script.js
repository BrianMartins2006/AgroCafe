function openModal() {
  document.querySelector(".modal-container").style.display = "flex";
}

function closeModal() {
  document.querySelector(".modal-container").style.display = "none";
}

window.onclick = function(event) {
  const modal = document.querySelector(".modal-container");
  if (event.target === modal) {
    closeModal();
  }
}