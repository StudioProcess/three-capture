let state = {
  startTime: 0, // time for first frame
  currentTime: 0, // current faked time
  frameRate: 0, // recording frame rate
  frameTime: 0,
  totalFrames: 0, // total frames to record. 0 means unbounded
  currentFrame: 0, // current recording frame,
  recording: false,
};



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

function rafCallbacks() {
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
  
  state.recording = true;
}


// function updateTime() {
//   state.currentTime += state.frameTime;
// }


export function update() {
  if (!state.recording) return;
  
  // TODO capture a frame; numbering is currentFrame+1
  console.log('CAPTURING FRAME #' + (state.currentFrame+1) + ' TIME ' + state.currentTime);
  
  // advance time
  state.currentTime += state.frameTime;
  state.currentFrame++;
  
  // rafCallbacks();
  
  // check for end of recording
  if (state.totalFrames > 0 && state.currentFrame >= state.totalFrames) {
    stop();
  }
}


export function stop() {
  console.log('rec: stopping');
  resetTimingFunctions();
  
  state.recording = false;
}


export function startstop(options) {
  if (!state.recording) {
    start(options);
  } else {
    stop();
  }
}
