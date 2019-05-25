'use strict';

function myFunction() {
  let menu = document.getElementById("topNav");
  if (menu.className === "nav") {
    menu.className += " responsive";
  } else {
    menu.className = "nav";
  }
}