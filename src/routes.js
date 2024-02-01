const router = require('express').Router();
const fs = require('fs');
const path = require('path');

router.get('/', (req, res) => {
  const dataPath = path.join(__dirname, '/utils/searchData.json');
  const searchData = fs.readFileSync(dataPath, { encoding: 'utf8' });
  res.render('home', { searchData });
});

module.exports = router;
