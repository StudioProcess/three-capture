import Tarball from './tar.js';

let state = {
  startTime: 0, // time for first frame
  currentTime: 0, // current faked time
  frameRate: 0, // recording frame rate
  frameTime: 0,
  totalFrames: 0, // total frames to record. 0 means unbounded
  currentFrame: 0, // current recording frame,
  recording: false,
};

let tape;

// Save original timing functions (on module load)
const originalTimingFunctions = {
  requestAnimationFrame: window.requestAnimationFrame,
  performanceDotNow: window.performance.now
};


let requestAnimationFrameCallbacks = [];

function hijackTimingFunctions() {
  window.requestAnimationFrame = function replacementRequestAnimationFrame(callback) {
    requestAnimationFrameCallbacks.push(callback);
  };
  window.performance.now = function replacementPerformanceDotNow() {
    return state.currentTime;
  };
}

function callRequestAnimationFrameCallbacks() {
  requestAnimationFrameCallbacks.forEach( callback => {
    setTimeout(callback, 0, state.currentTime);
  });
  requestAnimationFrameCallbacks = [];
}


function resetTimingFunctions() {
  window.performance.now = originalTimingFunctions.performanceDotNow;
  window.requestAnimationFrame = originalTimingFunctions.requestAnimationFrame;
}


let default_options = {
  start: undefined,
  duration: undefined,
  framerate: 30,
};

export function start(options) {
  
  console.log('rec: starting', options);
  options = Object.assign({}, default_options, options);
  
  console.log(options);
  
  // frame rate and time
  state.frameRate = options.framerate;
  state.frameTime = 1000 / state.frameRate;
  
  // start and current time
  if (options.start === undefined) {
    state.startTime = performance.now(); // no start time given, record from current time
  } else {
    state.startTime = options.start * 1000;
    console.log('setting start time', state.startTime);
  }
  state.currentTime = state.startTime;
  state.currentFrame = 0;
  
  // number of frames to record
  if (options.duration === undefined) {
    state.totalFrames = 0;
  } else {
    state.totalFrames = Math.ceil(options.duration * state.frameRate);
  }
  
  hijackTimingFunctions();
  
  tape = new Tarball();
  
  state.recording = true;
}


// function updateTime() {
//   state.currentTime += state.frameTime;
// }


export function update(renderer) {
  if (!state.recording) return;
  
  let canvas = renderer.domElement;
  
  // TODO capture a frame; numbering is currentFrame+1
  console.log('CAPTURING FRAME #' + (state.currentFrame+1) + ' TIME ' + state.currentTime);
  console.assert(performance.now() === state.currentTime, "checking performance.now()");
  let filename = `${state.currentFrame+1}`.padStart(7,'0') + '.png';
  
  // saveCanvasToPNG(canvas, filename).then(() => {
  addPNGToTarball(canvas, filename).then(() => {
    // advance time
    state.currentTime += state.frameTime;
    state.currentFrame++;
    
    callRequestAnimationFrameCallbacks();
    
    // check for end of recording
    if (state.totalFrames > 0 && state.currentFrame >= state.totalFrames) {
      stop();
    }
  });
}


export function stop() {
  console.log('rec: stopping');
  resetTimingFunctions();
  
  state.recording = false;
  
  if (tape) {
    saveBlob( tape.save(), new Date().toISOString() + '.tar' );
  }
}


export function startstop(options) {
  if (!state.recording) {
    start(options);
  } else {
    stop();
  }
}

export function now() {
  if (state.recording) {
    return state.currentTime;
  } else {
    return window.performance.now();
  }
}


async function saveCanvasToPNG(canvas, filename) {
  return new Promise(resolve => {
    // https://developer.mozilla.org/en-US/docs/Web/API/HTMLCanvasElement/toBlob
    canvas.toBlob(blob => {
      let url = URL.createObjectURL(blob);
      let link = document.createElement('a');
      link.download = filename;
      link.href = url;
      link.click();
      URL.revokeObjectURL(url);
      resolve(filename);
    }, 'image/png');
  });
}


async function addPNGToTarball(canvas, filename) {
  return canvasToBlob(canvas, 'image/png')
    .then(blobToArrayBuffer)
    .then(buffer => {
      tape.append(filename, buffer);
    });
}

async function canvasToBlob(canvas, type) {
  return new Promise(resolve => {
    // https://developer.mozilla.org/en-US/docs/Web/API/HTMLCanvasElement/toBlob
    canvas.toBlob(blob => resolve(blob), type);
  });
}

async function blobToArrayBuffer(blob) {
  return new Promise(resolve => {
    let f = new FileReader();
    f.onload = () => resolve(f.result);
    f.readAsArrayBuffer(blob);
  });
}

function saveURL(url, filename) {
  let link = document.createElement('a');
  link.download = filename;
  link.href = url;
  link.click();
}

function saveBlob(blob, filename) {
  let url = URL.createObjectURL(blob);
  saveURL(url, filename);
  URL.revokeObjectURL(url);
}
