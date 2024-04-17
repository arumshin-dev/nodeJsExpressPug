//front
const socket = new WebSocket(`wss://${window.location.host}`);
const messageList = document.querySelector("ul");
const messageForm = document.querySelector('#message');
const nickForm = document.querySelector('#nick');

// makeMessage 함수 정의: 메시지 유형과 페이로드(데이터)를 매개변수로 받습니다.
function makeMessage(type, payload) {
  // msg 객체를 생성합니다. 이 객체는 type과 payload 프로퍼티를 포함합니다.
  // 여기서, 객체 리터럴의 프로퍼티 축약 형식을 사용하여 {type: type, payload: payload}를 {type, payload}로 간단히 표현합니다.
  const msg = {type, payload};

  // JSON.stringify 메서드를 사용하여 msg 객체를 JSON 형식의 문자열로 변환합니다.
  // 이 문자열은 네트워크를 통해 송수신하기 적합한 형태로 데이터를 직렬화합니다.
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

//메세지form submit시 실행되는 함수
function haandleSubmit(event){
  // 기본 이벤트 동작을 막습니다. 여기서는 폼 제출 시 페이지 새로고침을 막습니다.
  event.preventDefault();
  // messageForm 내부의 "input" 요소를 선택하여 input 변수에 저장합니다.
  const input = messageForm.querySelector("input");
  // 소켓을 통해 서버로 메시지를 보냅니다. makeMessage 함수를 사용하여 "new_message" 유형과 입력 필드의 값을 포함하는 메시지 객체를 생성합니다.
  socket.send(makeMessage("new_message",input.value));
  // 콘솔에 입력 필드의 값을 출력합니다. 디버깅 목적으로 사용됩니다.
  console.log(input.value);
  // 입력 필드를 비웁니다. 메시지 전송 후 입력 필드를 초기화하여 다음 메시지를 입력받을 준비를 합니다.
  input.value='';
}

//닉네임form submit시 실행되는 함수
function handleNickSubmit(event) {  
  // 기본 이벤트 동작을 막습니다. 여기서는 폼 제출 시 페이지 새로고침을 막습니다.
  event.preventDefault();
  // nickForm 내부의 "input" 요소를 선택하여 input 변수에 저장합니다.
  const input = nickForm.querySelector('input');
  // 소켓을 통해 서버로 메시지를 보냅니다. makeMessage 함수를 사용하여 "nickname" 유형과 입력 필드의 값을 포함하는 메시지 객체를 생성합니다.
  socket.send(makeMessage("nickname",input.value));
  // 입력 필드를 비웁니다. 메시지 전송 후 입력 필드를 초기화하여 다음 메시지를 입력받을 준비를 합니다.
  input.value='';
}
//메세지form에서 submit 동작이 일어날 때 실행
messageForm.addEventListener("submit", haandleSubmit);
//닉네임form에서 submit 동작이 일어날 때 실행
nickForm.addEventListener("submit", handleNickSubmit);