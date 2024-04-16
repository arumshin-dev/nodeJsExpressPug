//front
const socket = new WebSocket(`wss://${window.location.host}`);
const messageList = document.querySelector("ul");
const messageForm = document.querySelector('#message');
const nickForm = document.querySelector('#nick');

function makeMessage(type, payload) {
  const msg = {type, payload};
  return JSON.stringify(msg); 
}

function handleOpen(){
  console.log("Connected to Server ✅");
}

socket.addEventListener("open", handleOpen);

socket.addEventListener("message", (message) => {
  console.log("New message: ", message.data);
  const li = document.createElement("li");
  li.innerText = message.data;
  messageList.append(li);
});

socket.addEventListener("close", () =>{
  console.log("Disconnected to Server ❌");
});

// setTimeout(() => {
//   socket.send("hello from the browser!!");
// }, 10000);

function haandleSubmit(event){
  event.preventDefault();
  const input = messageForm.querySelector("input");
  socket.send(makeMessage("new_message",input.value));
  console.log(input.value);
  input.value='';
}

function handleNickSubmit(event) {  
  event.preventDefault();
  const input = nickForm.querySelector('input');
  socket.send(makeMessage("nickname",input.value));
}

messageForm.addEventListener("submit", haandleSubmit);
nickForm.addEventListener("submit", handleNickSubmit);