let video = document.getElementById("videoInput");

let videoWorker = new Worker("workers/video-worker.js");

let streaming = false;
let isCanvasReady = false;

const width = video.width;
const height = video.height;

let counter = 0;

let leftX = null;
let leftY = null;
let rightX = null;
let rightY = null;

// cv["onRuntimeInitialized"] = () => {
//   main();
// };

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

  let canvasFrame = document.getElementById("canvasFrame");
  let context = canvasFrame.getContext("2d");

  const FPS = 30;

  const processVideo = () => {
    try {
      const begin = Date.now();

      const srcData = context.getImageData(0, 0, width, height).data;

      context.drawImage(video, 0, 0, width, height);

      videoWorker.postMessage({ srcData, width, height, begin });

      // schedule the next one.
      let delay = 1000 / FPS - (Date.now() - begin);

      document.getElementById("leftEyeX").textContent = leftX;
      document.getElementById("leftEyeY").textContent = leftY;
      document.getElementById("rightEyeX").textContent = rightX;
      document.getElementById("rightEyeY").textContent = rightY;

      // setTimeout(processVideo, delay);
      requestAnimationFrame(processVideo);
    } catch (err) {
      console.log(err);
    }
  };

  // schedule the first one.
  // setTimeout(processVideo, 0);
  requestAnimationFrame(processVideo);
};

videoWorker.onmessage = e => {
  const { moduleLoadFlag, isCVLoaded, features, begin } = e.data;

  if (moduleLoadFlag && isCVLoaded) {
    main();
    isCanvasReady = true;
  } else {
    leftX = features.left ? features.left.x : null;
    leftY = features.left ? features.left.y : null;
    rightX = features.right ? features.right.x : null;
    rightY = features.right ? features.right.y : null;

    const end = Date.now();

    document.getElementById("fps").textContent =
      Math.round((1000 / (end - begin)) * 10) / 10;

    // console.log({ timeList });
  }
};
