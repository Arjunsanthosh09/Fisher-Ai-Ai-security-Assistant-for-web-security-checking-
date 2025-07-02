document.addEventListener('DOMContentLoaded', async () => {

  const currentUrlElement = document.getElementById('currentUrl');
  const securityStatusElement = document.getElementById('securityStatus');
  const sslStatusElement = document.getElementById('sslStatus');
  const domainReputationElement = document.getElementById('domainReputation');
  const riskScoreElement = document.getElementById('riskScore');
  const analyzeButton = document.getElementById('analyzeButton');
  const pasteUrlButton = document.getElementById('pasteUrlButton');
  const urlInputContainer = document.getElementById('urlInputContainer');
  const urlInput = document.getElementById('urlInput');
  const checkUrlButton = document.getElementById('checkUrlButton');
  const voiceButton = document.getElementById('voiceButton');

  let recognition = null;
  let isListening = false;
  let recognitionTimeout = null;
  let speechSynthesis = window.speechSynthesis;

  try {
    if ('webkitSpeechRecognition' in window) {
      recognition = new webkitSpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';
      recognition.maxAlternatives = 1;
    } else {
      console.error('Speech recognition not supported');
      voiceButton.style.display = 'none';
    }
  } catch (error) {
    console.error('Error initializing speech recognition:', error);
    voiceButton.style.display = 'none';
  }

  function speakResults(data) {
    const { sslStatus, domainReputation, riskScore, status } = data;
    let message = '';
    
    if (status === 'safe') {
      message = `This site appears to be safe You can continue to browse. It has a risk score of ${riskScore} out of 100. The SSL status is ${sslStatus} and the domain reputation is ${domainReputation}.`;
    } else if (status === 'warning') {
      message = `Warning! This site has some security concerns. Risk score is ${riskScore} out of 100. ${sslStatus}. Domain reputation is ${domainReputation}.`;
    } else {
      message = `Danger! This site may be unsafe. Risk score is ${riskScore} out of 100. ${sslStatus}. Domain reputation is ${domainReputation}.`;
    }

    const utterance = new SpeechSynthesisUtterance(message);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    speechSynthesis.speak(utterance);
  }

  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  currentUrlElement.textContent = tab.url;

  if (recognition) {
    voiceButton.addEventListener('click', () => {
      try {
        if (isListening) {
          stopListening();
        } else {
          startListening();
        }
      } catch (error) {
        console.error('Error toggling voice recognition:', error);
        stopListening();
      }
    });

    function startListening() {
      try {
        recognition.start();
        isListening = true;
        voiceButton.classList.add('listening');
        voiceButton.querySelector('.button-text').textContent = 'Listening...';
      
        recognitionTimeout = setTimeout(() => {
          if (isListening) {
            stopListening();
          }
        }, 10000);
      } catch (error) {
        console.error('Error starting voice recognition:', error);
        stopListening();
      }
    }

    function stopListening() {
      try {
        recognition.stop();
        isListening = false;
        voiceButton.classList.remove('listening');
        voiceButton.querySelector('.button-text').textContent = 'Start Voice Control';
        if (recognitionTimeout) {
          clearTimeout(recognitionTimeout);
          recognitionTimeout = null;
        }
      } catch (error) {
        console.error('Error stopping voice recognition:', error);
      }
    }

    recognition.onstart = () => {
      console.log('Voice recognition started');
     
      voiceButton.style.backgroundColor = '#ff4444';
    };

    recognition.onerror = (event) => {
      console.error('Voice recognition error:', event.error);
      stopListening();
    
      securityStatusElement.innerHTML = `
        <div class="status-icon">❌</div>
        <div class="status-text">Voice recognition error: ${event.error}</div>
      `;
     
      const utterance = new SpeechSynthesisUtterance('Sorry, there was an error with voice recognition.');
      speechSynthesis.speak(utterance);
    };

    recognition.onend = () => {
      console.log('Voice recognition ended');
      stopListening();
    };

    recognition.onresult = (event) => {
      const command = event.results[0][0].transcript.toLowerCase();
      console.log('Voice command received:', command);
      
     
      securityStatusElement.innerHTML = `
        <div class="status-icon">🎤</div>
        <div class="status-text">Command: ${command}</div>
      `;
      
    
      if (command.includes('check') || 
          command.includes('analyze') || 
          command.includes('scan') || 
          command.includes('verify') || 
          command.includes('is this safe') || 
          command.includes('is this site safe')) {
        analyzeCurrentPage();
      } else {

        setTimeout(() => {
          securityStatusElement.innerHTML = `
            <div class="status-icon">❓</div>
            <div class="status-text">Command not recognized. Try saying "check" or "analyze"</div>
          `;
       
          const utterance = new SpeechSynthesisUtterance('Command not recognized. Please try saying check or analyze.');
          speechSynthesis.speak(utterance);
        }, 2000);
      }
    };
  }

  async function analyzeCurrentPage() {
    try {
      const response = await chrome.runtime.sendMessage({
        action: 'analyzeUrl',
        url: tab.url
      });

      updateSecurityStatus(response);
    
      speakResults(response);
    } catch (error) {
      console.error('Error analyzing page:', error);
      securityStatusElement.innerHTML = `
        <div class="status-icon">❌</div>
        <div class="status-text">Error analyzing page</div>
      `;
      const utterance = new SpeechSynthesisUtterance('Sorry, there was an error analyzing the page.');
      speechSynthesis.speak(utterance);
    }
  }

  function updateSecurityStatus(data) {
    const { sslStatus, domainReputation, riskScore, status } = data;
    
    sslStatusElement.textContent = sslStatus;
    domainReputationElement.textContent = domainReputation;
    riskScoreElement.textContent = `${riskScore}/100`;

    const statusClass = status === 'safe' ? 'status-safe' : 
                       status === 'warning' ? 'status-warning' : 'status-danger';
    
    securityStatusElement.innerHTML = `
      <div class="status-icon">${status === 'safe' ? '✅' : status === 'warning' ? '⚠️' : '❌'}</div>
      <div class="status-text ${statusClass}">${status.toUpperCase()}</div>
    `;
  }

  analyzeButton.addEventListener('click', analyzeCurrentPage);

  pasteUrlButton.addEventListener('click', () => {
    urlInputContainer.classList.toggle('hidden');
  });

  checkUrlButton.addEventListener('click', async () => {
    const url = urlInput.value.trim();
    if (!url) return;

    try {
      const response = await chrome.runtime.sendMessage({
        action: 'analyzeUrl',
        url: url
      });

      updateSecurityStatus(response);
      urlInputContainer.classList.add('hidden');
    } catch (error) {
      console.error('Error analyzing URL:', error);
      securityStatusElement.innerHTML = `
        <div class="status-icon">❌</div>
        <div class="status-text">Error analyzing URL</div>
      `;
    }
  });

  analyzeCurrentPage();
}); 