
// Instantiate Model

const tensorflow = tf;
const SpeechCommands = speechCommands;

const startButton = document.getElementById('start');
const stopButton = document.getElementById('stop');

const transferModelNameInput = document.getElementById('transfer-model-name');


const XFER_MODEL_NAME = 'xfer-model';
const MIN_EXAMPLES_PER_CLASS = 8;

let recognizer;
let transferWords;
let transferRecognizer;
let transferDurationMultiplier;

(async function() {
    console.log("Creating Recognizer");
    recognizer = SpeechCommands.create('BROWSER_FFT');

    // await populateSavedTransferModelsSelect();
    // onde ele vem por HTTP

    recognizer.ensureModelLoaded().then(() => {
        console.log("batatas");
        startButton.disabled = false;
        transferModelNameInput.value = `model-${getDateString()}`;
    });

})();

console.log(tensorflow);
console.log(SpeechCommands);
