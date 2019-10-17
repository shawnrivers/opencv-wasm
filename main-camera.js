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

  let canvasFrame = document.getElementById("canvasFrame");
  let context = canvasFrame.getContext("2d");

  let src = new cv.Mat(video.height, video.width, cv.CV_8UC4);
  let dst = new cv.Mat(video.height, video.width, cv.CV_8UC1);

  const FPS = 30;

  function processVideo() {
    try {
      let begin = Date.now();

      context.drawImage(video, 0, 0, width, height);
      src.data.set(context.getImageData(0, 0, width, height).data);

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
