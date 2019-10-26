const video = document.getElementById("videoInput");

const main = async () => {
  await faceapi.nets.tinyFaceDetector.load("/models");
  await faceapi.loadFaceLandmarkModel("/models");

  console.log("loadFaceLandmarkModel, tinyFaceDetector.load done.");

  navigator.mediaDevices
    .getUserMedia({ video: true, audio: false })
    .then(stream => {
      video.srcObject = stream;
      video.play();
    })
    .catch(function(err) {
      console.log("An error occurred! " + err);
    });

  const canvasFrame = document.getElementById("canvasFrame");
  let canvasContext = canvasFrame.getContext("2d");

  const canvasWidth = canvasFrame.width;
  const canvasHeight = canvasFrame.height;

  const processVideo = async () => {
    try {
      const start = performance.now();

      canvasContext.drawImage(video, 0, 0, canvasWidth, canvasHeight);

      const options = new faceapi.TinyFaceDetectorOptions({
        inputSize: 128,
        scoreThreshold: 0.5
      });

      let result = null;

      result = await faceapi
        .detectSingleFace(canvasFrame, options)
        .withFaceLandmarks();

      if (result) {
        // console.log({ result });

        const indicatorCanvas = document.getElementById("indicatorCanvas");
        const indicatorContext = indicatorCanvas.getContext("2d");
        const indicatorWidth = indicatorCanvas.width;
        const indicatorHeight = indicatorCanvas.height;

        indicatorContext.drawImage(
          video,
          0,
          0,
          indicatorWidth,
          indicatorHeight
        );

        const dims = faceapi.matchDimensions(
          indicatorCanvas,
          canvasFrame,
          true
        );

        const resizedResult = faceapi.resizeResults(result, dims);

        // faceapi.draw.drawDetections(indicatorCanvas, resizedResult);
        faceapi.draw.drawFaceLandmarks(indicatorCanvas, resizedResult);
      }

      // const features = processFrame(srcData, width, height);

      // const leftX = features.left ? features.left.x : null;
      // const leftY = features.left ? features.left.y : null;
      // const rightX = features.right ? features.right.x : null;
      // const rightY = features.right ? features.right.y : null;

      const end = performance.now();

      document.getElementById("fps").textContent =
        Math.round((1000 / (end - start)) * 10) / 10;
      document.getElementById("ms").textContent = end - start;

      // document.getElementById("leftEyeX").textContent = leftX;
      // document.getElementById("leftEyeY").textContent = leftY;
      // document.getElementById("rightEyeX").textContent = rightX;
      // document.getElementById("rightEyeY").textContent = rightY;

      requestAnimationFrame(processVideo);
    } catch (err) {
      console.log(err);
    }
  };

  requestAnimationFrame(processVideo);
};

main();
