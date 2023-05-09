// Get the modal
var modal = document.getElementById("myModal");

// Get the button that opens the modal // When the user clicks on the button, open the modal
document.getElementById("settings_button").onclick = function() {
  modal.style.display = "block";
  document.getElementById("bonsaiModeButton").focus();
  LeaveVimCmdMode();
};

function closeSettings() {
  modal.style.display = "none";
};

// Get the <span> element that closes the modal
document.getElementsByClassName("close")[0].addEventListener("click", closeSettings);


// When the user clicks anywhere outside of the modal, close it
window.onclick = function(event) {
  if (event.target == modal) {
    modal.style.display = "none";
  }
}
