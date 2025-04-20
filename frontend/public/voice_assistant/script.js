let lightMode = true;
let recorder = null;
let recording = false;
let currentImage = null;
let voiceOption = "en-AU_JackExpressive";
const responses = [];
const botRepeatButtonIDToIndexMap = {};
const userRepeatButtonIDToRecordingMap = {};
// const baseUrl = window.env.BASE_URL;

async function showBotLoadingAnimation() {
  await sleep(500);
  $(".loading-animation")[1].style.display = "inline-block";
}

function hideBotLoadingAnimation() {
  $(".loading-animation")[1].style.display = "none";
}

async function showUserLoadingAnimation() {
  await sleep(100);
  $(".loading-animation")[0].style.display = "flex";
}

function hideUserLoadingAnimation() {
  $(".loading-animation")[0].style.display = "none";
}

const getSpeechToText = async (userRecording) => {
  const l16Audio = await convertToL16(userRecording.audioBlob);
  let response = await fetch("/voice_assistant/speech_to_text", {
    method: "POST",
    headers: {
      'Content-Type': "audio/l16; rate=16000; channels=1"
    },
    body: l16Audio,
  });
  console.log(response);
  response = await response.json();
  console.log(response);
  return response.text;
};

const cleanTextInput = (value) => {
  return value
    .trim() // remove starting and ending spaces
    .replace(/[\n\t]/g, "") // remove newlines and tabs
    .replace(/<[^>]*>/g, "") // remove HTML tags
    .replace(/[<>&;]/g, ""); // sanitize inputs
};

//Check for browser supported audio format
const getSupportedMimeType = () => {
  const types = [
    'audio/wav',
    'audio/mpeg',
    'audio/l16',
    'audio/webm;codecs=opus',  // Best quality, widely supported
    'audio/webm',              // Fallback WebM
    'audio/mp4',               // Some browsers support this
    'audio/ogg;codecs=opus'    // Firefox alternative
  ];
  return types.find(type => MediaRecorder.isTypeSupported(type)) || '';
};

// Convert any audio to wav
async function convertToL16(audioBlob) {
  // 1. Decode audio
  const arrayBuffer = await audioBlob.arrayBuffer();
  const audioCtx = new AudioContext();
  const audioData = await audioCtx.decodeAudioData(arrayBuffer);

  // 2. Resample to 16kHz mono
  const offlineCtx = new OfflineAudioContext(1, 16000 * audioData.duration, 16000);
  const source = offlineCtx.createBufferSource();
  source.buffer = audioData;
  source.connect(offlineCtx.destination);
  source.start();
  const resampled = await offlineCtx.startRendering();

  // 3. Convert to 16-bit PCM (L16)
  const pcmData = new Int16Array(resampled.length);
  for (let i = 0; i < resampled.length; i++) {
    const sample = Math.max(-1, Math.min(1, resampled.getChannelData(0)[i]));
    pcmData[i] = sample * (sample < 0 ? 0x8000 : 0x7FFF); // 16-bit conversion
  }

  return new Blob([pcmData], { type: 'audio/l16' });
};

const recordAudio = () => {
  return new Promise(async (resolve) => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const options = {
      mimeType: getSupportedMimeType(),
      audioBitsPerSecond: 128000
    };
    const mediaRecorder = new MediaRecorder(stream, options);
    const audioChunks = [];

    mediaRecorder.addEventListener("dataavailable", (event) => {
      audioChunks.push(event.data);
    });

    const start = () => mediaRecorder.start();

    const stop = () =>
      new Promise(async (resolve) => {
        mediaRecorder.addEventListener("stop", async () => {
          const audioBlob = new Blob(audioChunks, { type: mediaRecorder.mimeType });
          
          const audioUrl = URL.createObjectURL(audioBlob);
          const audio = new Audio(audioUrl);
          const play = () => audio.play();
          resolve({ audioBlob, audioUrl, play });
        });

        mediaRecorder.stop();
      });

    resolve({ start, stop });
  });
};

const sleep = (time) => new Promise((resolve) => setTimeout(resolve, time));

const toggleRecording = async () => {
  if (!recording) {
    recorder = await recordAudio();
    recording = true;
    recorder.start();
  } else {
    const audio = await recorder.stop();
    sleep(1000);
    return audio;
  }
};

const playResponseAudio = (function () {
  const df = document.createDocumentFragment();
  return function Sound(src) {
    const snd = new Audio(src);
    df.appendChild(snd); // keep in fragment until finished playing
    snd.addEventListener("ended", function () {
      df.removeChild(snd);
    });
    snd.play();
    return snd;
  };
})();

