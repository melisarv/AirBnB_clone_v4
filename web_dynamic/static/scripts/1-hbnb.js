$(document).ready(function () {
  let dict = {};
  $('input:checkbox').change(function () {
    if ($(this).is(':checked')) {
      dict[$(this).attr('data-id')] = $(this).attr('data-name');
    } else {
      delete dict[$(this).attr('data-id')];
    }
    $('DIV.amenities h4').text(Object.keys(dict).join(", "))
  });
});
