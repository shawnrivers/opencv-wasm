console.log("[Main thread] CV:", cv);
const showImageWorker = new Worker("workers/showImageWorker.js");
const adderWorker = new Worker("workers/adderWorker.js");

let imgElement = document.getElementById("imageSrc");
let inputElement = document.getElementById("fileInput");

const handleInputChange = e => {
  imgElement.src = URL.createObjectURL(e.target.files[0]);
};
inputElement.addEventListener("change", handleInputChange, false);

imgElement.onload = () => {
  let src = cv.imread(imgElement);
  let dst = new cv.Mat();

  cv.cvtColor(src, dst, cv.COLOR_RGBA2GRAY);
  cv.imshow("canvasOutput", dst);
  src.delete();
  dst.delete();
};

const onOpenCvReady = () => {
  document.getElementById("status").innerHTML = "OpenCV.js is ready.";
};

let counter = 0;

document.getElementById("counter").innerText = counter;

const handleClickHey = () => {
  adderWorker.postMessage(counter);
};

adderWorker.onmessage = e => {
  counter = e.data;
  document.getElementById("counter").innerText = e.data;
};

showImageWorker.onmessage = e => {
  console.log(e);
};
