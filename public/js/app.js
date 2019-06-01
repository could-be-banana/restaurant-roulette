'use strict';

function myFunction() {
  let menu = document.getElementById("topNav");
  if (menu.className === "nav") {
    menu.className += " responsive";
  } else {
    menu.className = "nav";
  }
}

// $('form').hide();

//   $('.show-form').on('click', function(e) {

//     e.preventDefault();

//     e.stopPropagation();





//     let showSingleForm = "." + $(this).val();

//     console.log($(e.target).parent());

//     $(this).hide();

//     if(showSingleForm === "."){

//       $('form').show()

//     } else {

//       $(`${showSingleForm}`).show();



//     }

//   });



  

// });

// Reveals form
function revealForm(event) {
  const clickedOn = event.target;
  if (event.target.textContent === 'Select this Restaurant') {
    $(clickedOn).parent().find('form').removeClass('hidden');
  }
}

// Hides form
function hideForm(event) {
  const clickedOn = event.target;
  if (event.target.textContent === 'Hide Form') {
    console.log(event.target);
    $(clickedOn).parent().addClass('hidden');
  }
}

$('.add-form').on('click', (event) => {
  revealForm(event);
  hideForm(event);
});
