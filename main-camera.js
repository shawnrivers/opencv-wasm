let video = document.getElementById("videoInput");

let streaming = false;

const width = video.width;
const height = video.height;

let counter = 0;

cv["onRuntimeInitialized"] = () => {
  console.log({ cv });

  main();
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

  let src = new cv.Mat(video.height, video.width, cv.CV_8UC4);
  let dst = new cv.Mat(video.height, video.width, cv.CV_8UC1);
  let cap = new cv.VideoCapture(video);

  const FPS = 30;

  function processVideo() {
    try {
      let begin = Date.now();
      // start processing.
      cap.read(src);
      cv.cvtColor(src, dst, cv.COLOR_RGBA2GRAY);
      // console.log("cvtColor:", cv.cvtColor);

      if (counter < 100) {
        console.log({ src, dst });
      }

      cv.imshow("canvasOutput", dst);
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
