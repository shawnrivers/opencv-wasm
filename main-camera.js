let video = document.getElementById("videoInput");

const videoWorker = new Worker("workers/video-worker.js");

let streaming = false;
let isCanvasReady = false;

const width = video.width;
const height = video.height;

let counter = 0;

// let cv2 = null;

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

  // let src = new cv.Mat(video.height, video.width, cv.CV_8UC4);
  // let dst = new cv.Mat(video.height, video.width, cv.CV_8UC1);

  const FPS = 30;

  function processVideo() {
    try {
      let begin = Date.now();

      const srcData = context.getImageData(0, 0, width, height).data;

      context.drawImage(video, 0, 0, width, height);
      // src.data.set(srcData);

      videoWorker.postMessage({ srcData, width, height });

      // cv.cvtColor(src, dst, cv.COLOR_RGBA2GRAY);

      // if (counter < 100) {
      //   console.log({ src, dst });
      // }

      // cv.imshow("canvasOutput", dst);

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
  const { moduleLoadFlag, isCVLoaded, face } = e.data;

  if (moduleLoadFlag && isCVLoaded) {
    main();
    isCanvasReady = true;
  } else {
    console.log("Result from worker:", face);
    // console.log("cv in main thread:", cv);
    // if (cv2) {
    //   cv2.imshow("canvasOutput", dst);
    // }
  }
};
