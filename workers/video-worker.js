window = self;

var Module = {};

Module["onRuntimeInitialized"] = function() {
  postMessage({ moduleLoadFlag: true, isCVLoaded: true, dst: null });
};

// Module.preRun = [
//   () => {
//     Module.FS_createPreloadedFile(
//       "/",
//       "face.xml",
//       "../cascade/haarcascade_frontalface_default.xml",
//       true,
//       false
//     );
//     Module.FS_createPreloadedFile(
//       "/",
//       "eye.xml",
//       "../cascade/haarcascade_eye.xml",
//       true,
//       false
//     );
//   }
// ];

importScripts("../libs/opencv_wasm.js");

let counter = 0;

// console.log("[videoWorker] window:", window);
console.log("[videoWorker] cv:", cv);
console.log("[videoWorker] Module:", Module);

onmessage = e => {
  const { srcData, width, height } = e.data;

  if (counter < 30) {
    console.log({ srcData, width, height });
    counter += 1;
  }

  let src = new cv.Mat(height, width, cv.CV_8UC4);
  let dst = new cv.Mat(height, width, cv.CV_8UC1);

  src.data.set(srcData);

  cv.cvtColor(src, dst, cv.COLOR_RGBA2GRAY);

  // console.log("Result in worker:", dst);

  postMessage({ moduleLoadFlag: false, isCVLoaded: true, dst });
};
