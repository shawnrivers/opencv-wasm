let video = document.getElementById("videoInput");

const videoWorker = new Worker("workers/video-worker.js");

let streaming = false;
let isCanvasReady = false;

const width = video.width;
const height = video.height;

let counter = 0;

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

  function processVideo() {
    try {
      let begin = Date.now();

      const srcData = context.getImageData(0, 0, width, height).data;

      context.drawImage(video, 0, 0, width, height);

      videoWorker.postMessage({ srcData, width, height });

      // schedule the next one.
      let delay = 1000 / FPS - (Date.now() - begin);

      counter += 1;

      setTimeout(processVideo, delay);
    } catch (err) {
      console.log(err);
    }
  }

  // schedule the first one.
  setTimeout(processVideo, 0);
};

videoWorker.onmessage = e => {
  const { moduleLoadFlag, isCVLoaded, features } = e.data;

  if (moduleLoadFlag && isCVLoaded) {
    main();
    isCanvasReady = true;
  } else {
    console.log("Result from worker:", {
      left: features.left,
      right: features.right
    });
  }
};
