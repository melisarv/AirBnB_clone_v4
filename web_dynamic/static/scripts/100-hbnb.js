const url = 'http://0.0.0.0:5001/api/v1/status/';
const urlPS = 'http://0.0.0.0:5001/api/v1/places_search/';

function createArticle (place) {
  return `
    <article>
    <div class="title_box">
      <h2>${place.name}</h2>
      <div class="price_by_night">$${place.price_by_night}</div>
    </div>
    <div class="information">
      <div class="max_guest">${place.max_guest} Guest${place.max_guest !== 1 ? 's' : ''}</div>
      <div class="number_rooms">${place.number_rooms} Bedroom${place.number_rooms !== 1 ? 's' : ''}</div>
      <div class="number_bathrooms">${place.number_bathrooms} Bathroom${place.number_bathrooms !== 1 ? 's' : ''}</div>
    </div>
    <div class="user">
    </div>
    <div class="description">
      ${place.description}
    </div>
    </article>
  `;
}

function getPlaces (url, data) {
  $.ajax({
    type: 'POST',
    url: url,
    data: JSON.stringify(data),
    success: function (res) {
      res.forEach((place) => {
        $('section.places').append(createArticle(place));
      });
    },
    dataType: 'json',
    contentType: 'application/json'
  });
}

function inputListeners (selectorChange, selectorText, dict, dictList) {
  $(selectorChange).change(function () {
    const id = $(this).attr('data-id');
    const name = $(this).attr('data-name');
    const checked = $(this).is(':checked');
    dict[id] = (checked && name) || null;

    const names = dictList.reduce((acc, d) => [...acc, ...Object.values(d).filter(v => v !== null)], []);
    $(selectorText).text(names.join(', '));
  });
}

const checkedAmenities = {};
const checkedStates = {};
const checkedCities = {};

$(document).ready(() => {
  inputListeners('.amenityCheck', '.amenities h4', checkedAmenities, [checkedAmenities]);
  inputListeners('.stateCheck', '.locations h4', checkedStates, [checkedStates, checkedCities]);
  inputListeners('.cityCheck', '.locations h4', checkedCities, [checkedStates, checkedCities]);

  $.get(url, function (data) {
    const cls = 'available';
    const apiStatus = $('div#api_status');
    if (data.status === 'OK') { apiStatus.addClass(cls); } else { apiStatus.removeClass(cls); }
  });

  getPlaces(urlPS, {});

  $('.container .filters button').click(() => {
    $('section.places').html('');
    const filters = {};
    filters.amenities = Object.keys(checkedAmenities).filter((id) => typeof (checkedAmenities[id]) === 'string');
    filters.states = Object.keys(checkedStates).filter((id) => typeof (checkedStates[id]) === 'string');
    filters.cities = Object.keys(checkedCities).filter((id) => typeof (checkedCities[id]) === 'string');
    getPlaces(urlPS, filters);
  });
});
