# XAU/USD Trading Chart Analyzer

A server-side trading analysis tool for gold (XAU/USD) with two modes:
1. **Upload TradingView charts** for Claude vision analysis → entry zones, stops, targets, confluence
2. **Pull today's gold news & structure** via web_search for real-time technical brief

## Setup

### Prerequisites
- Node.js 14+ installed
- An Anthropic API key (from https://console.anthropic.com)

### Installation

1. **Clone or navigate to the project directory**
   ```bash
   cd xau-analyzer
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Create a `.env` file** from the template
   ```bash
   cp .env.example .env
   ```

4. **Add your Anthropic API key** to `.env`
   ```
   ANTHROPIC_API_KEY=your_actual_api_key_here
   PORT=3000
   NODE_ENV=development
   ```

### Running the Server

Start the development server:
```bash
npm start
```

The app will be available at `http://localhost:3000`

### Usage

**Option 1: Analyze a Chart**
1. Go to http://localhost:3000
2. Upload a TradingView chart screenshot (PNG, JPG, or WebP)
3. Click "Analyze Chart"
4. Get entry zones, key levels, confluence gauge, factors, and conditional scenarios

**Option 2: Pull News & Structure**
1. Click "Pull News Brief"
2. Get today's real XAU/USD news headlines and technical structure
3. View confluence gauge, factors, and market scenario

## Features

- **Chart Vision Analysis**: Claude analyzes uploaded TradingView charts for technical setup
- **Entry Zones**: Identifies optimal entry levels with explanations
- **Confluence Gauge**: 0-4 bars showing how many factors align (trend + levels + pattern + momentum)
- **Risk/Reward Ratios**: Calculated stop and target levels with risk/reward metrics
- **Conditional Scenarios**: All scenarios use conditional language only — no buy/sell directives
- **Real-time News**: Pull today's gold market news via web_search
- **Full Disclaimer**: Maintains fiduciary guardrails on all output

## Architecture

- **Frontend**: `xau-analyzer-frontend.html` — HTML/CSS/JS with dark trading terminal design
- **Backend**: `server.js` — Express.js proxy that handles API calls to Anthropic
- **API Model**: Claude Sonnet 4.6 with vision and web_search capabilities

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `ANTHROPIC_API_KEY` | Your Anthropic API key (required) | — |
| `PORT` | Server port | 3000 |
| `NODE_ENV` | Environment (development/production) | development |

## Design

- **Typography**: Space Grotesk (headings), Inter (body), JetBrains Mono (data)
- **Theme**: Dark terminal-inspired UI with amber, green, and red accents
- **Responsive**: Works on desktop and mobile
- **No external CDN**: All fonts and styles bundled

## Guardrails

✓ No directive language ("buy now", "sell now", "enter here")
✓ All scenarios use conditional phrasing only
✓ Full disclaimer footer on every page
✓ No order placement or auto-trading features
✓ Does not fabricate data — uses real web search results

## License

ISC

## Support

For issues or feature requests, check the repository or contact the maintainer.
