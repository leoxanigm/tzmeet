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
  res.render('join-schedule-form', {
    meetingCode: '',
    requiresPassword: false,
  });
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
    if (meetingInfo.password && !req.query.password) {
      res.render('join-schedule-form', { meetingCode, requiresPassword: true });
    } else if (
      (meetingInfo.password && meetingInfo.password === req.query.password) ||
      !meetingInfo.password
    ) {
      res.render('schedule-match', meetingInfo);
    } else {
      res.render('join-schedule-form', { meetingCode, requiresPassword: true });
    }
  } else {
    const meetingInfo = await getMeetingInfo(req, res);
    console.log(meetingInfo.password, req.query.password);
    if (
      (meetingInfo.password && meetingInfo.password === req.query.password) ||
      !meetingInfo.password
    ) {
      res.render('join-schedule', meetingInfo);
    } else {
      res.render('join-schedule-form', { meetingCode, requiresPassword: true });
    }
  }
});

router.get('/schedule-match', async (req, res) => {
  await scheduleMatches(req, res);
});

router.post('/join-schedule-password', async (req, res) => {
  const meetingInfo = await getMeetingInfo(req, res);

  if (meetingInfo.alert) {
    res.json({ success: false, alert: meetingInfo.alert });
    return;
  }

  if (meetingInfo.password) {
    if (!req.body.password) {
      res.json({ success: false, message: 'password required' });
    } else if (meetingInfo.password !== req.body.password) {
      res.json({ success: false, message: 'wrong password' });
    } else {
      res.json({ success: true });
    }
  } else {
    res.json({ success: true });
  }
});

router.get('/:meetingCode', async (req, res) => {
  const meetingCode = req.params.meetingCode;
  req.query.meetingCode = meetingCode;
  const meetingInfo = await getMeetingInfo(req, res);
  if (meetingInfo.alert) {
    res.render('home', { alert: meetingInfo.alert });
  } else {
    res.redirect(`/meeting?meetingCode=${meetingCode}`);
  }
});

module.exports = router;
