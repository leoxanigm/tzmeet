const {
  fetchSearchData,
  showAlert,
  getNodes,
  copyToClipboard,
  autoSelect,
} = require('./helpers');
const initTimezone = require('./userTimezone');
const initCalendar = require('./calendar');
const initCalendarForm = require('./calendarForm');
const showScheduleMatches = require('./scheduleMatches');
const initJoinForm = require('./joinForm');

document.addEventListener('DOMContentLoaded', async () => {
  let TZ, calendar, duration, display, title;

  if (getNodes('#time-zone-field')) {
    TZ = initTimezone(await fetchSearchData());
  }

  const params = new URLSearchParams(window.location.search);

  const durationDisplayInfo = getNodes('.duration-display-info');
  if (durationDisplayInfo) {
    duration = durationDisplayInfo.getAttribute('data-duration');
    display = durationDisplayInfo.getAttribute('data-display');
    title = durationDisplayInfo.getAttribute('data-title');
  } else {
    duration = '60';
    display = 'week';
    title = '';
  }
  if (getNodes('.join-schedule-form')) {
    // join schedule form
    initJoinForm();
  } else if (params.has('meetingCode') && params.has('showMatching')) {
    // schedule match page

    duration = parseInt(duration);

    showScheduleMatches(params.get('meetingCode'), title, duration, TZ.format);

    // Add event listener to meetingCode
    copyToClipboard('button.copy-code');
  } else if (params.has('meetingCode')) {
    // join schedule page

    // Add event listener to meetingCode
    copyToClipboard('button.copy-code');

    const durationDisplayInfo = getNodes('.duration-display-info');

    if (durationDisplayInfo) {
      const display = durationDisplayInfo.getAttribute('data-display');
      const duration = durationDisplayInfo.getAttribute('data-duration');

      calendar = initCalendar(TZ, display, duration);
      initCalendarForm(calendar, params.get('meetingCode'));
    } else {
      showAlert('Invalid meeting code', 'danger');
    }
  } else if (getNodes('#calendar-form')) {
    // start schedule page
    calendar = initCalendar(TZ);
    initCalendarForm(calendar);
  }
  
  // Enable auto select for meeting code and link
  autoSelect();
});
