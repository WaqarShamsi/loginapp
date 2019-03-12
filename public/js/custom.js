//Make connection
var socket = io();

$('#send').on('click', function () {
   socket.emit('chat', {
      message: $('#userMsg').val(),
      handle: $('#userName').val()
   });
});

socket.on('chat', function (data) {
   var html = '<p><strong>' + data.handle + ':</strong> '+ data.message +'</p>';
   $('#outputChat').append(html);
});

function alertFunc(type, message) {
   $('.alertFunc').hide();
   let message_html = $('<div class="alert alert-'+ type +' alertFunc">'+ message +'</div>').fadeIn(5000);
   $('.teal').append(message_html);
   setTimeout(function() {
      $(".alertFunc").hide();
   }, 5000);
}

$('#addProperty').on('submit', function(e){
   socket.emit('addProperty', {
      propertyName: $('#name').val(),
      //propertyImg: $('#image').val(),
      propertyLoc: $('#location').val(),
      propertyDesc: $('#description').val()
   });
});

socket.on('addProperty', function (data) {
   var html = '<div class="col-md-6"><div class="card flex-md-row mb-4 box-shadow h-md-250"><div class="card-body d-flex flex-column align-items-start"><strong class="d-inline-block mb-2 text-primary">'+ data.propertyLoc +'</strong><h3 class="mb-0"><a class="text-dark" href="#">'+ data.propertyName +'</a></h3><div class="mb-1 text-muted"><em>Just added</em></div><p class="card-text mb-auto">'+ data.propertyDesc +'</p></div><img class="card-img-right flex-auto d-none d-md-block" data-src="holder.js/200x250?theme=thumb" alt="Thumbnail [200x250]" style="width: 200px; height: 250px;" src="https://via.placeholder.com/200x250.png?text=Visit+ClickToGetDetails" data-holder-rendered="true"></div></div>';
   $('#propertiesList').prepend(html);
});

socket.on('userCount', function (data) {
   $('#userCount').html('<strong>Total Users Now:</strong> ' + data);
});


// $('#signup').on('submit', function (e) {
//    e.preventDefault();
//
//    const name = $('#signup #name').val();
//    const email = $('#signup #email').val();
//    const password = $('#signup #password').val();
//    const repeatPassword = $('#signup #repeatPassword').val();
//
//    const data = {email: email, password: password, name: name, repeat: repeatPassword};
//
//    $.ajax({
//       type: 'POST',
//       url: '/users/register',
//       data: data,
//       success: function (data) {
//           console.log(data);
//       }
//    });
// });

$('#login').on('submit', function (e) {
   e.preventDefault();

   const email = $('#login #email').val();
   const password = $('#login #password').val();

   const data = {email: email, password: password};

   $.ajax({
      type: 'POST',
      url: '/signup',
      data: data,
      success: function (data) {
          console.log(data);
      }
   });
});

