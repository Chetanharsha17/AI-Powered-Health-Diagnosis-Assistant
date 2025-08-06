const chatBox = document.getElementById('chat-box');
const userInput = document.getElementById('user-input');
const sendBtn = document.getElementById('send-btn');
const micBtn = document.getElementById('mic-btn');
const ttsToggle = document.getElementById('tts-toggle');

let voiceEnabled = true;

// Add messages to chat UI
function addMessage(message, sender) {
    const msgElem = document.createElement('div');
    msgElem.className = `message ${sender}`;
    msgElem.textContent = message;
    chatBox.appendChild(msgElem);
    chatBox.scrollTop = chatBox.scrollHeight;
}

// Send message to Flask
function sendMessage() {
    const message = userInput.value.trim();
    if (!message) return;
    addMessage(message, 'user');
    userInput.value = '';
    
    addMessage('Analyzing your symptoms...', 'bot');

    fetch('/diagnose', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: message })
    })
    .then(res => res.json())
    .then(data => {
        chatBox.lastChild.remove();  // Remove "analyzing..." message
        if (data.reply) {
            addMessage(data.reply, 'bot');
            if (voiceEnabled) speakText(data.reply);
        }
    });
}

// Text-to-Speech
function speakText(text) {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-US';
    speechSynthesis.speak(utterance);
}

// Toggle TTS
ttsToggle.onclick = () => {
    voiceEnabled = !voiceEnabled;
    ttsToggle.textContent = voiceEnabled ? '🔊' : '🔇';
};

// Speech-to-Text
micBtn.onclick = () => {
    const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
    recognition.lang = 'en-US';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => addMessage("🎧 Listening...", 'bot');

    recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        chatBox.lastChild.remove();  // Remove "Listening..."
        userInput.value = transcript;
        sendMessage();
    };

    recognition.onerror = (e) => {
        chatBox.lastChild.remove();
        addMessage("Sorry, I couldn't understand. Please try again.", 'bot');
    };

    recognition.start();
};

sendBtn.onclick = sendMessage;
userInput.addEventListener('keypress', e => {
    if (e.key === 'Enter') sendMessage();
});