const getRandomID = () => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

const scrollToBottom = () => {
  // Scroll the chat window to the bottom
  $("#chat-window").animate({
    scrollTop: $("#chat-window")[0].scrollHeight,
  });
};

const populateUserMessage = (userMessage, userRecording, currentImage) => {
  // Clear the input field
  $("#message-input").val("");

  // Append the user's message to the message list
  if (currentImage) {
    $("#message-list").append(
        `<div class='message-line my-text'><div class='message-box my-text${
          !lightMode ? " dark" : ""
        }'><div class='me'>
          <img src="${currentImage}" alt="User Image" class="img-thumbnail-custom" />
        </div></div></div>`
      );
  }
  if (userRecording) {
    const userRepeatButtonID = getRandomID();
    userRepeatButtonIDToRecordingMap[userRepeatButtonID] = userRecording;
    hideUserLoadingAnimation();
    $("#message-list").append(
      `<div class='message-line my-text'><div class='message-box my-text${
        !lightMode ? " dark" : ""
      }'><div class='me'>${userMessage}</div></div>
            <button id='${userRepeatButtonID}' class='btn volume repeat-button' onclick='userRepeatButtonIDToRecordingMap[this.id].play()'><i class='fa fa-volume-up'></i></button>
            </div>`
    );
  } else {
    $("#message-list").append(
      `<div class='message-line my-text'><div class='message-box my-text${
        !lightMode ? " dark" : ""
      }'><div class='me'>${userMessage}</div></div></div>`
    );
  }

  scrollToBottom();
};

const populateBotResponse = async (userMessage, currentImage) => {
  await showBotLoadingAnimation();
  // const response = await processUserMessage(userMessage);
  // responses.push(response);

  // const repeatButtonID = getRandomID();
  // botRepeatButtonIDToIndexMap[repeatButtonID] = responses.length - 1;
  // hideBotLoadingAnimation();
  // // Append the random message to the message list
  // $("#message-list").append(
  //   `<div class='message-line'><div class='message-box${
  //     !lightMode ? " dark" : ""
  //   }'>${
  //     response.openaiResponseText
  //   }</div><button id='${repeatButtonID}' class='btn volume repeat-button' onclick='playResponseAudio("data:audio/wav;base64," + responses[botRepeatButtonIDToIndexMap[this.id]].openaiResponseSpeech);console.log(this.id)'><i class='fa fa-volume-up'></i></button></div>`
  // );

  // playResponseAudio("data:audio/wav;base64," + response.openaiResponseSpeech);

  // scrollToBottom();
  
  try {
    // Get text response from puter.ai for OpenAI's GPT-4o
    const aiResponse = await puter.ai.chat(
      userMessage || 'What do you see?', 
      currentImage || undefined
    );
    const cleanAiResponse = cleanTextInput(aiResponse.message.content);

    // Then convert to speech using your endpoint
    const ttsResponse = await fetch(`/voice_assistant/text_to_speech`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text: cleanAiResponse,
        voice: voiceOption // Use selected voice option
      })
    });
    
    if (!ttsResponse.ok) {
      throw new Error('TTS conversion failed');
    }

    const audioBlob = await ttsResponse.blob();
    const audioUrl = URL.createObjectURL(audioBlob);

    // Store both text and audio response
    const responseObj = {
      text: cleanAiResponse,
      audioUrl: audioUrl,
      play: () => new Audio(audioUrl).play()
    };
    
    responses.push(responseObj);
    hideBotLoadingAnimation();
    
    // Display message with playback button
    const repeatButtonID = getRandomID();
    botRepeatButtonIDToIndexMap[repeatButtonID] = responses.length - 1;

    $("#message-list").append(
      `<div class='message-line'>
        <div class='message-box${!lightMode ? " dark" : ""}'>${cleanAiResponse}
        </div>
        <button id='${repeatButtonID}' class='btn volume repeat-button' 
          onclick='responses[botRepeatButtonIDToIndexMap[this.id]].play()'>
          <i class='fa fa-volume-up'></i>
        </button>
      </div>`
    );
    
    // Auto-play the audio response
    responseObj.play();
    scrollToBottom();
    
  } catch (error) {
    hideBotLoadingAnimation();
    $("#message-list").append(
      `<div class='message-line'><div class='message-box${
        !lightMode ? " dark" : ""
      }'>Sorry, there was an error processing your request.</div></div>`
    );
    console.error("Error:", error);
    scrollToBottom();
  }
};

