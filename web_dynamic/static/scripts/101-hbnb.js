const url = 'http://0.0.0.0:5001/api/v1/status/';
const urlPS = 'http://0.0.0.0:5001/api/v1/places_search/';
const urlPR = 'http://0.0.0.0:5001/api/v1/places/<place_id>/reviews/';
const urlPA = 'http://0.0.0.0:5001/api/v1/places/<place_id>/amenities/';
const urlUsers = 'http://0.0.0.0:5001/api/v1/users/';

function createArticle (place) {
  return `
    <article id="${place.id}">
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

    <div class="amenities">
      <h2>Amenities</h2>
      <ul></ul>
    </div>

    <div class="reviews">
      <h2>Reviews</h2>
      <span>hide</span>
      <ul data-placeid="${place.id}"></ul>
    </div>
    </article>
  `;
}

function createReview (users, months, review) {
  const user = users[review.user_id];
  const fullname = (user && user.first_name + ' ' + user.last_name) || 'user';
  const date = new Date(review.created_at);
  const day = date.getDate();
  const month = months[date.getMonth()];
  const fmtDate = `of ${month} ${date.getFullYear()}`;
  let ordinal = 'th';

  if (day <= 10 && day >= 20) {
    switch (day % 10) {
      case 1: ordinal = 'st'; break;
      case 2: ordinal = 'nd'; break;
      case 3: ordinal = 'rd'; break;
      default: ordinal = 'th';
    }
  }

  return `
    <li>
      <h3>From: ${fullname} the ${day}${ordinal} ${fmtDate}</h3>
      <p>${review.text}</p>
    </li>
  `;
}

function fetchAmenityAndReviews (place) {
  const art = $(`#${place.id}`);
  const aList = art.find('.amenities ul');
  const rList = art.find('.reviews ul');
  const placeId = rList.attr('data-placeid');
  const revUrl = urlPR.replace('<place_id>', placeId);
  const amUrl = urlPA.replace('<place_id>', placeId);

  $.get(amUrl, data => data.forEach(a => aList.append(`<li class="tv">${a.name}</li>`)));

  $.get(revUrl, data => {
    data.forEach(r => rList.append(createReview(users, months, r)));
    art.find('.reviews h2').text(`${data.length} Review${data.length > 1 || data.length === 0 ? 's' : ''}`);
  });
}

function addReviewListeners () {
  $('.reviews span').click(function () {
    const domRList = $(this).parent().find('ul');
    const spanText = $(this).text();
    let disp = 'inherit';

    if (spanText === 'hide') disp = 'none';

    domRList.find('li').css('display', disp);

    const newText = (spanText === 'show') ? 'hide' : 'show';
    $(this).text(newText);
  });
}

function handlePlacesResponse (data) {
  $('section.places').html('');
  data.forEach(place => {
    $('section.places').append(createArticle(place));
    fetchAmenityAndReviews(place);
  });
  addReviewListeners();
}

function getIds (dict) {
  return Object.keys(dict).filter(id => typeof (dict[id]) === 'string');
}

function sendPost (url, data, cb) {
  $.ajax({
    type: 'POST',
    url: url,
    data: JSON.stringify(data),
    success: cb,
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
const users = {};
const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

$(document).ready(() => {
  inputListeners('.amenityCheck', '.amenities h4', checkedAmenities, [checkedAmenities]);
  inputListeners('.stateCheck', '.locations h4', checkedStates, [checkedStates, checkedCities]);
  inputListeners('.cityCheck', '.locations h4', checkedCities, [checkedStates, checkedCities]);

  $.get(url, function (data) {
    const cls = 'available';
    const apiStatus = $('div#api_status');
    if (data.status === 'OK') { apiStatus.addClass(cls); } else { apiStatus.removeClass(cls); }
  });

  $.get(urlUsers, data => data.forEach(u => { users[u.id] = u; }));

  sendPost(urlPS, {}, handlePlacesResponse);

  $('.container .filters button').click(() => {
    $('section.places').html('');
    const filters = {
      amenities: getIds(checkedAmenities),
      states: getIds(checkedStates),
      cities: getIds(checkedCities)
    };
    sendPost(urlPS, filters, handlePlacesResponse);
  });
});
