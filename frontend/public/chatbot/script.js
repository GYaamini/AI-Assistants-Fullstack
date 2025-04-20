let savedPastText = []; // Variable to store the message
let savedPastResponse = []; // Variable to store the message
// const baseUrl = window.env.BASE_URL;

document.addEventListener('DOMContentLoaded', () => {
  // Set back link to tools page
  document.getElementById("back-link").href = `/tools`;

  const messagesContainer = document.getElementById('messages-container');
  const messageForm = document.getElementById('message-form');
  const messageInput = document.getElementById('message-input');

  const cleanText = (value) => {
    return value
      .trim() // remove starting and ending spaces
      .replace(/["<>&;]/g, "") //remove double quotes
      .replace(/[\n\t]/g, "") // remove newlines and tabs
      .replace(/<[^>]*>/g, "") // remove HTML tags
      .replace(/[<>&;]/g, ""); // sanitize inputs
  };

  const addMessage = (message, role, imgSrc) => {
    // create elements in the dialogue window
    const messageElement = document.createElement('div');
    const textElement = document.createElement('p');
    const imgElement = document.createElement('img');
    
    messageElement.className = `message ${role}`;
    imgElement.src = `${imgSrc}`;

    // append the image and message to the message element
    messageElement.appendChild(imgElement);
    textElement.innerText = message;
    messageElement.appendChild(textElement);
    messagesContainer.appendChild(messageElement);
    // create the ending of the message
    var clearDiv = document.createElement("div");
    clearDiv.style.clear = "both";
    messagesContainer.appendChild(clearDiv);
  };

  const sendMessage = async (message) => {
    // addMessage(message, 'user','user.jpeg');
    addMessage(message, 'user','/chatbot/human.jpeg');
    // Loading animation
    const loadingElement = document.createElement('div');
    const loadingtextElement = document.createElement('p');
    loadingElement.className = `loading-animation`;
    loadingtextElement.className = `loading-text`;
    loadingtextElement.innerText = 'Loading....Please wait';
    messagesContainer.appendChild(loadingElement);
    messagesContainer.appendChild(loadingtextElement);


    async function makePostRequest(msg) {
      const url = "/chatbot/handle_prompt";  // Make a POST request to this url
      const requestBody = {
        prompt: msg
      };
    
      try {
        const response = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(requestBody)
        });
        
        if (response.status == 500 || response.status == 404){
          return {"error": "Ooops unable to handle :/"}
          // addMessage("Ooops unable to handle :/", 'error','chat_error.jpg');
        }else{
          const data = await response.text();
          console.log(data);
          return data;
        }
      } catch (error) {
        // Handle any errors that occurred during the request
        console.error('Error:', error);
        return error
      }
    }
    
    var res = await makePostRequest(message);
    data = {"response": res}

    // Deleting the loading animation
    const loadanimation = document.querySelector('.loading-animation');
    const loadtxt = document.querySelector('.loading-text');
    loadanimation.remove();
    loadtxt.remove();

    if (data.error) {
      const errorMessage = JSON.stringify(data);
      console.log(errorMessage)
      addMessage(data.error, 'error','/chatbot/chat_error.jpg');      
    }  else {
      const responseMessage = cleanText(data["response"]);
      addMessage(responseMessage, 'aibot','/chatbot/chat_normal.jpg');
    }
    
  };

  //Section: Button to submit to the model and get the response
  messageForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    const message = messageInput.value.trim();
    if (message !== '') {
      messageInput.value = '';
      await sendMessage(message);
    }
  });
});
