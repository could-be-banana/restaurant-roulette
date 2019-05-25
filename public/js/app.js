'use strict';

function myFunction() {
  let menu = document.getElementById("topNav");
  if (menu.className === "nav") {
    menu.className += " responsive";
  } else {
    menu.className = "nav";
  }
}





  $('form').hide();
  $('.show-form').on('click', function(e) {
    e.preventDefault();
    e.stopPropagation();
    let showform = "." + $(this).val();
    console.log($(e.target).parent());
    $(this).hide();
    if(showform === "."){
      $('form').show()
    } else {
      $(`${shmowSingleFor}`).show();
    }
  });




  






















  

});