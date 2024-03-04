const router = require('express').Router();

const {
  startSchedule,
  getMeetingInfo,
  joinSchedule,
  scheduleMatches,
} = require('./controlers/schedule');
const { getSearchData } = require('./utils/helpers/misc');

router.get('/', (req, res) => {
  res.render('home');
});

router.get('/search-data', (req, res) => {
  res.json(getSearchData());
});

router.get('/join-schedule', (req, res) => {
  res.render('join-schedule-form');
});

router.post('/start-schedule', async (req, res) => {
  await startSchedule(req, res);
});

router.post('/join-schedule', async (req, res) => {
  await joinSchedule(req, res);
});

router.get('/meeting', async (req, res) => {
  const { meetingCode, showMatching } = req.query;
  if (!meetingCode) {
    res.redirect('/');
  }
  if (showMatching && showMatching === '1') {
    const meetingInfo = await getMeetingInfo(req, res);
    res.render('schedule-match', meetingInfo);
  } else {
    const meetingInfo = await getMeetingInfo(req, res);
    res.render('join-schedule', meetingInfo);
  }
});

router.get('/schedule-match', async (req, res) => {
  await scheduleMatches(req, res);
});

module.exports = router;
