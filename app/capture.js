/* globals CCapture */

let capturer;

let default_options = {
  format: 'png',
  framerate: 30,
  verbose: false,
  display: true
};

export function start( options ) {
  options = Object.assign({}, default_options, options);
  if (!options.name) {
    options.name = new Date().toISOString();
  }
  console.log(options);
  capturer = new CCapture(options);
  capturer.start();
}

export function stop() {
  capturer.stop();
  capturer.save();
}

export function update(renderer) {
  if (!capturer) return;
  capturer.capture(renderer.domElement);
}
