
let lastUrl = window.location.href;

function checkUrlChange() {
  const currentUrl = window.location.href;
  if (currentUrl !== lastUrl) {
    lastUrl = currentUrl;
    analyzeCurrentUrl();
  }
}

async function analyzeCurrentUrl() {
  try {
    const response = await chrome.runtime.sendMessage({
      action: 'analyzeUrl',
      url: window.location.href
    });

    if (response.status === 'danger') {
      showWarningBanner(response);
    }
  } catch (error) {
    console.error('Error analyzing URL:', error);
  }
}

function showWarningBanner(analysis) {
  const existingBanner = document.getElementById('ai-security-warning');
  if (existingBanner) {
    existingBanner.remove();
  }

  const banner = document.createElement('div');
  banner.id = 'ai-security-warning';
  banner.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    background-color: #f44336;
    color: white;
    padding: 16px;
    text-align: center;
    z-index: 999999;
    font-family: Arial, sans-serif;
    box-shadow: 0 2px 4px rgba(0,0,0,0.2);
  `;

  const content = document.createElement('div');
  content.style.cssText = `
    max-width: 800px;
    margin: 0 auto;
    display: flex;
    justify-content: space-between;
    align-items: center;
  `;

  const warningText = document.createElement('div');
  warningText.innerHTML = `
    <strong>⚠️ Security Warning:</strong>
    This website has been flagged as potentially dangerous.
    Risk Score: ${analysis.riskScore}/100
    SSL Status: ${analysis.sslStatus}
    Domain Reputation: ${analysis.domainReputation}
  `;

  const closeButton = document.createElement('button');
  closeButton.textContent = '×';
  closeButton.style.cssText = `
    background: none;
    border: none;
    color: white;
    font-size: 24px;
    cursor: pointer;
    padding: 0 8px;
  `;
  closeButton.onclick = () => banner.remove();

  content.appendChild(warningText);
  content.appendChild(closeButton);
  banner.appendChild(content);
  document.body.appendChild(banner);
  document.body.style.paddingTop = '60px';
}
const observer = new MutationObserver(checkUrlChange);
observer.observe(document.body, {
  childList: true,
  subtree: true
});

analyzeCurrentUrl(); 