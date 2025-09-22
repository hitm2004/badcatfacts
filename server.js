const express = require('express');
const cors = require('cors');
const path = require('path');
const axios = require('axios');   // ✅ ADD THIS
const facts = require('./catfacts.json');

const app = express();
const PORT = process.env.PORT || 4444;

// ✅ ADD THESE
const RLaaS_URL = 'https://<your-rlaas-backend>.onrender.com/check'; // replace with your RLaaS backend URL
const API_KEY = '<your-api-key>'; // replace with the API key you created in RLaaS dashboard

app.use(cors());
app.use(express.static(path.join(__dirname, 'public')));

// ✅ ADD THIS MIDDLEWARE
async function rateLimitCheck(req, res, next) {
  try {
    await axios.post(RLaaS_URL, null, {
      headers: { Authorization: API_KEY }
    });
    next(); // allowed → continue
  } catch (err) {
    if (err.response && err.response.status === 429) {
      return res.status(429).json({ error: 'Too Many Requests (Rate limited by RLaaS)' });
    }
    console.error('Rate limit check error:', err.message);
    return res.status(500).json({ error: 'Rate limit service unavailable' });
  }
}

// all facts endpoint (✅ PROTECT WITH RLaaS)
app.get('/facts', rateLimitCheck, (req, res) => {
  res.json({ facts });
});

// random fact endpoint (✅ PROTECT WITH RLaaS)
app.get('/facts/random', rateLimitCheck, (req, res) => {
  const randomFact = facts[Math.floor(Math.random() * facts.length)];
  res.json({ fact: randomFact });
});

app.listen(PORT, () => {
  console.log(`CatFacts site & API running at http://localhost:${PORT}`);
});