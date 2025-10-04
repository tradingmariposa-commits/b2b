// Netlify function to send WhatsApp to owner via Twilio
// To use: set environment vars in Netlify:
// TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_WHATSAPP_FROM (e.g., 'whatsapp:+1415XXXXXXX'), OWNER_WHATSAPP_NUMBER (e.g., 'whatsapp:+923001234567')
const fetch = require('node-fetch');

exports.handler = async function(event) {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  let body;
  try {
    body = JSON.parse(event.body || '{}');
  } catch (err) {
    return { statusCode: 400, body: 'Invalid JSON' };
  }

  const {
    productName = 'Not provided',
    quantity = 'Not provided',
    weight = 'Not provided',
    country = 'Not provided',
    telephone = 'Not provided',
    email = 'Not provided',
    language = 'ps'
  } = body;

  const msgPashto = `سلام! تاسو یوه نوې پوښتنه ترلاسه کړې:\nمحصول: ${productName}\nمقدار: ${quantity}\nوزن: ${weight}\nهېواد: ${country}\nتلیفون: ${telephone}\nایمیل: ${email}`;
  const msgEnglish = `Hello! You have a new inquiry:\nProduct: ${productName}\nQuantity: ${quantity}\nWeight: ${weight}\nCountry: ${country}\nPhone: ${telephone}\nEmail: ${email}`;

  const message = language === 'en' ? msgEnglish : msgPashto;

  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const from = process.env.TWILIO_WHATSAPP_FROM;
  const to = process.env.OWNER_WHATSAPP_NUMBER;

  if (!accountSid || !authToken || !from || !to) {
    return {
      statusCode: 500,
      body: 'Twilio environment variables not configured (TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_WHATSAPP_FROM, OWNER_WHATSAPP_NUMBER)'
    };
  }

  const url = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`;
  const params = new URLSearchParams();
  params.append('From', from);
  params.append('To', to);
  params.append('Body', message);

  const auth = Buffer.from(`${accountSid}:${authToken}`).toString('base64');

  try {
    const resp = await fetch(url, {
      method: 'POST',
      body: params,
      headers: {
        Authorization: `Basic ${auth}`,
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });

    const data = await resp.json();
    if (!resp.ok) {
      return {
        statusCode: resp.status,
        body: JSON.stringify({ error: data })
      };
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ success: true, twilio: data })
    };
  } catch (err) {
    return { statusCode: 500, body: String(err) };
  }
};
