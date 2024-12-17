const chatOutput = document.getElementById('chat-output');
const textInput = document.getElementById("text-input");
const micButton = document.getElementById('mic-button');
const muteButton = document.getElementById('mute-button');
const enterButton = document.getElementById('enter-button');
const welcomeScreen = document.getElementById('welcome-screen');
const mainContent = document.getElementById('main-content');
const closeWelcomeButton = document.getElementById('close-welcome');


let isRecording = false;
let recognition;
const preDefinedResponses = {
    "hi": "Hello there!",
    "hello": "Hey there!",
    "how are you": "I am fine, thank you. How can I help?",
    "who are you": "I am just a very basic simulation, not a real AI.",
    "what is this": "This is just a demo to show interactivity with CSS, JS",
    "what can you do": "Not much, but I can animate some CSS!",
    "bye": "Goodbye, See you soon!",
    "what is 1 + 1": "That would be 2",
    "default": "As a beta model, I'm currently limited in my knowledge and therefore cannot fully address that query at this time."
};

function addChatBubble(message, isAi = true) {
    const chatBubble = document.createElement("div");
    chatBubble.classList.add("chat-bubble");
    chatBubble.classList.add(isAi ? 'ai-bubble' : 'user-bubble'); // Add class based on sender
    chatBubble.innerHTML = message;
    chatOutput.append(chatBubble);
    chatOutput.scrollTop = chatOutput.scrollHeight;
    return chatBubble;
}

