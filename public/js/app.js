document.addEventListener('DOMContentLoaded', () => {
  const TZ = new Timezone(searchData); // searchData is loaded in a script tag

  initTimezone(TZ);
  initCalendar(TZ);
});
