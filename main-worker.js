let video = document.getElementById("videoInput");
let canvasFrame = document.getElementById("canvasFrame");
let context = canvasFrame.getContext("2d");

let videoWorker = new Worker("workers/video-worker.js");

let streaming = false;
let isCanvasReady = false;

const canvasWidth = canvasFrame.width;
const canvasHeight = canvasFrame.height;

let counter = 0;

let leftX = null;
let leftY = null;
let rightX = null;
let rightY = null;

const processVideo = () => {
  try {
    const start = performance.now();

    context.drawImage(video, 0, 0, canvasWidth, canvasHeight);

    const srcData = context.getImageData(0, 0, canvasWidth, canvasHeight).data;

    videoWorker.postMessage({
      srcData,
      width: canvasWidth,
      height: canvasHeight,
      start
    });

    document.getElementById("leftEyeX").textContent = leftX;
    document.getElementById("leftEyeY").textContent = leftY;
    document.getElementById("rightEyeX").textContent = rightX;
    document.getElementById("rightEyeY").textContent = rightY;
  } catch (err) {
    console.log(err);
  }
};

const main = () => {
  navigator.mediaDevices
    .getUserMedia({ video: true, audio: false })
    .then(function(stream) {
      video.srcObject = stream;
      video.play();
    })
    .catch(function(err) {
      console.log("An error occurred! " + err);
    });

  processVideo();
};

videoWorker.onmessage = e => {
  const { moduleLoadFlag, isCVLoaded, features, start } = e.data;

  if (moduleLoadFlag && isCVLoaded) {
    main();
    isCanvasReady = true;
  } else {
    leftX = features.left ? features.left.x : null;
    leftY = features.left ? features.left.y : null;
    rightX = features.right ? features.right.x : null;
    rightY = features.right ? features.right.y : null;

    const end = performance.now();

    document.getElementById("fps").textContent =
      Math.round((1000 / (end - start)) * 10) / 10;

    requestAnimationFrame(processVideo);
  }
};