$(document).ready(function () {
  // Set back link to tools page
  document.getElementById("back-link").href = `/tools`;

  // Listen for the "Enter" key being pressed in the input field
  $("#message-input").keyup(function (event) {
    let inputVal = cleanTextInput($("#message-input").val());

    if (event.keyCode === 13 && inputVal != "") {
      const message = inputVal;

      populateUserMessage(message, null, currentImage);
      populateBotResponse(message, currentImage);
    }

    inputVal = $("#message-input").val();

    if (inputVal == "" || inputVal == null) {
      $("#send-button")
        .removeClass("send")
        .addClass("microphone")
        .html("<i class='fa fa-microphone'></i>");
    } else {
      $("#send-button")
        .removeClass("microphone")
        .addClass("send")
        .html("<i class='fa fa-paper-plane'></i>");
    }
  });

  // When Image is uploaded
  $("#upload-button").click(async function () {
    $("#image-upload").click();
  });
  $("#image-upload").change(async function (e) {
    if(e.target.files && e.target.files[0]) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const imagePreview = document.getElementById('image-preview');
        const imagePreviewContainer = document.getElementById('image-preview-container');
        const clearImageButton = document.getElementById('clear-image');
        
        currentImage = event.target.result;
        imagePreviewContainer.style.display = 'block';
        imagePreview.src = event.target.result;
        Object.assign(imagePreviewContainer.style, {
          position: 'relative',
          display: 'block'
        });
        Object.assign(clearImageButton.style, {
          position: 'absolute',
          top: '10px',
          backgroundColor: 'rgba(255, 255, 255, 0.7)',
          borderRadius: '50%',
          width: '30px',
          height: '30px',
          padding: '0',
          display: 'inline-block',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: '10',
          border: 'none'
        });
        // Add hover effect
        clearImageButton.addEventListener('mouseenter', () => {
          clearImageButton.style.backgroundColor = 'rgba(255,0,0,0.7)';
          clearImageButton.style.color = 'white';
        });
        clearImageButton.addEventListener('mouseleave', () => {
          clearImageButton.style.backgroundColor = 'rgba(255,255,255,0.7)';
          clearImageButton.style.color = '';
        });
      };
      reader.readAsDataURL(e.target.files[0]);
    }
  });

  // Clear Image
  $("#clear-image").click(async function () {
    const imagePreview = document.getElementById('image-preview');
    const imagePreviewContainer = document.getElementById('image-preview-container');
    const clearImageButton = document.getElementById('clear-image');

    currentImage = null;
    imagePreview.value = '';
    imagePreviewContainer.style.display = 'none';
    clearImageButton.style.display = 'none';
  });

  // When the user clicks the "Send" button
  $("#send-button").click(async function () {
    if ($("#send-button").hasClass("microphone") && !recording) {
      toggleRecording();
      $(".fa-microphone").css("color", "#f44336");
      console.log("start recording");
      recording = true;
    } else if (recording) {
      toggleRecording().then(async (userRecording) => {
        console.log("stop recording");
        await showUserLoadingAnimation();
        const userMessage = await getSpeechToText(userRecording);
        populateUserMessage(userMessage, userRecording, currentImage);
        populateBotResponse(userMessage, currentImage);
      });
      $(".fa-microphone").css("color", "#125ee5");
      recording = false;
    } else {
      // Get the message the user typed in
      const message = cleanTextInput($("#message-input").val());

      populateUserMessage(message, null, currentImage);
      populateBotResponse(message, currentImage);

      $("#send-button")
        .removeClass("send")
        .addClass("microphone")
        .html("<i class='fa fa-microphone'></i>");
    }
  });

  // Initialize icons based on current mode
    if ($('body').hasClass('dark-mode')) {
        $('.light-icon').addClass('d-none');
        $('.dark-icon').removeClass('d-none');
        lightMode = false;
    }
  
  // handle the event of switching light-dark mode
  $("#light-dark-mode-switch").change(function () {
    $("body").toggleClass("dark-mode");
    $("html").toggleClass("dark-mode");
    $("#root").toggleClass("dark-mode");
    $(".message-box").toggleClass("dark");
    $("#message-input").toggleClass("dark-mode");
    $(".loading-dots").toggleClass("dark");
    $(".dot").toggleClass("dark-dot");
    $("#upload-button").toggleClass("dark-mode");
    $("#back-link").toggleClass("dark-mode")

    // Toggle icons
    $(".light-icon, .dark-icon").toggleClass("d-none");
    lightMode = !lightMode;
  });

  $("#voice-options").change(function () {
    voiceOption = $(this).val();
    console.log(voiceOption);
  });
});
