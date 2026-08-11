const express = require('express');
const fetch = require('node-fetch');
const path = require('path');

// Only load dotenv in development (not in Railway)
if(process.env.NODE_ENV !== 'production'){
  require('dotenv').config();
}

const app = express();
const PORT = process.env.PORT || 3000;
const API_KEY = process.env.ANTHROPIC_API_KEY;

if(!API_KEY){
  console.error('ERROR: ANTHROPIC_API_KEY environment variable not set');
  console.error('In Railway: go to Variables tab and add ANTHROPIC_API_KEY');
  process.exit(1);
}

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use(express.static('.'));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'xau-analyzer-frontend.html'));
});

app.post('/api/analyze-chart', async (req, res) => {
  try{
    const { imageBase64 } = req.body;
    if(!imageBase64){ return res.status(400).json({ error: 'No image provided' }); }

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        max_tokens: 1200,
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'image',
                source: {
                  type: 'base64',
                  media_type: 'image/jpeg',
                  data: imageBase64
                }
              },
              {
                type: 'text',
                text: `You are a XAU/USD (gold) trading analyst. Analyze this TradingView chart and respond with ONLY minified JSON (no markdown, no commentary) matching exactly this schema:

{
  "timestamp": "<current date/time>",
  "marketBias": "bullish|bearish|neutral",
  "trendAndStructure": "<=40 words describing the trend direction and market structure",
  "supportResistance": {
    "resistance1": "<nearest resistance level>",
    "resistance2": "<second resistance level>",
    "support1": "<nearest support level>",
    "support2": "<second support level>"
  },
  "emaAnalysis": {
    "ema5": "<level or 'N/A'>",
    "ema20": "<level or 'N/A'>",
    "relationship": "EMA5 above EMA20|EMA5 below EMA20|convergent|N/A",
    "signal": "BUY|SELL|WAIT"
  },
  "rsiMomentum": {
    "rsiLevel": "<e.g. 65, or 'N/A' if not visible>",
    "interpretation": "<=25 words, overbought/oversold/neutral interpretation"
  },
  "macd": {
    "status": "bullish cross|bearish cross|diverging|converging|N/A",
    "interpretation": "<=25 words describing MACD signal"
  },
  "entryQuality": "<=30 words: Is price extended or at a good entry? Quality of setup?",
  "verdict": "BUY SETUP|SELL SETUP|WAIT|NO TRADE",
  "confidence": <1-10 number>,
  "confidenceReason": "<=20 words explaining the confidence level"
}

Rules: Use ONLY what's visible in chart. Never invent data. Be specific with numbers. No directive language (no 'buy now/sell now'). Output raw JSON only.`
              }
            ]
          }
        ]
      })
    });

    if(!response.ok){
      const err = await response.text();
      throw new Error(`Anthropic API error ${response.status}: ${err}`);
    }

    const data = await response.json();
    const textBlocks = (data.content || []).filter(b => b.type === 'text').map(b => b.text);
    let raw = textBlocks.join('\n').trim();
    raw = raw.replace(/```json|```/g, '').trim();

    const firstBrace = raw.indexOf('{');
    const lastBrace = raw.lastIndexOf('}');
    if(firstBrace === -1 || lastBrace === -1){ throw new Error('No JSON found in response'); }
    raw = raw.slice(firstBrace, lastBrace + 1);

    const parsed = JSON.parse(raw);
    res.json({ success: true, data: parsed });

  }catch(err){
    console.error('Chart analysis error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/pull-brief', async (req, res) => {
  try{
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        max_tokens: 1200,
        system: `You are a gold (XAU/USD) market summarizer. Use web search to find TODAY's real news headlines and current technical price structure for XAU/USD (gold). Respond with ONLY minified JSON (no markdown fences, no commentary) matching exactly this schema:
{"timestamp":"<short date/time label>","news":[{"headline":"<=12 words","source":"<outlet>","note":"<=16 words"},...up to 4 items],"structure":{"currentPrice":"<level>","trend":"bullish|bearish|range","support":"<level>","resistance":"<level>","confluenceFactors":["<=8 words each, up to 3"],"confluence":<0-4>,"scenario":"<=35 words, CONDITIONAL phrasing only. E.g. 'A close above X could open a move to Y; failure risks drop to Z.' Never say buy/sell/enter now."}}

Rules: use real current data from search, not placeholders. Always use conditional language in scenario. Output raw JSON only.`,
        messages: [
          { role: 'user', content: 'Give me today\'s XAU/USD brief in the required JSON schema.' }
        ],
        tools: [
          { type: 'web_search_20250305', name: 'web_search' }
        ]
      })
    });

    if(!response.ok){
      const err = await response.text();
      throw new Error(`Anthropic API error ${response.status}: ${err}`);
    }

    const data = await response.json();
    const textBlocks = (data.content || []).filter(b => b.type === 'text').map(b => b.text);
    let raw = textBlocks.join('\n').trim();
    raw = raw.replace(/```json|```/g, '').trim();

    const firstBrace = raw.indexOf('{');
    const lastBrace = raw.lastIndexOf('}');
    if(firstBrace === -1 || lastBrace === -1){ throw new Error('No JSON found in response'); }
    raw = raw.slice(firstBrace, lastBrace + 1);

    const parsed = JSON.parse(raw);
    res.json({ success: true, data: parsed });

  }catch(err){
    console.error('Brief pull error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`XAU/USD Analyzer running at http://localhost:${PORT}`);
});
