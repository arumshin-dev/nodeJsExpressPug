// Socket.IO 클라이언트 라이브러리를 통해 서버에 연결하는 소켓 객체를 생성합니다.
const socket = io();

// HTML 문서에서 video 요소를 선택하여 myFace 변수에 저장합니다.
const myFace = document.getElementById("myFace");
// HTML 문서에서 음소거 버튼을 선택하여 muteBtn 변수에 저장합니다.
const muteBtn = document.getElementById("mute");
// HTML 문서에서 카메라 버튼을 선택하여 cameraBtn 변수에 저장합니다.
const cameraBtn = document.getElementById("camera");
// HTML 문서에서 ID가 'cameras'인 요소를 찾아 camerasSelect 변수에 저장합니다.
const camerasSelect = document.getElementById("cameras");

const welcome = document.getElementById("welcome");
const call = document.getElementById("call");

call.hidden = true;

// 미디어 스트림을 저장할 변수를 선언합니다.
let myStream;
// 음소거 상태를 저장할 변수를 선언하고, 초기값은 false로 설정합니다. (음소거되지 않음)
let muted = false;
// 카메라 상태를 저장할 변수를 선언하고, 초기값은 false로 설정합니다. (카메라가 켜져 있음)
let cameraOff = false;
// getCameras라는 비동기 함수를 정의합니다.
async function getCameras() {
  try {
    // 사용 가능한 모든 미디어 장치를 나열합니다.
    const devices = await navigator.mediaDevices.enumerateDevices();
    // 나열된 장치 중에서 비디오 입력 장치(카메라)만을 필터링합니다.
    const cameras = devices.filter(device => device.kind === "videoinput");
    // 현재 스트림에서 첫 번째 비디오 트랙을 가져옵니다. 이 트랙은 현재 사용 중인 카메라를 대표합니다.
    const currentCamera = myStream.getVideoTracks()[0];
    // 필터링된 카메라 리스트를 순회하면서 각 카메라에 대해 처리를 수행합니다.
    cameras.forEach((camera) => {
      // 새로운 'option' HTML 요소를 생성합니다.
      const option = document.createElement("option");
      // option 요소의 value 속성에 카메라의 deviceId를 설정합니다.
      option.value = camera.deviceId;
      // option 요소의 텍스트로 카메라의 라벨(이름)을 설정합니다.
      option.innerText = camera.label;
      // 현재 사용 중인 카메라와 일치하는 경우, 해당 option을 선택된 상태로 설정합니다.
      if(currentCamera.label == camera.label) {
        option.selected = true;
      }
      // 생성된 option 요소를 카메라 선택 드롭다운 메뉴에 추가합니다.
      camerasSelect.appendChild(option);
    });
  } catch(e) {
    // 오류가 발생하면 콘솔에 오류 메시지를 출력합니다.
    console.log(e);
  }
}


// 비동기 함수 getMedia를 정의합니다. 이 함수는 사용자의 비디오 및 오디오를 가져옵니다.
async function getMedia(deviceId) {
  // initialConstraints 객체는 비디오와 오디오 스트림에 대한 초기 요청 제약 조건을 지정합니다.
  const initialConstraints = {
      audio: true,  // 오디오 트랙을 요청합니다. true는 시스템 기본 마이크를 사용하도록 요청합니다.
      video: { facingMode: "user" }  // 비디오 트랙을 요청하며, 사용자(전면) 카메라를 사용하도록 지정합니다.
  };

  // cameraConstraints 객체는 특정 카메라를 선택할 때 사용되는 요청 제약 조건을 지정합니다.
  const cameraConstraints = {
      audio: true,  // 오디오 트랙을 요청합니다. 여기서도 기본 마이크를 사용하도록 요청합니다.
      video: { deviceId: { exact: deviceId } }  // 비디오 트랙을 요청하며, 특정 deviceId를 가진 카메라를 정확히 사용하도록 설정합니다.
      // deviceId는 카메라 선택 로직에 의해 결정된 특정 카메라의 고유 식별자입니다.
  };

  try {
    // navigator.mediaDevices.getUserMedia를 사용하여 비디오 및 오디오 스트림을 요청합니다.
    myStream = await navigator.mediaDevices.getUserMedia(deviceId ? cameraConstraints : initialConstraints);
    // 스트림 객체를 콘솔에 출력합니다.
    //console.log(myStream);
    // 가져온 미디어 스트림을 video 요소의 srcObject 속성에 할당하여 비디오를 표시합니다.
    myFace.srcObject = myStream;
    if (!deviceId){
      await getCameras();
    }
  } catch (e) {
    // 미디어 스트림을 가져오는 과정에서 오류가 발생하면 콘솔에 오류 메시지를 출력합니다.
    console.log(e);
  }
}

