
const SAFE_BROWSING_API_KEY = 'AIzaSyAWe25EaWWfX4TYdBJ88_z9E9x2HmBhdoE'; 
const SAFE_BROWSING_API_URL = 'https://safebrowsing.googleapis.com/v4/threatMatches:find';

const urlCache = new Map();

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'analyzeUrl') {
    analyzeUrl(request.url)
      .then(sendResponse)
      .catch(error => {
        console.error('Error analyzing URL:', error);
        sendResponse({
          status: 'error',
          message: 'Failed to analyze URL'
        });
      });
    return true; 
  }
});

async function analyzeUrl(url) {
  try {
    if (urlCache.has(url)) {
      return urlCache.get(url);
    }

    const urlObj = new URL(url);
    
    const [sslStatus, domainReputation] = await Promise.all([
      checkSSL(url),
      checkDomainReputation(urlObj.hostname)
    ]);
    const riskScore = calculateRiskScore(sslStatus, domainReputation);
    const status = determineStatus(riskScore);
    const result = {
      sslStatus,
      domainReputation,
      riskScore,
      status
    };
    urlCache.set(url, result);

    return result;
  } catch (error) {
    console.error('Error in analyzeUrl:', error);
    throw error;
  }
}

async function checkSSL(url) {
  try {
    const response = await fetch(url, {
      method: 'HEAD',
      mode: 'no-cors'
    });
    return url.startsWith('https') ? 'Secure (HTTPS)' : 'Not Secure (HTTP)';
  } catch (error) {
    return 'Unable to verify';
  }
}

async function checkDomainReputation(hostname) {
  if (!SAFE_BROWSING_API_KEY) {
    return 'API key not configured';
  }

  try {
    const response = await fetch(SAFE_BROWSING_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        client: {
          clientId: 'ai-security-assistant',
          clientVersion: '1.0.0'
        },
        threatInfo: {
          threatTypes: ['MALWARE', 'SOCIAL_ENGINEERING', 'UNWANTED_SOFTWARE', 'POTENTIALLY_HARMFUL_APPLICATION'],
          platformTypes: ['ANY_PLATFORM'],
          threatEntryTypes: ['URL'],
          threatEntries: [{ url: `https://${hostname}` }]
        }
      })
    });

    const data = await response.json();
    return data.matches ? 'Suspicious' : 'Clean';
  } catch (error) {
    console.error('Error checking domain reputation:', error);
    return 'Unable to verify';
  }
}

function calculateRiskScore(sslStatus, domainReputation) {
  let score = 100;
  if (!sslStatus.includes('Secure')) {
    score -= 30;
  }
  if (domainReputation === 'Suspicious') {
    score -= 50;
  }
  return Math.max(0, Math.min(100, score));
}

function determineStatus(riskScore) {
  if (riskScore >= 80) return 'safe';
  if (riskScore >= 50) return 'warning';
  return 'danger';
}

setInterval(() => {
  urlCache.clear();
}, 1000 * 60 * 60); 