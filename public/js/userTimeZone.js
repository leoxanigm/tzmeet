/** Time zone class that handles users' time zone preference */
class Timezone {
  #format = '12';

  /**
   * Initialize time and time zone
   * @param {object} searchData
   */
  constructor(searchData) {
    // imported json data (script tag)
    this.searchData = searchData;

    // Get user's timezone from local storage
    const zoneName = getFromLocalStorage('zoneName');
    if (zoneName) {
      this.zone = zoneName;
    }
    // Get user's time format from local storage
    const format = getFromLocalStorage('format');
    if (format) {
      this.format = format;
    }
  }

  /**
   * Get current time in 24h or 12h format
   * @return {string} current time
   */
  get time() {
    const format = this.#format == '24' ? 'HH:mm' : 'hh:mm a';
    return luxon.DateTime.local().toFormat(format);
  }

  get timeObj() {
    return luxon.DateTime.local();
  }

  /**
   * Set time format
   * @param {string} format 12 or 24
   */
  set format(format) {
    format == '24' ? (this.#format = '24') : (this.#format = '12');
    saveToLocalStorage('format', this.#format);
  }

  /**
   * Get time format
   * @return {string} 12 or 24
   */
  get format() {
    return this.#format;
  }

  /**
   * Get time zone
   * @return {string} time zone name
   */
  get zone() {
    return luxon.Settings.defaultZone.name;
  }

  /**
   * Get time zone alternative name
   * @return {string} time zone alternative name
   */
  get zoneAlternativeName() {
    const zoneLocation = luxon.IANAZone.create(this.zone);
    return zoneLocation.offsetName(0, { format: 'long' });
  }

  /**
   * Set time zone and save to local storage
   * @param {string} zoneName time zone name
   */
  set zone(zoneName) {
    luxon.Settings.defaultZone = zoneName;
    saveToLocalStorage('zoneName', zoneName);
  }

  /**
   * Search for time zone
   * @param {string} searchTerm search term
   * @return {array} array of alternative name, current time at the zone and zone name
   */
  searchLocation(searchTerm) {
    searchTerm = searchTerm.replace(/[[\]&/\\#,+()$~%.^'":*?<>{}]/g, '').trim();

    if (searchTerm.length < 2) return [];

    const filtered = this.searchData.filter((zone) => {
      return zone[0].match(
        new RegExp(`(?<=\\|).*?(${searchTerm}).*?(?=\\|)`, 'i')
      );
    });
    const result = filtered.map((zone) => {
      const [, zoneName] = zone;
      const zoneLocation = luxon.IANAZone.create(zoneName);
      const offsetName = zoneLocation.offsetName(0, { format: 'long' });
      const timeAt = luxon.DateTime.local()
        .setZone(zoneName)
        .toFormat('hh:mm a');
      return [offsetName, timeAt, zoneName];
    });
    return result;
  }
}

/**
 * Updates time every half second
 * @param {Timezone} TZ Timezone object
 */
function updateTimeDisplay(TZ) {
  // Get time display elements
  const hour = getNodes('.time-now .hour');
  const minute = getNodes('.time-now .minute');
  const meridiem = getNodes('.time-now .meridiem');
  const secondTicker = getNodes('.time-now .second');
  const formatToggle = getNodes('.time-format-toggle');

  let newTimeNow = TZ.time;

  // Change time display based on format
  if (TZ.format === '24') {
    // Hide am/pm toggle
    meridiem.style.visibility = 'hidden';

    // Set time
    [hour.textContent, minute.textContent] = newTimeNow.split(':');

    formatToggle.querySelector('[value="24"]').checked = true;
  } else {
    // Show am/pm toggle
    meridiem.style.visibility = 'visible';

    // Toggle am/pm
    const amOrPm = newTimeNow.slice(-2);
    newTimeNow = newTimeNow.slice(0, -3);
    meridiem.textContent = amOrPm;
    [hour.textContent, minute.textContent] = newTimeNow.split(':');

    formatToggle.querySelector('[value="12"]').checked = true;
  }

  secondTicker.classList.contains('hide')
    ? secondTicker.classList.remove('hide')
    : secondTicker.classList.add('hide');
}

/**
 * Initialize time zone input display and zone name hidden value
 * @param {Timezone} TZ Timezone object
 */
function initTimezoneInput(TZ) {
  getNodes('#time-zone-input').value = TZ.zoneAlternativeName;
  getNodes('#zone-name').value = TZ.zone;
}

/**
 * Update time format
 * @param {Event} e HTML radio button change event
 * @param {Timezone} TZ Timezone object
 */
function modifyFormat(e, TZ) {
  TZ.format = e.target.value;
  updateTimeDisplay(TZ);
}

/**
 * Displays and updates search result list
 * @param {Event} e HTML input event
 * @param {Timezone} TZ
 */
function updateSearchResult(e, TZ) {
  const result = TZ.searchLocation(e.target.value);
  const list = getNodes('#time-zone-list');

  e.target.value.length < 2
    ? list.classList.add('hidden')
    : list.classList.remove('hidden');

  list.innerHTML = '';

  result.forEach((zone) => {
    const [offsetName, timeAt, zoneName] = zone;
    const li = document.createElement('li');
    li.textContent = `${offsetName}, Now: ${timeAt}`;
    li.addEventListener('click', (e) => {
      TZ.zone = zoneName;
      list.classList.add('hidden');
      initTimezoneInput(TZ);
      updateTimeDisplay(TZ);
    });
    list.appendChild(li);
  });
}

function initTimezone(TZ) {
  // Update time display every half second
  setInterval(() => updateTimeDisplay(TZ), 500);

  // Initialize time zone input
  initTimezoneInput(TZ);

  // Toggle time format
  getNodes('input[name="time-format"]').forEach((radio) => {
    radio.addEventListener('change', (e) => modifyFormat(e, TZ));
  });

  // Toggle search results either from input or button
  const searchContainer = getNodes('#time-zone-select');
  const searchInput = getNodes('#time-zone-input');
  searchContainer.addEventListener('click', (e) => {
    getNodes('#time-zone-list').classList.remove('hidden');
    searchInput.focus();
    searchInput.value = '';
  });

  // Search for time zone
  searchInput.addEventListener('input', (e) => updateSearchResult(e, TZ));

  // Hide search results when clicked elsewhere
  document.addEventListener('click', (e) => {
    if (e.target.closest('#time-zone-select')) return;
    getNodes('#time-zone-list').classList.add('hidden');
    initTimezoneInput(TZ);
  });
}
