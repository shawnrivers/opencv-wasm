window = self;

let Module = {};

Module.onRuntimeInitialized = () => {
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

importScripts("../libs/opencv_wasm.js");

let counter = 0;
let faceConsoleCounter = 0;

let src = null;
let gray = null;
let faces = null;
let eyes = null;
let faceCascade = null;
let eyeCascade = null;
let previousWidth = 0;
let previousHeight = 0;

// console.log("[videoWorker] window:", window);
console.log("[videoWorker] cv:", cv);
console.log("[videoWorker] Module:", Module);

const checkVariable = v => v !== undefined && v !== null;

onmessage = e => {
  const { srcData, width, height, begin } = e.data;

  if (!faceCascade) {
    faceCascade = new cv.CascadeClassifier();
    const faceCascadeLoaded = faceCascade.load("face.xml");

    console.log({ faceCascadeLoaded });
  }

  if (!eyeCascade) {
    eyeCascade = new cv.CascadeClassifier();
    const eyeCascadeLoaded = eyeCascade.load("eye.xml");

    console.log({ eyeCascadeLoaded });
  }

  if (!src || previousWidth !== width || previousHeight !== height) {
    if (checkVariable(src)) {
      src.delete();
    }

    src = new cv.Mat(height, width, cv.CV_8UC4);
    previousWidth = width;
    previousHeight = height;

    console.log({ previousWidth, previousHeight, width, height });
  }

  if (!gray || previousWidth !== width || previousHeight !== height) {
    if (checkVariable(gray)) {
      gray.delete();
    }

    gray = new cv.Mat(height, width, cv.CV_8UC1);
    previousWidth = width;
    previousHeight = height;

    console.log({ previousWidth, previousHeight, width, height });
  }

  if (!faces) {
    if (checkVariable(faces)) {
      faces.delete();
    }
    faces = new cv.RectVector();
  }

  if (!eyes) {
    if (checkVariable(eyes)) {
      eyes.delete();
    }
    eyes = new cv.RectVector();
  }

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

    for (let i = 0; i < faces.size(); ++i) {
      const faceRect = faces.get(i);
      const faceX = faceRect.x;
      const faceY = faceRect.y;
      const faceWidth = faceRect.width;
      const faceHeight = faceRect.height;

      // console.log({ faceRect });

      let roiGray = gray.roi(faceRect);

      eyeCascade.detectMultiScale(roiGray, eyes);
      // console.log("eyes.size():", eyes.size());

      for (let j = 0; j < eyes.size(); j++) {
        const eyeRect = eyes.get(j);
        const eyeX = eyeRect.x;
        const eyeY = eyeRect.y;
        const eyeWidth = eyeRect.width;
        const eyeHeight = eyeRect.height;

        // console.log({ eyeRect });

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

    // console.log({ rects });

    postMessage({
      moduleLoadFlag: false,
      isCVLoaded: true,
      features: rects,
      begin
    });

    // src.delete();
    // gray.delete();
    // faces.delete();
  }
};
