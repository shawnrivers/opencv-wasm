window = self;

let Module = {};

Module["onRuntimeInitialized"] = function() {
  postMessage({ moduleLoadFlag: true, isCVLoaded: true, dst: null });
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

let counter,
  faceConsoleCounter = 0;
let src,
  gray,
  faces,
  classifier = null;

let classifierLoaded = false;

// console.log("[videoWorker] window:", window);
console.log("[videoWorker] cv:", cv);
console.log("[videoWorker] Module:", Module);

onmessage = e => {
  const { srcData, width, height } = e.data;

  if (counter < 50) {
    console.log({ srcData, width, height, classifier });
    counter += 1;
  }

  if (!src) {
    src = new cv.Mat(height, width, cv.CV_8UC4);
  }

  if (!gray) {
    gray = new cv.Mat(height, width, cv.CV_8UC1);
  }

  if (!faces) {
    faces = new cv.RectVector();
  }

  if (!classifier) {
    classifier = new cv.CascadeClassifier();
    classifierLoaded = classifier.load("face.xml");

    console.log({ classifierLoaded });
  }

  if (src !== null && gray !== null && faces !== null && classifier !== null) {
    src.data.set(srcData);

    cv.cvtColor(src, gray, cv.COLOR_RGBA2GRAY);

    classifier.detectMultiScale(gray, faces, 1.1, 3, 0);

    let rects = [];

    for (let i = 0; i < faces.size(); ++i) {
      let { x, y, width, height } = faces.get(i);

      rects.push({
        x,
        y,
        width,
        height
      });
    }

    postMessage({ moduleLoadFlag: false, isCVLoaded: true, face: rects });
  }
};