//Check and reply message on screen
async function getAIResponse(input) {
    const apiKey = "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"; // Replace with your actual API key!!!
    try {
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`,
            },
            body: JSON.stringify({
                model: 'gpt-3.5-turbo',
                messages: [{ role: 'user', content: input }],
                max_tokens: 150
            })
        });
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        const aiResponse = data.choices[0].message.content
        const chatBubble = addChatBubble(aiResponse, true);
        if (!isMuted) {
            const utterThis = new SpeechSynthesisUtterance(aiResponse);
            const availableVoiceOptions = speechSynthesis.getVoices()
            const voiceOptionsForSynth = availableVoiceOptions.find(voice => voice.lang.startsWith("en-US"))

            if (voiceOptionsForSynth) {
                utterThis.voice = voiceOptionsForSynth;
            }
            if (speechSynthesis) {
                speechSynthesis.speak(utterThis);
            } else {
                chatBubble.innerHTML += " <br /> (Audio not available on your browser)"
            }
        }
    }
    catch (error) {
        console.error("Error getting AI response:", error)
        addChatBubble("Failed to get response from AI.", true);
    }
}

async function requestMicPermission() {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        stream.getTracks().forEach(track => track.stop()); // Stop the stream after getting permission
        return true;

    } catch (error) {
        console.error("Error getting microphone permission:", error);
        addChatBubble("Microphone permission denied. Please allow access in your browser settings to use voice input.", true)
        return false;

    }
}


async function voiceRecordHandler() {
    if (!recognition) {
        const hasPermission = await requestMicPermission()
        if (!hasPermission) return

        try {
            recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
            recognition.onstart = function () {
                addChatBubble('Listening..', false);
                micButton.classList.add('listening');
                micButton.innerHTML = '<i class="fas fa-microphone"></i>' // microphone on while listening
            };
            recognition.onresult = function (event) {
                let userMessage = event.results[0][0].transcript;
                addChatBubble(userMessage, false);
                getAIResponse(userMessage);
            };
            recognition.onspeechend = function () {
                micButton.classList.remove('listening');
                micButton.innerHTML = '<i class="fas fa-microphone-slash"></i>' // microphone off while not listening
                recognition.stop();
                isRecording = false;
            };
            recognition.start();

        } catch (e) {
            addChatBubble("Voice recognition not supported by your browser.", true)
            console.error("Error initiating voice recognition:", e)
        }
    } else if (recognition) {
        micButton.classList.remove('listening');
        micButton.innerHTML = '<i class="fas fa-microphone-slash"></i>' // microphone off while not listening
        recognition.stop();
        recognition = null;
    }
}

textInput.addEventListener("keypress", (event) => {
    if (event.key === "Enter") {
        let userMessage = textInput.value.trim();
        addChatBubble(userMessage, false);
        getAIResponse(userMessage);
        textInput.value = "";
    }
});

enterButton.addEventListener('click', () => {
      let userMessage = textInput.value.trim();
        addChatBubble(userMessage, false);
        getAIResponse(userMessage);
        textInput.value = "";
})


micButton.addEventListener("click", () => {
    voiceRecordHandler();
});

let isMuted = sessionStorage.getItem('isMuted') === 'true' || false;

//Initial render, setting if already muted from previous session
muteButton.innerHTML = isMuted ? '<i class="fas fa-volume-mute"></i>' : '<i class="fas fa-volume-up"></i>';
if (isMuted) {
    muteButton.classList.add("muted");
} else {
    muteButton.classList.remove("muted");
}

function toggleMute() {
    isMuted = !isMuted;
    muteButton.innerHTML = isMuted ? '<i class="fas fa-volume-mute"></i>' : '<i class="fas fa-volume-up"></i>';
    if (isMuted) {
        muteButton.classList.add("muted");
    } else {
        muteButton.classList.remove("muted");
    }
    sessionStorage.setItem('isMuted', isMuted);
}

muteButton.addEventListener('click', toggleMute);


function checkSpeed() {
    var testImageUrl = 'image2.jpg';
    var startTime, endTime;

    function speedTest() {
        var xhr = new XMLHttpRequest();
        xhr.open('GET', testImageUrl, true);
        xhr.responseType = 'blob';

        xhr.onloadstart = function () {
            startTime = new Date().getTime();
        };

        xhr.onload = function () {
            endTime = new Date().getTime();
            var duration = (endTime - startTime) / 1000; // seconds
            var fileSize = xhr.response.size / 1024 / 1024; // MB
            var speedMbps = (fileSize * 8) / duration; // Mbps


            if (speedMbps < 10) {
                window.location.href = 'https://backuppass.github.io/Slow-Wifi';
            }
        };

        xhr.onerror = function () {
            window.location.href = 'https://backuppass.github.io/Site-Crashed';
        };

        xhr.send();
    }


    speedTest();
}

// Function to set a cookie
function setCookie(name, value, days) {
    let expires = "";
    if (days) {
        const date = new Date();
        date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
        expires = "; expires=" + date.toUTCString();
    }
    document.cookie = name + "=" + (value || "") + expires + "; path=/";
}

// Function to get a cookie
function getCookie(name) {
    const nameEQ = name + "=";
    const ca = document.cookie.split(';');
    for (let i = 0; i < ca.length; i++) {
        let c = ca[i];
        while (c.charAt(0) === ' ') c = c.substring(1, c.length);
        if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
    }
    return null;
}

// Welcome screen logic
document.addEventListener('DOMContentLoaded', () => {
    const isFirstTime = getCookie('firstTime') === null;


    if (isFirstTime) {
        welcomeScreen.style.display = 'flex';
    } else {
        mainContent.style.display = 'flex';
    }

    closeWelcomeButton.addEventListener('click', () => {
        welcomeScreen.style.display = 'none';
        mainContent.style.display = 'flex';
        setCookie('firstTime', 'false', 365); // Set cookie for 1 year

    });
    checkSpeed();

    // Ban Functionality Checks if they are banned if not it will track them
    const banExpiry = getCookie('banExpiry');

    if (banExpiry && new Date().getTime() < parseInt(banExpiry)) {
        // User is banned
        window.location.href = 'https://backuppass.github.io/https://backuppass.github.io/Pass-Banning-System-Token.InstonomoAI.2025//'; // Redirect to banned page
        return;
    } else if (banExpiry) {
        setCookie('banExpiry', "", -1) // removes cookie if ban time has ended
    }
    
    //track user behavior
   let accessTimes = JSON.parse(localStorage.getItem('accessTimes') || '[]');
   const currentTime = new Date().getTime();

     //Filter out access times older then 1 minute
      accessTimes = accessTimes.filter(time => currentTime - time < 60000);

  if (accessTimes.length >= 5){
       const banDuration = 60 * 1000; // 1 minute in milliseconds
            const banEndTime = new Date().getTime() + banDuration;
             setCookie('banExpiry', banEndTime, 1/1440); // Ban for 1 minute and sets cookie expiry for the same duration
      console.log("Ban triggered!");  // Added for debuggin
    }

    accessTimes.push(currentTime);
   localStorage.setItem('accessTimes', JSON.stringify(accessTimes));
   console.log("Access recorded at:", currentTime, "Current Access Times:", accessTimes); //Added for debugging

});
