let lightMode = true;
let isFirstMessage = true;
let formData = new FormData();
const responses = [];
const baseUrl = window.env.BASE_URL;

async function showBotLoadingAnimation() {
  await sleep(200);
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

const processUserMessage = async (userMessage) => {
  let response = await fetch(baseUrl + "/pdf_summarizer/get_context", {
    method: "POST",
    headers: { Accept: "application/json", "Content-Type": "application/json" },
    body: JSON.stringify({ userMessage: userMessage }),
  });

  if (!response.ok) {
    return { botResponse: "Something went wrong :/" };
  }

  try {
    const { context } = await response.json();
    console.log(context)
    const prompt = `DOCUMENT CONTEXT:
      ${context.join('\n\n')}
      
      USER QUESTION: ${userMessage}
      
      INSTRUCTIONS:
      - Answer concisely using only the provided context
      - Format response
      - Cite sources using [Page X] notation when possible
      - If unsure, say "The document doesn't contain this information`;

    const res = await puter.ai.chat(
      prompt,
      {
        model: "meta-llama/llama-3.3-70b-instruct",
        temperature: 0.3
      }
    );

    return {botResponse: res.message.content};

  } catch (error) {
    console.error("Failed to parse JSON:", error);
    return { botResponse: "Invalid server response :/" };
  }
};

// const processUserMessage = async (userMessage) => {
//   let response = await fetch(baseUrl + "/pdf_summarizer/process_message", {
//     method: "POST",
//     headers: { Accept: "application/json", "Content-Type": "application/json" },
//     body: JSON.stringify({ userMessage: userMessage }),
//   });

//   if (!response.ok) {
//     return { bot_response: "Something went wrong :/" };
//   } else {
//     try {
//       response = await response.json();
//       return response;
//     } catch (error) {
//       console.error("Failed to parse JSON:", error);
//       return { bot_response: "Invalid server response :/" };
//     }
//   }
// };

const cleanTextInput = (value) => {
  return value
    .trim() // remove starting and ending spaces
    .replace(/[\n\t]/g, "") // remove newlines and tabs
    .replace(/<[^>]*>/g, "") // remove HTML tags
    .replace(/[<>&;]/g, ""); // sanitize inputs
};

const sleep = (time) => new Promise((resolve) => setTimeout(resolve, time));

const scrollToBottom = () => {
  // Scroll the chat window to the bottom
  $("#chat-window").animate({
    scrollTop: $("#chat-window")[0].scrollHeight,
  });
};

const populateUserMessage = (userMessage) => {
  // Clear the input field
  $("#message-input").val("");

  // Append the user's message to the message list
    $("#message-list").append(
      `<div class='message-line my-text'><div class='message-box my-text${
        !lightMode ? " dark" : ""
      }'><div class='me'>${userMessage}</div></div></div>`
    );

  scrollToBottom();
};


const populateBotResponse = async (userMessage="") => {
  await showBotLoadingAnimation();

  let response;
  let uploadButtonHtml = '';

  if (isFirstMessage == true) {
    response = { botResponse: "Hello there! I'm your friendly data assistant, ready to answer any questions regarding your data. Could you please upload a PDF file for me to analyze?"};
    uploadButtonHtml = `
        <input type="file" id="file-upload" accept=".pdf" hidden>
        <button id="upload-button" class="btn btn-primary btn-sm">Upload File</button>
    `;

  } else if([...formData.keys()].length === 0) {
    response = { botResponse: "Could you please upload a PDF file for me to analyze?"};
  } else {
    response = await processUserMessage(userMessage);
  }
  console.log(response)
  renderBotResponse(response, uploadButtonHtml)

  // Event listener for file upload
  if (isFirstMessage == true) {
    $("#upload-button").on("click", function () {
      $("#file-upload").click();
    });

    $("#file-upload").on("change", async function () {
      const file = this.files[0];

      await showBotLoadingAnimation();

      // Append the file to the FormData instance
      formData.append('file', file);

      // Now send this data to /process-document endpoint
      let response = await fetch(baseUrl + "/pdf_summarizer/process_document", {
        method: "POST",
        headers: { Accept: "application/json" }, // "Content-Type" should not be explicitly set here, the browser will automatically set it to "multipart/form-data"
        body: formData,
      });

      if (response.status !== 400) {
           document.querySelector('#upload-button').disabled = true;
      }

      response = await response.json();
      console.log('/process_document', response)
      renderBotResponse(response, '')
    });


    isFirstMessage = false; // after the first message, set this to false
  }
};

const renderBotResponse = (response, uploadButtonHtml) => {
  responses.push(response);

  hideBotLoadingAnimation();

  $("#message-list").append(
    `<div class='message-line'><div class='message-box${!lightMode ? " dark" : ""}'>${response.botResponse.trim()}<br>${uploadButtonHtml}</div></div>`
  );

  scrollToBottom();
}


$(document).ready(function () {
  // Set back link to tools page
  document.getElementById("back-link").href = `${baseUrl}/tools`;

  populateBotResponse()

  // Listen for the "Enter" key being pressed in the input field
  $("#message-input").keyup(function (event) {
    if ($("#message-input").val() != "") {
      let inputVal = cleanTextInput($("#message-input").val());

      if (event.keyCode === 13 && inputVal != "") {
        const message = inputVal;

        populateUserMessage(message);
        populateBotResponse(message);
      }

      inputVal = $("#message-input").val();
    }
  });

  // When the user clicks the "Send" button
  $("#send-button").click(async function () {
    // Get the message the user typed in
    if ($("#message-input").val() != "") {
      const message = cleanTextInput($("#message-input").val());

      populateUserMessage(message);
      populateBotResponse(message);
    }
  });

  //reset chat
  // When the user clicks the "Reset" button
  $("#reset-button").click(async function () {
    // Clear the message list
    $("#message-list").empty();
    hideBotLoadingAnimation

    // Reset the responses array
    responses.splice(0, responses.length);

    // Remove document data
    if (formData.has('file')) {
      formData.delete('file');
    }

    // Reset isFirstMessage flag
    isFirstMessage = true;

    $("#message-input").val("");

    // Start over
    populateBotResponse();
    console.log(isFirstMessage)
  });


  // handle the event of switching light-dark mode
  $("#light-dark-mode-switch").change(function () {
    $("body").toggleClass("dark-mode");
    $("html").toggleClass("dark-mode");
    $("#root").toggleClass("dark-mode");
    $(".message-box").toggleClass("dark");
    $("#message-input").toggleClass("dark-mode");
    $(".loading-dots").toggleClass("dark");
    $(".dot").toggleClass("dark-dot");
    $("#back-link").toggleClass("dark-mode")
    lightMode = !lightMode;
  });
});
