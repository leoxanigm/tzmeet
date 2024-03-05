const {
  insertMeeting,
  getMeeting,
  insertParticipant,
  getParticipants,
  insertTimeSlot,
  getTimeSlots,
  deleteFrom,
} = require('../services/schedule');
const { genID } = require('../utils/helpers/misc');

exports.startSchedule = async (req, res) => {
  let valueObj = req.body;

  const meetingCode = genID();
  valueObj = { ...valueObj, meetingCode };

  let meetingId, participantId, password;

  try {
    const meetingInfo = await insertMeeting(valueObj);
    meetingId = meetingInfo.insertId;
  } catch (error) {
    console.error(error);
    res.json({
      alert: {
        message:
          'An error occurred while creating the schedule. Please try again.',
        type: 'danger',
      },
    });
  }

  try {
    if (meetingId) {
      valueObj = { ...valueObj, meetingId };
      const participantInfo = await insertParticipant(valueObj);
      participantId = participantInfo.insertId;
    } else {
      throw new Error('Meeting ID not found.');
    }

    if (participantId) {
      valueObj.selections.forEach(async (slot) => {
        valueObj = { ...valueObj, participantId, slot };
        await insertTimeSlot(valueObj);
      });
    } else {
      throw new Error('Participant ID not found.');
    }

    if (valueObj.password) {
      res.json({ meetingCode, password: valueObj.password });
    } else {
      res.json({ meetingCode });
    }
  } catch (error) {
    // Remove meeting if we can't add either participant or time slots
    deleteFrom('meeting', meetingId);

    console.error(error);
    res.json({
      alert: {
        message:
          'An error occurred while creating the schedule. Please try again.',
        type: 'danger',
      },
    });
  }
};

exports.getMeetingInfo = async (req, res) => {
  try {
    let meetingCode;
    if (req.method === 'POST') {
      meetingCode = req.body.meetingCode;
    } else {
      meetingCode = req.query.meetingCode;
    }

    if (!meetingCode) {
      return {
        alert: {
          message: 'Please provide a meeting code.',
          type: 'danger',
        },
      };
    }

    const meetingInfo = await getMeeting(meetingCode);

    if (!meetingInfo.length) {
      return {
        alert: {
          message: 'Meeting not found.',
          type: 'danger',
        },
      };
    }

    return { ...meetingInfo[0], meetingCode };
  } catch (error) {
    console.error(error);
    return {
      alert: {
        message: 'An error occurred while retrieving the meeting information.',
        type: 'danger',
      },
    };
  }
};

exports.joinSchedule = async (req, res) => {
  try {
    let valueObj = req.body;

    const meetingInfo = await getMeeting(valueObj.meetingCode);
    const { id } = meetingInfo[0];
    valueObj = { ...req.body, meetingId: id };

    const participantInfo = await insertParticipant(valueObj);
    const participantId = participantInfo.insertId;

    if (participantId) {
      try {
        valueObj.selections.forEach(async (slot) => {
          valueObj = { ...valueObj, participantId, slot };
          await insertTimeSlot(valueObj);
        });

        res.json({ meetingCode: valueObj.meetingCode });
      } catch (error) {
        // Remove participant if we can't add time slots
        deleteFrom('participant', participantId);

        throw error;
      }
    } else {
      throw new Error('Participant ID not found.');
    }
  } catch (error) {
    console.error(error);
    res.json({
      alert: {
        message: 'An error occurred while trying to join the meeting.',
        type: 'danger',
      },
    });
  }
};

exports.scheduleMatches = async (req, res) => {
  try {
    const { meetingCode } = req.query;

    if (!meetingCode) {
      throw new Error('Meeting code not found.');
    }

    const meetingInfo = await getMeeting(meetingCode);
    const { id } = meetingInfo[0];

    const particpants = await getParticipants(id);
    const timeSlots = await getTimeSlots(id);

    let timeMatches = timeSlots.reduce((matchObj, slot) => {
      // Get list of participant names for each time slot
      const participantNames = particpants.reduce(
        (participantList, participant) => {
          if (slot.participant_id === participant.id)
            participantList.push(participant.name);
          return participantList;
        },
        []
      );

      // Add time slot to matchObj if it doesn't exist, otherwise add
      // participant names as an array to the existing time slot
      if (slot.start_time in matchObj) {
        matchObj[slot.start_time].push(...participantNames);
      } else {
        matchObj[slot.start_time] = participantNames;
      }

      return matchObj;
    }, {});

    // Convert timeMatches object to array of objects
    timeMatches = Object.keys(timeMatches).map((time) => {
      return { time, participants: timeMatches[time] };
    });

    res.json(timeMatches);
  } catch (error) {
    console.error(error);

    res.json({
      alert: {
        message: 'An error occurred while trying to get matching time slots.',
        type: 'danger',
      },
    });
  }
};
