'use strict';

function myFunction() {
  let menu = document.getElementById("topNav");
  if (menu.className === "nav") {
    menu.className += " responsive";
  } else {
    menu.className = "nav";
  }
}




$(document).ready(function() {
	$("body").on('click', '.top', function() {
		$("nav.menu").toggleClass("menu_show");
  });
  $('form').hide();
  $('.show-form').on('click', function(e) {
    e.preventDefault();
    e.stopPropagation();
    let showSingleForm = "." + $(this).val();
    console.log($(e.target).parent());
    $(this).hide();
    if(showSingleForm === "."){
      $('form').show()
    } else {
      $(`${showSingleForm}`).show();
    }
  });




  






















  

});