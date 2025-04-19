let lightMode = true;
let recorder = null;
let recording = false;
let voiceOption = "en-AU_JackExpressive";
let modelOption = "en-US_BroadbandModel"
const responses = [];
const botRepeatButtonIDToIndexMap = {};
const userRepeatButtonIDToRecordingMap = {};
const baseUrl = window.env.BASE_URL;

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

const getLanguage = (option) => {
  const langCode = option.split(/[-_]/)[0].toLowerCase();
  const languageMap = {
    en: 'English',
    fr: 'French',
    es: 'Spanish',
    de: 'German',
    it: 'Italian',
    ja: 'Japanese',
    ko: 'Korean',
    pt: 'Portuguese',
    nl: 'Dutch'
  };

  return languageMap[langCode] || langCode;
}

const getSpeechToText = async (userRecording) => {
  const l16Audio = await convertToL16(userRecording.audioBlob);
  const formData = new FormData();
  formData.append("audio", l16Audio, "audio.l16");
  formData.append("model",modelOption)

  let response = await fetch(baseUrl + "/translator_assistant/speech_to_text", {
    method: "POST",
    body: formData,
  });
  console.log(response);
  response = await response.json();
  console.log(response);
  return response.text;
};

const processUserMessage = async (userMessage) => {
  const fromLang = getLanguage(modelOption);
  const toLang = getLanguage(voiceOption);
  console.log(fromLang,toLang)

  const prompt = `Task: Direct Translation Only  
        Source Language: ${fromLang}  
        Target Language: ${toLang}

        Guidelines:
        1. Translate **only** the content of the input from ${fromLang} to ${toLang}.  
        2. Maintain precise meaning and natural expression in ${toLang}.  
        3. Preserve proper nouns.  
        4. Do not include any explanation or commentary. Output only the translated sentence without romanization.
        5. Do **not** generate additional related translations.

        Examples:
        - EN: Hello → JA: こんにちは  
        - EN: Goodbye → JA: さようなら  
        - EN: Hello → KO: 안녕하세요  
        - EN: Goodbye → KO: 감사합니다  
        - KO: 안녕하세요 → EN: Hello  
        - JA: こんにちは → EN: Hello
        - KO: 'Annyeonghaseyo' → EN: 'Hello'
        - JP: 'Konnichiwa' → EN: 'Hello'

        Translate this:
        ${userMessage}`;
  
  let res = await puter.ai.chat(
    prompt,
    {"model": "meta-llama/llama-3.3-70b-instruct"}
  );
  const resText = res.message.content;

  let response = await fetch(baseUrl + "/translator_assistant/process_message", {
    method: "POST",
    headers: { Accept: "application/json", "Content-Type": "application/json" },
    body: JSON.stringify({ 
      userMessage: resText,
      voice: voiceOption,
      toLang: toLang
    }),
  });
  response = await response.json();
  console.log(response);
  return response;

  // let response = await fetch(baseUrl + "/translator_assistant/process_message", {
  //   method: "POST",
  //   headers: { Accept: "application/json", "Content-Type": "application/json" },
  //   body: JSON.stringify({ 
  //     userMessage: userMessage,
  //     voice: voiceOption,
  //     toLang: toLang,
  //     fromLang: fromLang
  //   }),
  // });
  // response = await response.json();
  // console.log(response);
  // return response;
};

const cleanTextInput = (value) => {
  return value
    .trim() // remove starting and ending spaces
    .replace(/[\n\t]/g, "") // remove newlines and tabs
    .replace(/<[^>]*>/g, "") // remove HTML tags
    .replace(/[<>&;]/g, ""); // sanitize inputs
};

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
const populateUserMessage = (userMessage, userRecording) => {
  // Clear the input field
  $("#message-input").val("");

  // Append the user's message to the message list

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

const populateBotResponse = async (userMessage) => {
  await showBotLoadingAnimation();
  const response = await processUserMessage(userMessage);
  responses.push(response);
  console.log(response)

  const repeatButtonID = getRandomID();
  botRepeatButtonIDToIndexMap[repeatButtonID] = responses.length - 1;
  hideBotLoadingAnimation();
  // Append the random message to the message list
  $("#message-list").append(
    `<div class='message-line'><div class='message-box${
      !lightMode ? " dark" : ""
    }'>${
      response.watsonxResponseText
    }</div><button id='${repeatButtonID}' class='btn volume repeat-button' onclick='playResponseAudio("data:audio/wav;base64," + responses[botRepeatButtonIDToIndexMap[this.id]].watsonxResponseSpeech);console.log(this.id)'><i class='fa fa-volume-up'></i></button></div>`
  );

  playResponseAudio("data:audio/wav;base64," + response.watsonxResponseSpeech);

  scrollToBottom();
};

$(document).ready(function () {
  // Set back link to tools page
  document.getElementById("back-link").onclick = () => {
    window.location.href = `${baseUrl}/tools`;
  }

  const fromLang = getLanguage(modelOption);
  const toLang = getLanguage(voiceOption);
  $("#to-language").text(toLang)
  $("#from-language").text(fromLang)

  // Listen for the "Enter" key being pressed in the input field
  $("#message-input").keyup(function (event) {
    let inputVal = cleanTextInput($("#message-input").val());

    if (event.keyCode === 13 && inputVal != "") {
      const message = inputVal;

      populateUserMessage(message, null);
      populateBotResponse(message);
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
        populateUserMessage(userMessage, userRecording);
        populateBotResponse(userMessage);
      });
      $(".fa-microphone").css("color", "#125ee5");
      recording = false;
    } else {
      // Get the message the user typed in
      const message = cleanTextInput($("#message-input").val());

      populateUserMessage(message, null);
      populateBotResponse(message);

      $("#send-button")
        .removeClass("send")
        .addClass("microphone")
        .html("<i class='fa fa-microphone'></i>");
    }
  });

  // handle the event of switching light-dark mode
  $("#light-dark-mode-switch").change(function () {
    $("body").toggleClass("dark-mode");
    $("html").toggleClass("dark-mode");
    $("#root").toggleClass("dark-mode");
    $(".message-box").toggleClass("dark");
    $(".loading-dots").toggleClass("dark");
    $(".dot").toggleClass("dark-dot");
    $("#back-link").toggleClass("dark-mode")
    lightMode = !lightMode;
  });

  $("#voice-options").change(function () {
    voiceOption = $(this).val();
    const toLang = getLanguage(voiceOption);
    $("#to-language").text(toLang)
    console.log(voiceOption);
  });

  $("#model-options").change(function () {
    modelOption = $(this).val();
    const fromLang = getLanguage(modelOption);
    $("#from-language").text(fromLang)
    console.log(modelOption);
  });
});
