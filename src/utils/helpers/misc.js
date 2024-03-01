const fs = require('fs');
const path = require('path');

const { customAlphabet } = require('nanoid');

exports.genID = () => {
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
  const nanoid = customAlphabet(alphabet, 10);
  return nanoid();
};

exports.getSearchData = () => {
  const dataPath = path.join(__dirname, '../searchData.json');
  return fs.readFileSync(dataPath, { encoding: 'utf8' });
};
