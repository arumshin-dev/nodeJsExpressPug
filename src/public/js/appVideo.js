// Socket.IO 클라이언트 라이브러리를 통해 서버에 연결하는 소켓 객체를 생성합니다.
const socket = io();

// HTML 문서에서 video 요소를 선택하여 myFace 변수에 저장합니다.
const myFace = document.getElementById("myFace");
// HTML 문서에서 음소거 버튼을 선택하여 muteBtn 변수에 저장합니다.
const muteBtn = document.getElementById("mute");
// HTML 문서에서 카메라 버튼을 선택하여 cameraBtn 변수에 저장합니다.
const cameraBtn = document.getElementById("camera");
const camerasSelect = document.getElementById("cameras");

// 미디어 스트림을 저장할 변수를 선언합니다.
let myStream;
// 음소거 상태를 저장할 변수를 선언하고, 초기값은 false로 설정합니다. (음소거되지 않음)
let muted = false;
// 카메라 상태를 저장할 변수를 선언하고, 초기값은 false로 설정합니다. (카메라가 켜져 있음)
let cameraOff = false;

async function getCameras() {
  try{
    const devices = await navigator.mediaDevices.enumerateDevices();
    const cameras = devices.filter(device => device.kind === "videoinput");
    cameras.forEach((camera) => {
      const option = document.createElement("option");
      option.value = camera.deviceId;
      option.innerText = camera.label;
      camerasSelect.appendChild(option);
    });
  }catch(e){
    console.log(e);
  }
}

// 비동기 함수 getMedia를 정의합니다. 이 함수는 사용자의 비디오 및 오디오를 가져옵니다.
async function getMedia() {
  try {
    // navigator.mediaDevices.getUserMedia를 사용하여 비디오 및 오디오 스트림을 요청합니다.
    myStream = await navigator.mediaDevices.getUserMedia({
      audio: true,
      video: true,
    });
    // 스트림 객체를 콘솔에 출력합니다.
    console.log(myStream);
    // 가져온 미디어 스트림을 video 요소의 srcObject 속성에 할당하여 비디오를 표시합니다.
    myFace.srcObject = myStream;
    await getCameras();
  } catch (e) {
    // 미디어 스트림을 가져오는 과정에서 오류가 발생하면 콘솔에 오류 메시지를 출력합니다.
    console.log(e);
  }
}

// getMedia 함수를 호출하여 페이지 로드 시 미디어 스트림을 즉시 가져옵니다.
getMedia();

// 음소거 버튼 클릭 이벤트를 처리하는 함수를 정의합니다.
function handleMuteClick() {
  myStream.getAudioTracks().forEach((track)=>(track.enabled = !track.enabled));
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
  myStream.getVideoTracks().forEach((track)=>(track.enabled = !track.enabled));
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

// muteBtn 요소에 "click" 이벤트 리스너를 추가하여 handleMuteClick 함수를 연결합니다.
muteBtn.addEventListener("click", handleMuteClick);
// cameraBtn 요소에 "click" 이벤트 리스너를 추가하여 handleCameraClick 함수를 연결합니다.
cameraBtn.addEventListener("click", handleCameraClick);
