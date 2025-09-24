const express = require('express');
const cors = require('cors');
const path = require('path');
const axios = require('axios');   
const facts = require('./catfacts.json');

const app = express();
const PORT = process.env.PORT || 4444;

const RLaaS_URL = 'https://backend-n0sg.onrender.com/check'; // rlaas backend URL
const API_KEY = '3f3c61e5-443c-414f-81b8-7eb954cd20da'; // API key RLaaS dashboard

app.use(cors());
app.use(express.static(path.join(__dirname, 'public')));

// middleware from rlaas to ensure rate limiting
async function rateLimitCheck(req, res, next) {
  try {
    await axios.post(RLaaS_URL, null, {
      headers: { Authorization: API_KEY }
    });
    next(); // if allowed → continue
  } catch (err) {
    if (err.response && err.response.status === 429) {
      return res.status(429).json({ error: 'Too Many Requests (Rate limited by RLaaS)' });
    }
    console.error('Rate limit check error:', err.message);
    return res.status(500).json({ error: 'Rate limit service unavailable' });
  }
}

// unlimited for main site
app.get('/facts/unlimited', (req, res) => {
  const randomFact = facts[Math.floor(Math.random() * facts.length)];
  res.json({ fact: randomFact });
});

// all facts endpoint 
app.get('/facts', rateLimitCheck, (req, res) => {
  res.json({ facts });
});

// random fact endpoint
app.get('/facts/random', rateLimitCheck, (req, res) => {
  const randomFact = facts[Math.floor(Math.random() * facts.length)];
  res.json({ fact: randomFact });
});

app.listen(PORT, () => {
  console.log(`CatFacts site & API running at http://localhost:${PORT}`);
});