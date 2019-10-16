let video = document.getElementById("video");
let canvas = document.getElementById("canvas");
let canvasContext = canvas.getContext("2d");
let isStreaming = false;

navigator.mediaDevices
  .getUserMedia({ video: { width: 320, height: 240 }, audio: false })
  .then(stream => {
    video.srcObject = stream;
    video.onloadedmetadata = e => {
      video.play();
    };
  })
  .catch(err => {
    /* handle the error */
    console.log({ error });
  });

const processFrame = () => {
  canvasContext.drawImage(video, 0, 0, videoWidth, videoHeight);
  let imageData = canvasContext.getImageData(0, 0, videoWidth, videoHeight);

  console.log({ imageData });
};

const startVideoProcessing = () => {
  if (!isStreaming) {
    console.warn("Please startup your webcam");
    return;
  }

  canvasContext = canvas.getContext("2d");
  requestAnimationFrame(processFrame);
};

const handleVideoPlay = ev => {
  if (!isStreaming) {
    videoWidth = video.videoWidth;
    videoHeight = video.videoHeight;
    video.setAttribute("width", videoWidth);
    video.setAttribute("height", videoHeight);
    canvas.width = videoWidth;
    canvas.height = videoHeight;
    isStreaming = true;
  }
  startVideoProcessing();
};

video.addEventListener("canplay", handleVideoPlay, false);
