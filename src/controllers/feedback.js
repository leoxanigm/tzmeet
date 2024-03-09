let nodemailer = require('nodemailer');
let aws = require('@aws-sdk/client-ses');
let { defaultProvider } = require('@aws-sdk/credential-provider-node');

const ses = new aws.SES({
  apiVersion: '2012-10-17',
  region: process.env.AWS_REGION,
  defaultProvider,
});

const transporter = nodemailer.createTransport({
  SES: { ses, aws },
  sendingRate: 1,
});

function sendEmail(mailOptions) {
  return new Promise((resolve, reject) => {
    if (transporter.isIdle()) {
      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          console.log(error);
          reject(error);
        } else {
          resolve(info);
        }
      });
    }
  });
}

module.exports = sendFeedbackEmail = async (req, res) => {
  let { email, subject, message } = req.body;

  const text = `
    From: ${email} \n
    Subject: ${subject} \n
    Message: ${message} \n
    Time: ${new Date().toUTCString()}
  `;

  const mailOptions = {
    from: 'feedback@tzmeet.com',
    to: process.env.FEEDBACK_EMAIL,
    subject: `New Feedback for TZMeet: ${subject.slice(0, 20)}`,
    text: text,
  };

  try {
    await sendEmail(mailOptions);
    res.render('feedback-sent');
  } catch (error) {
    console.error(error);
    res.render('feedback-form', {
      alert: {
        message: 'Error sending feedback, please try again.',
        type: 'danger',
      },
    });
  }
};
