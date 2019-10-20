window = self;

let Module = {};

let faceCascade = null;
let eyeCascade = null;

const checkVariable = v => v !== undefined && v !== null;

importScripts("../libs/opencv.js");

Module.onRuntimeInitialized = () => {
  if (!checkVariable(faceCascade)) {
    faceCascade = new cv.CascadeClassifier();
    const faceCascadeLoaded = faceCascade.load("face.xml");

    console.log({ faceCascadeLoaded });
  }

  if (!checkVariable(eyeCascade)) {
    eyeCascade = new cv.CascadeClassifier();
    const eyeCascadeLoaded = eyeCascade.load("eye.xml");

    console.log({ eyeCascadeLoaded });
  }

  postMessage({ moduleLoadFlag: true, isCVLoaded: true, features: null });
};

Module.preRun = [
  () => {
    Module.FS_createPreloadedFile(
      "/",
      "face.xml",
      "../cascade/haarcascade_frontalface_default.xml",
      true,
      false
    );
    Module.FS_createPreloadedFile(
      "/",
      "eye.xml",
      "../cascade/haarcascade_eye.xml",
      true,
      false
    );
  }
];

let counter = 0;
let faceConsoleCounter = 0;

let src = null;
let gray = null;
let faces = null;
let eyes = null;
let previousWidth = 0;
let previousHeight = 0;

onmessage = e => {
  const { srcData, width, height, start } = e.data;

  src = new cv.Mat(height, width, cv.CV_8UC4);
  gray = new cv.Mat(height, width, cv.CV_8UC1);
  faces = new cv.RectVector();
  eyes = new cv.RectVector();

  const initialized =
    checkVariable(faceCascade) &&
    checkVariable(eyeCascade) &&
    checkVariable(src) &&
    checkVariable(gray) &&
    checkVariable(faces) &&
    checkVariable(eyes);

  if (initialized) {
    src.data.set(srcData);

    cv.cvtColor(src, gray, cv.COLOR_RGBA2GRAY);

    faceCascade.detectMultiScale(gray, faces, 1.1, 3, 0);

    let rects = {
      left: null,
      right: null
    };

    for (let i = 0; i < faces.size(); i++) {
      const faceRect = faces.get(i);
      const faceX = faceRect.x;
      const faceY = faceRect.y;
      const faceWidth = faceRect.width;
      const faceHeight = faceRect.height;

      let roiGray = gray.roi(faceRect);

      eyeCascade.detectMultiScale(roiGray, eyes);

      for (let j = 0; j < eyes.size(); j++) {
        const eyeRect = eyes.get(j);
        const eyeX = eyeRect.x;
        const eyeY = eyeRect.y;
        const eyeWidth = eyeRect.width;
        const eyeHeight = eyeRect.height;

        if (eyeY + eyeHeight / 2 < faceHeight / 2) {
          if (eyeX + eyeWidth / 2 < faceWidth / 2) {
            rects.left = {
              x: faceX + eyeX,
              y: faceY + eyeY,
              width: eyeWidth,
              height: eyeHeight
            };
          } else {
            rects.right = {
              x: faceX + eyeX,
              y: faceY + eyeY,
              width: eyeWidth,
              height: eyeHeight
            };
          }
        }
      }
    }

    postMessage({
      moduleLoadFlag: false,
      isCVLoaded: true,
      features: rects,
      start
    });

    src.delete();
    gray.delete();
    faces.delete();
    eyes.delete();
  }
};
