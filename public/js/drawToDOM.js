const drawCalenderHeader = (calHeader, display, TZ, calStart) => {
  if (display === 'week') {
    const emptyCell = document.createElement('div');
    emptyCell.classList.add('col', 'hour-labels');
    calHeader.appendChild(emptyCell);
  }

  // Add days (name and number) to calendar header
  // We can directly use calStart, but it will be modified in the loop,
  // so we use a copy of it
  let weekStart = luxon.DateTime.fromISO(calStart.toISO());

  for (let i = 0; i < 7; i++) {
    const dayNode = document.createElement('div');
    dayNode.classList.add('col', 'day');

    if (weekStart.hasSame(TZ.timeObj, 'day')) {
      dayNode.classList.add('current-day');
    }

    dayNode.innerHTML = `<span class="day-name">${weekStart.toFormat(
      'ccc'
    )}</span>`;

    if (display === 'week') {
      dayNode.innerHTML += `<span class="day-number">${weekStart.day}</span>`;
    }

    calHeader.appendChild(dayNode);
    weekStart = weekStart.plus({ days: 1 });
  }
};

const drawWeekCalendar = (calHeader, calBody, TZ, calStart) => {
  calHeader.classList.remove('month');

  const hourFormat = TZ.format === '24' ? 'HH:mm' : 'hh:mm a';
  const dayStart = calStart.startOf('day');

  const hourContainer = document.createElement('div');
  hourContainer.className = 'hours';

  // Add 24 hour rows to calendar body
  for (let i = 0; i < 24; i++) {
    const hourNode = document.createElement('div');
    hourNode.classList.add('hour');

    if (TZ.timeObj.toFormat('H') === i.toString()) {
      hourNode.classList.add('current-hour');
    }

    hourNode.textContent = dayStart.plus({ hours: i }).toFormat(hourFormat);

    hourContainer.appendChild(hourNode);
  }
  calBody.appendChild(hourContainer);

  const divisionsContainer = document.createElement('div');
  divisionsContainer.className = 'divisions';
  calBody.appendChild(divisionsContainer);
};

const drawMonthCalendar = (calHeader, calBody, TZ, calStart) => {
  calHeader.classList.add('month');

  // We can directly use calStart, but it will be modified in the loop,
  // so we use a copy of it
  let monthStart = luxon.DateTime.fromISO(calStart.toISO());

  // Add 6 rows of 7 days to calendar body
  for (let i = 0; i < 6; i++) {
    const rowNode = document.createElement('div');
    rowNode.classList.add('row', 'week');

    for (let j = 0; j < 7; j++) {
      const dayNode = document.createElement('div');
      dayNode.classList.add('day', 'col');

      if (!monthStart.hasSame(TZ.timeObj, 'month')) {
        dayNode.classList.add('not-current-month');
      } else if (monthStart.hasSame(TZ.timeObj, 'day')) {
        dayNode.classList.add('current-day');
      }

      const dateDiv = document.createElement('div');
      dateDiv.classList.add('date');
      dateDiv.textContent = monthStart.day;

      const divisionsContainer = document.createElement('div');
      divisionsContainer.className = 'divisions';

      dayNode.appendChild(dateDiv);
      dayNode.appendChild(divisionsContainer);
      rowNode.appendChild(dayNode);

      monthStart = monthStart.plus({ days: 1 });
    }
    calBody.appendChild(rowNode);
  }
};

const drawCalendar = (calHeader, calBody, TZ, calStart, display) => {
  drawCalenderHeader(calHeader, display, TZ, calStart);
  if (display === 'week') {
    drawWeekCalendar(calHeader, calBody, TZ, calStart);
  } else {
    drawMonthCalendar(calHeader, calBody, TZ, calStart);
  }
};

const drawDiv = (week) => {};
