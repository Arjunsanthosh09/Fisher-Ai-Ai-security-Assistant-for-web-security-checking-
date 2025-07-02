# AI Security Assistant Chrome Extension

A Chrome extension that provides real-time security analysis of websites using AI and voice control capabilities.

## Features

- 🔍 Real-time website security analysis
- 🎤 Voice control support ("Hey AI, check this link")
- 🔒 SSL/TLS status checking
- 🌐 Domain reputation analysis
- ⚠️ Warning banners for dangerous websites
- 📊 Risk score calculation
- 💾 URL analysis caching

## Installation

1. Clone this repository or download the source code
2. Open Chrome and navigate to `chrome://extensions/`
3. Enable "Developer mode" in the top right
4. Click "Load unpacked" and select the extension directory

## Configuration

1. Get a Google Safe Browsing API key from the [Google Cloud Console](https://console.cloud.google.com/)
2. Open `background.js` and replace the empty `SAFE_BROWSING_API_KEY` constant with your API key:
```javascript
const SAFE_BROWSING_API_KEY = 'your-api-key-here';
```

## Usage

### Voice Commands
- "Hey AI, check this link"
- "Analyze this website"
- "Is this site safe?"

### Manual Analysis
1. Click the extension icon in your browser toolbar
2. The current website will be automatically analyzed
3. Click "Analyze Current Page" to re-analyze
4. Use "Paste URL to Check" to analyze any URL

### Understanding Results
- **Risk Score**: 0-100 (higher is safer)
- **SSL Status**: Secure (HTTPS) or Not Secure (HTTP)
- **Domain Reputation**: Clean or Suspicious
- **Overall Status**: Safe, Warning, or Danger

## Security Features

1. **SSL/TLS Verification**
   - Checks for HTTPS
   - Validates SSL certificates

2. **Domain Analysis**
   - Google Safe Browsing API integration
   - Phishing detection
   - Malware scanning

3. **Real-time Monitoring**
   - Automatic URL change detection
   - Warning banners for dangerous sites
   - Risk score calculation

## Development

### Project Structure
```
├── manifest.json      # Extension configuration
├── popup.html        # Extension popup interface
├── popup.js          # Popup logic
├── background.js     # Background service worker
├── content.js        # Content script for URL detection
└── styles.css        # Styling for the popup
```

### Building from Source
1. Install dependencies (if any)
2. Make your changes
3. Load the extension in Chrome using Developer mode

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

MIT License - feel free to use this project for any purpose.

## Support

For issues and feature requests, please create an issue in the repository. 