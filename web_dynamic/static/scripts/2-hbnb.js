$(document).ready(function () {
  let dict = {};
  $('input:checkbox').change(function () {
    if ($(this).is(':checked')) {
      dict[$(this).attr('data-id')] = $(this).attr('data-name');
    } else {
      delete dict.$(this).attr('data-id');
    }
    $('DIV.amenities.h4').text(function () {
      let keys = Object.keys(dict);
      return keys.join(', ');
    });
  });

  $.get('http://0.0.0.0:5001/api/v1/status/', function (data) {
    if (data.status === 'OK') {
      $('DIV#api_status').addClass('available');
    }
    else {
       $('DIV#api_status').removeClass('available');
    }
  });
});
