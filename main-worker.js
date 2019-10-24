let video = document.getElementById("videoInput");
let canvasFrame = document.getElementById("canvasFrame");
let context = canvasFrame.getContext("2d");
let indicatorContext = document
  .getElementById("indicatorCanvas")
  .getContext("2d");

let videoWorker = new Worker("workers/video-worker.js");

let streaming = false;
let isCanvasReady = false;

const canvasWidth = canvasFrame.width;
const canvasHeight = canvasFrame.height;

let counter = 0;

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
  } catch (err) {
    console.log(err);
  }
};

const drawFace = (context, x, y, width, height) => {
  context.strokeStyle = "#000000";
  context.lineWidth = 2;
  context.strokeRect(x, y, width, height);
};

const drawEye = (context, x, y, width, height) => {
  context.strokeStyle = "#FF0000";
  context.lineWidth = 2;
  context.strokeRect(x, y, width, height);
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
  const { moduleLoadFlag, isCVLoaded, faceFeature, features, start } = e.data;

  if (moduleLoadFlag && isCVLoaded) {
    main();
    isCanvasReady = true;
  } else {
    const end = performance.now();

    indicatorContext.drawImage(video, 0, 0, canvasWidth, canvasHeight);

    if (faceFeature) {
      const faceX = faceFeature.x;
      const faceY = faceFeature.y;

      drawFace(
        indicatorContext,
        faceX,
        faceY,
        faceFeature.width,
        faceFeature.height
      );

      document.getElementById("faceX").textContent = faceX;
      document.getElementById("faceY").textContent = faceY;

      if (features.left) {
        const leftX = features.left.x;
        const leftY = features.left.y;

        drawEye(
          indicatorContext,
          leftX,
          leftY,
          features.left.width,
          features.left.height
        );

        document.getElementById("leftEyeX").textContent = leftX;
        document.getElementById("leftEyeY").textContent = leftY;
      }

      if (features.right) {
        const rightX = features.right.x;
        const rightY = features.right.y;

        drawEye(
          indicatorContext,
          rightX,
          rightY,
          features.right.width,
          features.right.height
        );

        document.getElementById("rightEyeX").textContent = rightX;
        document.getElementById("rightEyeY").textContent = rightY;
      }
    }

    document.getElementById("fps").textContent =
      Math.round((1000 / (end - start)) * 10) / 10;
    document.getElementById("ms").textContent = end - start;

    requestAnimationFrame(processVideo);
  }
};
