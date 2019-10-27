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
        const landmarks = result.landmarks._positions;

        const leftEyeLandmarks = landmarks.slice(36, 42);
        const rightEyeLandmarks = landmarks.slice(42, 48);

        const leftXs = leftEyeLandmarks.map(point => point._x);
        const leftYs = leftEyeLandmarks.map(point => point._y);
        const rightXs = rightEyeLandmarks.map(point => point._x);
        const rightYs = rightEyeLandmarks.map(point => point._y);

        const leftEyeX = Math.min(...leftXs);
        const leftEyeY = Math.min(...leftYs);
        const leftEyeWidth = Math.max(...leftXs) - leftEyeX;
        const leftEyeHeight = Math.max(...leftYs) - leftEyeY;
        const leftImageData = canvasContext.getImageData(
          leftEyeX,
          leftEyeY,
          leftEyeWidth,
          leftEyeHeight
        );

        const rightEyeX = Math.min(...rightXs);
        const rightEyeY = Math.min(...rightYs);
        const rightEyeWidth = Math.max(...rightXs) - rightEyeX;
        const rightEyeHeight = Math.max(...rightYs) - rightEyeY;
        const rightImageData = canvasContext.getImageData(
          rightEyeX,
          rightEyeY,
          rightEyeWidth,
          rightEyeHeight
        );

        const leftEye = {
          patch: leftImageData,
          x: leftEyeX,
          y: leftEyeY,
          width: leftEyeWidth,
          height: leftEyeHeight
        };

        const rightEye = {
          patch: rightImageData,
          x: rightEyeX,
          y: rightEyeY,
          width: rightEyeWidth,
          height: rightEyeHeight
        };

        // console.log({ leftEye, rightEye });

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

        const leftX = leftEye.x;
        const leftY = leftEye.y;
        const rightX = rightEye.x;
        const rightY = rightEye.y;

        document.getElementById("leftEyeX").textContent = leftX;
        document.getElementById("leftEyeY").textContent = leftY;
        document.getElementById("rightEyeX").textContent = rightX;
        document.getElementById("rightEyeY").textContent = rightY;
      }

      const end = performance.now();

      document.getElementById("fps").textContent =
        Math.round((1000 / (end - start)) * 10) / 10;
      document.getElementById("ms").textContent = Math.round(end - start);

      requestAnimationFrame(processVideo);
    } catch (err) {
      console.log(err);
    }
  };

  requestAnimationFrame(processVideo);
};

main();
