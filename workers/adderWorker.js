window = self;

onmessage = e => {
  const workerResult = e.data + 1;

  postMessage(workerResult);
};
