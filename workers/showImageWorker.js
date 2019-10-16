window = self;

console.log("Importing wasm");
importScripts("../libs/opencv_wasm.js");

onmessage = e => {
  const imageElement = e.data;
  console.log({ "e.data": imageElement });

  let mat = Module.imread(imageElement);
  Module.imshow("canvasOutput", mat);
  mat.delete();

  postMessage("DONE");
};
