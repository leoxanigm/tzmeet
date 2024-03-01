const { createAppend } = require('./helpers');

const drawCalenderHeader = (calHeader, display, TZ, calStart) => {
  if (display === 'week') {
    createAppend(calHeader, 'div', '', ['col', 'day', 'hour-labels']);
  }

  // Add days (name and number) to calendar header
  // We can directly use calStart, but it will be modified in the loop,
  // so we use a copy of it
  let weekStart = calStart.startOf('week');

  for (let i = 0; i < 7; i++) {
    const dayClassList =
      weekStart.hasSame(TZ.timeObj, 'day') && display === 'week'
        ? ['col', 'day', 'current-day']
        : ['col', 'day'];

    const dayNode = createAppend(calHeader, 'div', '', dayClassList);
    createAppend(dayNode, 'span', weekStart.toFormat('ccc'), ['day-name']);

    if (display === 'week') {
      createAppend(dayNode, 'span', weekStart.day, ['day-number']);
    }

    weekStart = weekStart.plus({ days: 1 });
  }
};

const drawWeekCalendar = (calHeader, calBody, TZ, calStart) => {
  calHeader.classList.remove('month');
  calBody.classList.remove('month');

  const hourFormat = TZ.format === '24' ? 'HH:mm' : 'hh:mm a';
  const dayStart = calStart.startOf('day');

  const hourContainer = createAppend(calBody, 'div', '', ['hours']);

  // Add 24 hour rows to calendar body
  for (let i = 0; i < 24; i++) {
    const classList =
      TZ.timeObj.toFormat('H') === i.toString()
        ? ['hour', 'current-hour']
        : ['hour'];

    createAppend(
      hourContainer,
      'div',
      dayStart.plus({ hours: i }).toFormat(hourFormat),
      classList
    );
  }

  createAppend(calBody, 'div', '', ['divisions']);
};

const drawMonthCalendar = (calHeader, calBody, TZ, calStart) => {
  calHeader.classList.add('month');
  calBody.classList.add('month');

  // We can directly use calStart, but it will be modified in the loop,
  // so we use a copy of it
  let monthStart = calStart.startOf('week');

  // Sometimes, the first week of the month is the last week of the previous month
  // hence, we add one week to get the actual current working month
  const currMonth = calStart.plus({ weeks: 1 });

  // Add 6 rows of 7 days to calendar body
  for (let i = 0; i < 6; i++) {
    const rowNode = createAppend(calBody, 'div', '', ['row', 'week']);

    for (let j = 0; j < 7; j++) {
      const dayNode = createAppend(rowNode, 'div', '', ['day', 'col']);

      if (!monthStart.hasSame(currMonth, 'month')) {
        dayNode.classList.add('not-current-month');
      } else if (monthStart.hasSame(TZ.timeObj, 'day')) {
        dayNode.classList.add('current-day');
      }

      const dayText =
        monthStart.day == 1 ? monthStart.toFormat('LLL d') : monthStart.day;
      createAppend(dayNode, 'div', dayText, ['date']);

      monthStart = monthStart.plus({ days: 1 });
    }
  }
  createAppend(calBody, 'div', '', ['divisions']);
};

/**
 * Draws the calendar header and body
 * @param {HTMLElement} calHeader The calendar header element
 * @param {HTMLElement} calBody The calendar body element
 * @param {Timezone} TZ The timezone object
 * @param {DateTime} calStart The start of the currently displayed calendar
 * @param {string} display The display mode ('week' or 'month')
 */
const drawCalendar = (calHeader, calBody, TZ, calStart, display) => {
  drawCalenderHeader(calHeader, display, TZ, calStart);
  if (display === 'week') {
    drawWeekCalendar(calHeader, calBody, TZ, calStart);
  } else {
    drawMonthCalendar(calHeader, calBody, TZ, calStart);
  }
};

/**
 * Draws a div at the given coordinates
 * @param {HTMLElement} container The container to append the div to
 * @param {number} x The x-coordinate of the div
 * @param {number} y The y-coordinate of the div
 * @param {number} width The width of the div
 * @param {number} height The height of the div
 * @param {string} className The class name of the div
 * @returns {HTMLElement} The drawn div
 */
const drawDiv = (container, x, y, width, height, classList, text = '') => {
  const divToDraw = createAppend(container, 'div', '', classList);

  if (text) {
    const timeLabelClass = ['time-label'];
    if (x > container.offsetWidth / 2) {
      timeLabelClass.push('left');
    }
    if (y > container.offsetHeight / 2) {
      timeLabelClass.push('top');
    }
    createAppend(divToDraw, 'span', text, timeLabelClass);
  }

  divToDraw.style.left = `${x}px`;
  divToDraw.style.top = `${y}px`;
  divToDraw.style.width = `${width}px`;
  divToDraw.style.height = `${height}px`;

  return divToDraw;
};

module.exports = { drawCalendar, drawDiv };