// 음소거 버튼 클릭 이벤트를 처리하는 함수를 정의합니다.
function handleMuteClick() {
  // myStream에서 오디오 트랙들을 가져와 각 트랙에 대해 반복 실행합니다.
  myStream.getAudioTracks().forEach((track) => 
      // 각 오디오 트랙의 enabled 상태를 현재의 반대로 설정합니다.
      // 즉, 트랙이 활성화되어 있으면 비활성화하고, 비활성화되어 있으면 활성화합니다.
      track.enabled = !track.enabled
  );

  if (!muted) {
    // 현재 음소거 상태가 아니라면 버튼의 텍스트를 "Unmute"로 변경하고, 음소거 상태를 true로 설정합니다.
    muteBtn.innerText = "Unmute";
    muted = true;
  } else {
    // 현재 음소거 상태라면 버튼의 텍스트를 "Mute"로 변경하고, 음소거 상태를 false로 설정합니다.
    muteBtn.innerText = "Mute";
    muted = false;
  }
}

// 카메라 버튼 클릭 이벤트를 처리하는 함수를 정의합니다.
function handleCameraClick() {
  // myStream에서 비디오 트랙들을 가져와 각 트랙에 대해 반복 실행합니다.
  myStream.getVideoTracks().forEach((track) => 
      // 각 비디오 트랙의 enabled 상태를 현재의 반대로 설정합니다.
      // 즉, 트랙이 활성화되어 있으면 비활성화하고, 비활성화되어 있으면 활성화합니다.
      track.enabled = !track.enabled
  );

  if (cameraOff) {
    // 현재 카메라가 꺼져 있다면 버튼의 텍스트를 "Turn Camera Off"로 변경하고, 카메라 상태를 false로 설정합니다.
    cameraBtn.innerText = "Turn Camera Off";
    cameraOff = false;
  } else {
    // 현재 카메라가 켜져 있다면 버튼의 텍스트를 "Turn Camera On"으로 변경하고, 카메라 상태를 true로 설정합니다.
    cameraBtn.innerText = "Turn Camera On";
    cameraOff = true;
  }
}

// handleCameraChange라는 비동기 함수를 정의합니다.
async function handleCameraChange(){
  // getMedia 함수를 호출하여 사용자가 선택한 새 카메라로 미디어 스트림을 업데이트합니다.
  // camerasSelect.value는 드롭다운 메뉴에서 선택된 카메라의 deviceId를 나타냅니다.
  await getMedia(camerasSelect.value);

  // muted 변수의 값이 true인지 확인합니다. muted는 전역 변수로, 오디오가 음소거 상태인지 아닌지를 나타냅니다.
  if (muted) {
    // 음소거 상태인 경우, 모든 오디오 트랙을 비활성화합니다.
    myStream.getAudioTracks().forEach((track) => (track.enabled = false));
  } else {
    // 음소거 상태가 아닌 경우, 모든 오디오 트랙을 활성화합니다.
    myStream.getAudioTracks().forEach((track) => (track.enabled = true));
  }
}


// muteBtn 요소에 "click" 이벤트 리스너를 추가하여 handleMuteClick 함수를 연결합니다.
muteBtn.addEventListener("click", handleMuteClick);
// cameraBtn 요소에 "click" 이벤트 리스너를 추가하여 handleCameraClick 함수를 연결합니다.
cameraBtn.addEventListener("click", handleCameraClick);
// camerasSelect 요소에 'input' 이벤트 리스너를 추가합니다.
// 이 리스너는 사용자가 카메라 선택 드롭다운 메뉴에서 입력(카메라 선택 변경)을 할 때마다 작동합니다.
camerasSelect.addEventListener("input", handleCameraChange);

const welcomeForm = welcome.querySelector("form");

function handleWelcomeSubmit(event) {
  event.preventDefault();
  const input = welcomeForm.querySelector("input");
  socket.emit("join_room",input.value);
  input.value = "";
}

welcomeForm.addEventListener("submit",handleWelcomeSubmit);