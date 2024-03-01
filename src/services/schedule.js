const mysql = require('mysql');

const pool = mysql.createPool({
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
});

const queryDb = (query, values) => {
  return new Promise((resolve, reject) => {
    if (!values) {
      values = [];
    }
    pool.query(query, values, (err, results) => {
      if (err) {
        reject(err);
      } else {
        resolve(results);
      }
    });
  });
};

exports.insertMeeting = (valueObj) => {
  const { meetingCode, title, name, password, display, duration } = valueObj;
  const queryMeeting = `INSERT INTO meeting (code, title, duration, display, host, password) VALUES (?, ?, ?, ?, ?, ?)`;
  const meetingValues = [meetingCode, title, duration, display, name, password];

  return queryDb(queryMeeting, meetingValues);
};

exports.getMeeting = (meetingCode) => {
  const queryMeeting = `SELECT * FROM meeting WHERE code = ?`;

  return queryDb(queryMeeting, meetingCode);
}


exports.insertParticipant = (valueObj) => {
  const { meetingId, name, zone } = valueObj;
  const queryParticipant = `INSERT INTO participant (meeting_id, name, time_zone) VALUES (?, ?, ?)`;
  const participantValues = [meetingId, name, zone];

  return queryDb(queryParticipant, participantValues);
};

exports.getParticipants = (meetingId) => {
  const queryParticipants = `SELECT * FROM participant WHERE meeting_id = ?`;

  return queryDb(queryParticipants, meetingId);
};

exports.insertTimeSlot = (valueObj) => {
  const { meetingId, participantId, slot } = valueObj;
  const queryTimeSlot = `INSERT INTO time_slot (meeting_id, participant_id, start_time) VALUES (?, ?, ?)`;
  const timeSlotValues = [meetingId, participantId, slot];

  return queryDb(queryTimeSlot, timeSlotValues);
};

exports.getTimeSlots = (meetingId) => {
  const queryTimeSlots = `SELECT * FROM time_slot WHERE meeting_id = ?`;

  return queryDb(queryTimeSlots, meetingId);
};

exports.deleteFrom = (tableName, id) => {
  // const queryMeeting = meetingId
  //   ? `DELETE FROM meeting WHERE id = ?`
  //   : 'DELETE FROM meeting ORDER BY id DESC LIMIT 1';
  const queryMeeting = `DELETE FROM ${tableName} WHERE id = ?`;

  return queryDb(queryMeeting, id);
};
