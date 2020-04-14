
// Instantiate Model

// enviar remote people ->
// fader controlar o threshold caso possivel dinamicamente
// controlar o numero dos outros samples que não o background noise
// jorge coelho -- plotly

document.addEventListener('DOMContentLoaded', () => {});
if( /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ) {
  mobilePerformanceSetup();
}

var protocol = window.location.protocol;
var socket = io.connect(protocol + '//' + document.domain + ":" + location.port); //port + namespace);

socket.on('connect', function() {
  console.log('connected');
});

socket.on('message', function(data) {
  interactionState.thisid = data;
});

socket.on('region-socket', function(data) {
  console.log("receiving");
  var x = Math.floor(Math.random() * 256);
    var y = Math.floor(Math.random() * 256);
    var z = Math.floor(Math.random() * 256);
    var bgColor = "rgb(" + x + "," + y + "," + z + ")";
  document.body.style.backgroundColor = bgColor;
  console.log("if clicked TRIGGER W REGION bang play");
});

function socketMusic() {
  socket.emit("my-event", "username");
}

async function removeAnnots() {
  wavesurfer.clearRegions();
}

console.log("change bk noise for automatic string trunc");

window.indexedDB = window.indexedDB || window.webkitIndexedDB || window.mozIndexedDB || window.OIndexedDB || window.msIndexedDB,
    IDBTransaction = window.IDBTransaction || window.webkitIDBTransaction || window.OIDBTransaction || window.msIDBTransaction,
    dbVersion = 1;

var isIndexDbTransactionPossible = window.IDBTransaction || window.webkitIDBTransaction;
if (isIndexDbTransactionPossible) {
        isIndexDbTransactionPossible.READ_WRITE = isIndexDbTransactionPossible.READ_WRITE || 'readwrite';
        isIndexDbTransactionPossible.READ_ONLY = isIndexDbTransactionPossible.READ_ONLY || 'readonly';
}    


var albumBucketName = "xperimusmodels";
var bucketRegion = "eu-west-2";
var IdentityPoolId = "eu-west-2:52abaf84-383f-4377-8e8f-3bc8ca05c8fd";

AWS.config.region = 'eu-west-2'; 
AWS.config.credentials = new AWS.CognitoIdentityCredentials({
    IdentityPoolId: IdentityPoolId,
});

var s3 = new AWS.S3({
  apiVersion: "2006-03-01",
  params: { Bucket: albumBucketName }
});

function sortUsingNestedText(parent, childSelector, keySelector) {
  var items = parent.children(childSelector).sort(function(a, b) {
      var vA = $(keySelector, a).text();
      var vB = $(keySelector, b).text();
      return (vA < vB) ? -1 : (vA > vB) ? 1 : 0;
  });
  parent.append(items);
}

function listAmazonObjects() {
  document.getElementById("cont11").innerHTML = "Trained Models<br>";
  var __main = document.getElementById('cont11');

  s3.listObjects(function (err, data) {
    if(err)throw err;
    //var e = data.Contents[0].Key;
    var e = data.Contents
    var _e = JSON.stringify(e);
  
    Object.keys(e).forEach((key, index) => {
      //for (i = 0; i < e.length; i++) {}
  
      if (e[key].Key.includes("Model") == true && e[key].Key.length > 7) {
        var button = document.createElement("button");
        button.className = "amazonClass"; 
        button.innerHTML = e[key].Key;
        // append seguido aqui

        __main.appendChild(document.createElement("br"));    
        __main.appendChild(button);        


      } 
      if (e[key].Key.includes("Dataset") == true && e[key].Key.length > 9) {
        //console.log(e[key].Key);
        //console.log("wa");
        var _button = document.createElement("button");
        _button.className = "amazonClass"; 
        _button.innerHTML = e[key].Key;
        document.getElementById('cont12').appendChild(document.createElement("br"));    
        document.getElementById('cont12').appendChild(_button);
      }
  
    });
  
    for (i = 0; i < __main.children.length; i++) {
      if (!__main.children[i].innerHTML.includes('metadata') && !__main.children[i].innerHTML.includes('weights')) {
        console.log(__main.children[i].innerHTML); // works
      }
    }
  });
}

listAmazonObjects();

console.log("search for batch size");
const tensorflow = tf; // check later
const SpeechCommands = speechCommands;

const startButton = document.getElementById('start');
const stopButton = document.getElementById('stop');

const predictionCanvas = document.getElementById('prediction-canvas');

const probaThresholdInput = document.getElementById('proba-threshold');
const epochsInput = document.getElementById('epochs');
const fineTuningEpochsInput = document.getElementById('fine-tuning-epochs');

const lockRoom = document.getElementById('lock-room');
const newRoom = document.getElementById('new-room');


const datasetIOButton = document.getElementById('dataset-io');
const datasetIOInnerDiv = document.getElementById('dataset-io-inner');
const downloadAsFileButton = document.getElementById('download-dataset');
const datasetFileInput = document.getElementById('dataset-file-input');
const uploadFilesButton = document.getElementById('upload-dataset');

const evalModelOnDatasetButton = document.getElementById('eval-model-on-dataset');
const evalResultsSpan = document.getElementById('eval-results');

const modelIOButton = document.getElementById('model-io');
const transferModelSaveLoadInnerDiv = document.getElementById('transfer-model-save-load-inner');
const loadTransferModelButton = document.getElementById('load-transfer-model');
const saveTransferModelButton = document.getElementById('save-transfer-model');
const saveTransferModelButtonDisk = document.getElementById('save-transfer-model-disk');


const savedTransferModelsSelect = document.getElementById('saved-transfer-models'); // hidden
const deleteTransferModelButton = document.getElementById('delete-transfer-model');

const statusDisplay = document.getElementById('status-display');
const candidateWordsContainer = document.getElementById('candidate-words');


const _barprog = document.getElementById('barprog');

console.log("save with epochs");
/**
 * Transfer learning-related UI componenets.
 */
const transferModelNameInput = document.getElementById('transfer-model-name');
const learnWordsInput = document.getElementById('learn-words');
const durationMultiplierSelect = document.getElementById('duration-multiplier');
const enterLearnWordsButton = document.getElementById('enter-learn-words');
const includeTimeDomainWaveformCheckbox = document.getElementById('include-audio-waveform');
const collectButtonsDiv = document.getElementById('collect-words');
const startTransferLearnButton = document.getElementById('start-transfer-learn');

const cleanGraphData = document.getElementById('clean-graph-data');

const XFER_MODEL_NAME = 'xfer-model';
const MIN_EXAMPLES_PER_CLASS = 8;

let recognizer;
let transferWords;
let transferRecognizer;
let transferDurationMultiplier;

var _rawAudio;
//var spectrogram = new Spectrogram("viewport");

/**
 * Dataset visualizer that supports
 *
 * - Display of words and spectrograms
 * - Navigation through examples
 * - Deletion of examples
 */
class DatasetViz {
    /**
     * Constructor of DatasetViz
     *
     * @param {Object} transferRecognizer An instance of
     *   `speechCommands.TransferSpeechCommandRecognizer`.
     * @param {HTMLDivElement} topLevelContainer The div element that
     *   holds the div elements for the individual words. It is assumed
     *   that each element has its "word" attribute set to the word.
     * @param {number} minExamplesPerClass Minimum number of examples
     *   per word class required for the start-transfer-learning button
     *   to be enabled.
     * @param {HTMLButtonElement} startTransferLearnButton The button
     *   which starts the transfer learning when clicked.
     * @param {HTMLBUttonElement} downloadAsFileButton The button
     *   that triggers downloading of the dataset as a file when clicked.
     * @param {number} transferDurationMultiplier Optional duration
     *   multiplier (the ratio between the length of the example
     *   and the length expected by the model.) Defaults to 1.
     */
    constructor(
        transferRecognizer, topLevelContainer, minExamplesPerClass,
        startTransferLearnButton, downloadAsFileButton,
        transferDurationMultiplier = 1) {
      this.transferRecognizer = transferRecognizer;
      this.container = topLevelContainer;
      this.minExamplesPerClass = minExamplesPerClass;
      this.startTransferLearnButton = startTransferLearnButton;
      this.downloadAsFileButton = downloadAsFileButton;
      this.transferDurationMultiplier = transferDurationMultiplier;
  
      // Navigation indices for the words.
      this.navIndices = {};
    }
  
    /** Get the set of words in the dataset visualizer. */
    words_() {
      const words = [];
      for (const element of this.container.children) {
        words.push(element.getAttribute('word'));
      }
      return words;
    }
  
    /**
     * Draw an example.
     *
     * @param {HTMLDivElement} wordDiv The div element for the word. It is assumed
     *   that it contains the word button as the first child and the canvas as the
     *   second.
     * @param {string} word The word of the example being added.
     * @param {SpectrogramData} spectrogram Optional spectrogram data.
     *   If provided, will use it as is. If not provided, will use WebAudio
     *   to collect an example.
     * @param {RawAudio} rawAudio Raw audio waveform. Optional
     * @param {string} uid UID of the example being drawn. Must match the UID
     *   of the example from `this.transferRecognizer`.
     */
    async drawExample(wordDiv, word, spectrogram, rawAudio, uid) {
      if (uid == null) {
        throw new Error('Error: UID is not provided for pre-existing example.');
      }
  
      removeNonFixedChildrenFromWordDiv(wordDiv);
  
      // Create the left and right nav buttons.
      const leftButton = document.createElement('button');

      leftButton.textContent = '←';
      leftButton.style['border'] = '1px solid black';
      leftButton.style['height'] = '50%';

      var _leftSize = wordDiv.childNodes[0].offsetWidth; 
      //var _leftSize1 = wordDiv.childNodes[1].offsetWidth; 
 
      leftButton.style['position'] = 'absolute';

      leftButton.style['left'] = `${_leftSize}px`;

      leftButton.style['border-radius'] = '3px';
      leftButton.style['background-color'] = "rgba(53,53,53,1)";
      leftButton.style['color'] = "rgba(200,200,200,1)";
      leftButton.style['width'] = "30px";

      //wordDiv.style['margin'] = '2px';
      wordDiv.appendChild(leftButton);
  
      const rightButton = document.createElement('button');
      rightButton.textContent = '→';
      rightButton.style['left'] = '500px';
      rightButton.style['border'] = '1px solid black';
      rightButton.style['height'] = '50%';
      rightButton.style['width'] = "30px";

      rightButton.style['position'] = 'absolute';
      rightButton.style['left'] = `${_leftSize}px`;
      //rightButton.style['left'] = `${_leftSize + _leftSize1 + 10}px`;

      rightButton.style['border-radius'] = '3px';
      rightButton.style['background-color'] = "rgba(53,53,53,1)";
      rightButton.style['color'] = "rgba(200,200,200,1)";
      rightButton.style['bottom'] = "0px";
      wordDiv.appendChild(rightButton);
  
      // Determine the position of the example in the word of the dataset.
      const exampleUIDs =
          this.transferRecognizer.getExamples(word).map(ex => ex.uid);
      const position = exampleUIDs.indexOf(uid);
      this.navIndices[word] = exampleUIDs.indexOf(uid);
  
      if (position > 0) {
        leftButton.addEventListener('click', () => {
          this.redraw(word, exampleUIDs[position - 1]);
        });
      } else {
        leftButton.disabled = true;
      }
  
      if (position < exampleUIDs.length - 1) {
        rightButton.addEventListener('click', () => {
          this.redraw(word, exampleUIDs[position + 1]);
        });
      } else {
        rightButton.disabled = true;
      }
  
      // Spectrogram canvas.
      const exampleCanvas = document.createElement('canvas');
      exampleCanvas.style['display'] = 'inline-block';
      exampleCanvas.style['position'] = 'absolute';
      exampleCanvas.style['top'] = '0px !important'; 

      exampleCanvas.style['left'] = `${_leftSize + 28}px`;

      exampleCanvas.height = 60;
      exampleCanvas.width = 80;
      exampleCanvas.style['padding'] = '3px';
      exampleCanvas.style['border-radius'] = '5px';
      
  
      // Set up the click callback for the spectrogram canvas. When clicked,
      // the keyFrameIndex will be set.
      if (word !== speechCommands.BACKGROUND_NOISE_TAG) {
        exampleCanvas.addEventListener('click', event => {
          const relativeX =
              getCanvasClickRelativeXCoordinate(exampleCanvas, event);
          const numFrames = spectrogram.data.length / spectrogram.frameSize;
          const keyFrameIndex = Math.floor(numFrames * relativeX);
          console.log(
              `relativeX=${relativeX}; ` +
              `changed keyFrameIndex to ${keyFrameIndex}`);
          this.transferRecognizer.setExampleKeyFrameIndex(uid, keyFrameIndex);
          this.redraw(word, uid);
        });
      }
  
      wordDiv.appendChild(exampleCanvas);
  
      const modelNumFrames = this.transferRecognizer.modelInputShape()[1];
      await plotSpectrogram(
          exampleCanvas, spectrogram.data, spectrogram.frameSize,
          spectrogram.frameSize, {
            pixelsPerFrame: exampleCanvas.width / modelNumFrames,
            maxPixelWidth: Math.round(0.4 * window.innerWidth),
            markKeyFrame: this.transferDurationMultiplier > 1 &&
                word !== speechCommands.BACKGROUND_NOISE_TAG,
            keyFrameIndex: spectrogram.keyFrameIndex
          });
      
      exampleCanvas.style['top'] = '-3px';//'-3px';
      var _exampleC = exampleCanvas.offsetWidth; 
      var _divC = wordDiv.offsetWidth;
      if (_exampleC > _divC) {
        wordDiv.style['width'] = `${_leftSize + 28 + _exampleC + 30}px`;
      }

      if (rawAudio != null) {
        _rawAudio = rawAudio;
        const playButton = document.createElement('button');
        playButton.textContent = '▶️';
        playButton.addEventListener('click', () => {
          playButton.disabled = true;
          speechCommands.utils.playRawAudio(
              rawAudio, () => playButton.disabled = false);
        });
        playButton.style['position'] = 'absolute';
        playButton.style['left'] = `${_leftSize + 26 + _exampleC}px`;
        playButton.style['width'] = '30px';
        playButton.style['border-radius'] = '3px';
        playButton.style['border-color'] = 'black';
        playButton.style['background-color'] = "rgba(53,53,53,1)";
        playButton.style['color'] = "rgba(200,200,200,1)";
        playButton.style['height'] = '50%';
        playButton.style['bottom'] = '1px';
        wordDiv.appendChild(playButton);
        
      }
  
      // Create Delete button.
      const deleteButton = document.createElement('button');
      deleteButton.textContent = 'X';
      wordDiv.appendChild(deleteButton);
      deleteButton.style['position'] = 'absolute';
      deleteButton.style['left'] = `${_leftSize + 26 + _exampleC}px`;
      deleteButton.style['width'] = '35px';
      deleteButton.style['border-radius'] = '3px';
      deleteButton.style['border-color'] = 'black';
      deleteButton.style['background-color'] = "rgba(53,53,53,1)";
      deleteButton.style['color'] = "rgba(200,200,200,1)";
      deleteButton.style['width'] = "30px";
      deleteButton.style['height'] = '50%';

      //leftButton.style['left'] = `${_leftSize}px`;

      // Callback for delete button.
      deleteButton.addEventListener('click', () => {
        this.transferRecognizer.removeExample(uid);
        // TODO(cais): Smarter logic for which example to draw after deletion.
        // Right now it always redraws the last available one.
        this.redraw(word);
      });
  
      this.updateButtons_();
    }
  
    /**
     * Redraw the spectrogram and buttons for a word.
     *
     * @param {string} word The word being redrawn. This must belong to the
     *   vocabulary currently held by the transferRecognizer.
     * @param {string} uid Optional UID for the example to render. If not
     *   specified, the last available example of the dataset will be drawn.
     */
    async redraw(word, uid) {
      if (word == null) {
        throw new Error('word is not specified');
      }
      let divIndex;
      for (divIndex = 0; divIndex < this.container.children.length; ++divIndex) {
        if (this.container.children[divIndex].getAttribute('word') === word) {
          break;
        }
      }
      if (divIndex === this.container.children.length) {
        throw new Error(`Cannot find div corresponding to word ${word}`);
      }
      const wordDiv = this.container.children[divIndex];
      const exampleCounts = this.transferRecognizer.isDatasetEmpty() ?
          {} :
          this.transferRecognizer.countExamples();
  
      if (word in exampleCounts) {
        const examples = this.transferRecognizer.getExamples(word);
        let example;
        if (uid == null) {
          // Example UID is not specified. Draw the last one available.
          example = examples[examples.length - 1];
        } else {
          // Example UID is specified. Find the example and update navigation
          // indices.
          for (let index = 0; index < examples.length; ++index) {
            if (examples[index].uid === uid) {
              example = examples[index];
            }
          }
        }
  
        const spectrogram = example.example.spectrogram;
        await this.drawExample(
            wordDiv, word, spectrogram, example.example.rawAudio, example.uid);
      } else {
        removeNonFixedChildrenFromWordDiv(wordDiv);
      }
  
      this.updateButtons_();
    }
  
    /**
     * Redraw the spectrograms and buttons for all words.
     *
     * For each word, the last available example is rendered.
     **/
    redrawAll() {
      for (const word of this.words_()) {
        this.redraw(word);
      }
    }
  
    /** Update the button states according to the state of transferRecognizer. */
    updateButtons_() {
      const exampleCounts = this.transferRecognizer.isDatasetEmpty() ?
          {} :
          this.transferRecognizer.countExamples();
      const minCountByClass =
          this.words_()
              .map(word => exampleCounts[word] || 0)
              .reduce((prev, current) => current < prev ? current : prev);
  
      for (const element of this.container.children) {
        const word = element.getAttribute('word');
        const button = element.children[0];
        const displayWord =
            word === speechCommands.BACKGROUND_NOISE_TAG ? 'noise' : word;
        const exampleCount = exampleCounts[word] || 0;
        if (exampleCount === 0) {
          button.textContent = `${displayWord} (${exampleCount})`;
        } else {
          const pos = this.navIndices[word] + 1;
          button.textContent = `${displayWord} (${pos}/${exampleCount})`;
        }
      }
  
      const requiredMinCountPerClass =
          Math.ceil(this.minExamplesPerClass / this.transferDurationMultiplier);
      if (minCountByClass >= requiredMinCountPerClass) {
        this.startTransferLearnButton.textContent = 'Start Learning';
        this.startTransferLearnButton.disabled = false;
      } else {
        this.startTransferLearnButton.textContent =
            `Need Min ${requiredMinCountPerClass} p/Word`;
        this.startTransferLearnButton.disabled = true;
      }
  
      this.downloadAsFileButton.disabled =
          this.transferRecognizer.isDatasetEmpty();
    }
}
console.log("augment noise doesnt work");

(async function() {
    console.log("Creating Recognizer");
    recognizer = SpeechCommands.create('BROWSER_FFT');

    // await populateSavedTransferModelsSelect();
    // onde ele vem por HTTP
    console.log(SpeechCommands);
    recognizer.ensureModelLoaded().then(() => {
        startButton.disabled = false;
        transferModelNameInput.value = `xperimus-${getDateString()}`;

        console.log("Loaded Model");
        console.log(recognizer.modelInputShape());
        console.log(recognizer);
        console.log(recognizer.params());

        const params = recognizer.params();
        console.log(`sampleRateHz: ${params.sampleRateHz}`);
        console.log(`fftSize: ${params.fftSize}`);
        console.log(`spectrogramDurationMillis: ` + `${params.spectrogramDurationMillis.toFixed(2)}`);
        console.log(`tf.Model input shape: ` + `${JSON.stringify(recognizer.modelInputShape())}`);
    }).catch(err => {
        console.log("Failed: ", err.message);
    });
})();

var BACKGROUND_NOISE_TAG = SpeechCommands.BACKGROUND_NOISE_TAG;
var UNKNOWN_TAG = SpeechCommands.UNKNOWN_TAG;

startButton.addEventListener('click', () => {

    startButton.disabled = true;

    const activeRecognizer = transferRecognizer == null ? recognizer : transferRecognizer;
    populateCandidateWords(activeRecognizer.wordLabels());

    const suppressionTimeMillis = 1000;
    activeRecognizer.listen( result => {

      //drawMicSpectrogram(result);

        plotPredictions(predictionCanvas, activeRecognizer.wordLabels(), result.scores, 3, suppressionTimeMillis);
    }, {   
        includeSpectrogram: true,
        suppressionTimeMillis,
        probabilityThreshold: Number.parseFloat(probaThresholdInput.value)
    })
    .then(() => { 
        startButton.disabled = true;
        stopButton.disabled = false;
        console.log("Streaming recognition started.");
    })
    .catch(err => {
        console.log("Failed to start streaming: ", err.message);
        console.log(err);
    });
});

stopButton.addEventListener('click', () => {
    var _removeannot = document.getElementById('sendannotfill')
    _removeannot.innerHTML = "";
    document.getElementById('candidate-words').innerHTML = "";
    const activeRecognizer = transferRecognizer == null ? recognizer : transferRecognizer;
    activeRecognizer.stopListening()
    .then(() => {
        startButton.disabled = false;
        stopButton.disabled = true;
        console.log("Streaming recognition stopped.");
    })
    .catch(err => {
        console.log("Failed to stop streaming display: ", err.message);
    });
});




async function drawMicSpectrogram(result) {}

/** Transfer Learning Logic */

let collectWordButtons = {};
let datasetViz;

var includeAudioWaveformSpec = false;
var augmentNoise = false;

function createProgressBarAndIntervalJob(parentElement, durationSec) {
    const progressBar = document.createElement('progress');
    progressBar.value = 0;
    progressBar.style['width'] = "100%";//`${Math.round(window.innerWidth * 0.25)}px`;
    progressBar.style['height'] = "95%";
    progressBar.style['background-color'] = 'red';//'rgba(32, 32, 32, 1)';
    progressBar.style['color'] = 'red';//'rgba(32, 32, 32, 1)';

    progressBar.style['border-radius'] = "3px";

    const intervalJob = setInterval(() => {
        progressBar.value += 0.05;
    }, durationSec * 1e3 / 20);
    parentElement.appendChild(progressBar);
    return {progressBar, intervalJob};
}


/**
 * divs for the words
 * @param {string[]} transferWords The array of transferwords
 * @returns {Object} An object mapping word to th div element created for ir
 * 
 */

function createWordDivs(transferWords) {
    //clear first
    while (collectButtonsDiv.firstChild) {
        collectButtonsDiv.removeChild(collectButtonsDiv.firstChild);
    }
    datasetViz = new DatasetViz(
        transferRecognizer, collectButtonsDiv, MIN_EXAMPLES_PER_CLASS,
        startTransferLearnButton, downloadAsFileButton,
        transferDurationMultiplier);
    
    const wordDivs = {};
    for (const word of transferWords) {


        const wordDiv = document.createElement('div');
        wordDiv.classList.add('word-div');

        wordDiv.style['backgroundColor'] = 'rgba(32, 32, 32, 1)';
        wordDiv.style['border'] = '1px solid grey';
        wordDiv.style['margin'] = '2px';
        wordDiv.style['border-radius'] = '3px';
        wordDiv.style['position'] = 'relative';
        wordDiv.style['width'] = "99%";//'calc(100% - 2px)';
        wordDiv.style['height'] = "60px";//'calc(100% - 2px)';


        wordDivs[word] = wordDiv;
        wordDiv.setAttribute('word', word);

        /*const wordBack = document.createElement('div');
        wordBack.setAttribute('isFixed', 'true');
        wordBack.style['display'] = 'inline-clock';
        wordBack.style['height'] = "65px";
        wordBack.style['backgroundColor'] = "rgba(0,255,0,1)";
        wordDiv.appendChild(wordBack);
*/

        const button = document.createElement('button');

        button.setAttribute('isFixed', 'true');
        button.style['display'] = 'inline-clock';
        button.style['position'] = "absolute";//'calc(100% - 2px)';
        button.style['vertical-align'] = 'middle';
        button.style['height'] = "60px";
        //button.style['width'] = "45px";
        button.style['background-color'] = "rgba(53,53,53,1)";
        button.style['color'] = "rgba(200,200,200,1)";
        button.style['border-radius'] = "3px";
        button.style['border-color'] = "black";
        button.style['minWidth'] = "75px";

        /*position: absolute;
        color: ;
        background-color: ;
        border-style: solid;
        border-width: 1px;
        : black;
        : ;
        font-size: 10px;
        position: relative;
        height: 28px;
        width: 30%;
        top: 4%;
        left: 18%;*/

        const displayWord = word === BACKGROUND_NOISE_TAG ? 'Noise' : word;

        button.textContent = `${displayWord} (0)`;
        wordDiv.appendChild(button);
        wordDiv.className = 'transfer-word';
        collectButtonsDiv.appendChild(wordDiv);
        collectWordButtons[word] = button;
        
        let durationInput;
        if (word === BACKGROUND_NOISE_TAG) {
            // create noise duration input
            wordDiv.childNodes[0].style['height'] = '34px'; 
            durationInput = document.createElement('input');
            //durationInput.setAttribute('isFixed', 'true');
            durationInput.value = '10[sec]';
            durationInput.style['position'] = 'absolute';
            durationInput.style['text-align'] = 'center';
            durationInput.style['bottom'] = '0px';
            durationInput.style['width'] = '71px';
            durationInput.style['right'] = '0px !important';

            durationInput.style['height'] = '22px';
            //durationInput.style['left'] = '0px';
            wordDiv.appendChild(durationInput);
            //create time-unit span for noise duration
            const timeUnitSpan = document.createElement('span');
            timeUnitSpan.setAttribute('isFixed', 'true');
            timeUnitSpan.classList.add('settings');
            timeUnitSpan.style['vertical-align'] = 'middle';
            //timeUnitSpan.textContent = 'seconds'; SHOW SECONDS
            wordDiv.appendChild(timeUnitSpan);
        }

        button.addEventListener('click', async () => {
            //disableAllCollectWordButtons();
            removeNonFixedChildrenFromWordDiv(wordDiv);

            const collectExampleOptions = {};
            let durationSec;
            let intervalJob;
            let progressBar;

            if (word === BACKGROUND_NOISE_TAG) {
            // If the word type is background noise, display a progress bar during
            // sound collection and do not show an incrementally updating
            // spectrogram.
            // _background_noise_ examples are special, in that user can specify
            // the length of the recording (in seconds).
                collectExampleOptions.durationSec = Number.parseFloat(durationInput.value);
                durationSec = collectExampleOptions.durationSec;

                const barAndJob = createProgressBarAndIntervalJob(_barprog, durationSec);
                progressBar = barAndJob.progressBar;
                intervalJob = barAndJob.intervalJob;
            } else {
            // If this is not a background-noise word type and if the duration
            // multiplier is >1 (> ~1 s recoding), show an incrementally
            // updating spectrogram in real time.
                collectExampleOptions.durationMultiplier = transferDurationMultiplier;
                let tempSpectrogramData;
                const tempCanvas = document.createElement('canvas');
                
                var _leftSize = wordDiv.childNodes[0].offsetWidth; 

                tempCanvas.style['margin-left'] = `${_leftSize + 31}px`;
                tempCanvas.style['border-radius'] = '3px';

                tempCanvas.height = 50;
                wordDiv.appendChild(tempCanvas);

                collectExampleOptions.snippetDurationSec = 0.1;
                collectExampleOptions.onSnippet = async (spectrogram) => {
                    if (tempSpectrogramData == null) {
                        tempSpectrogramData = spectrogram.data;
                    } else {
                        tempSpectrogramData = SpeechCommands.utils.concatenateFloat32Arrays(
                            [tempSpectrogramData, spectrogram.data]);
                    }
                    plotSpectrogram(
                        tempCanvas, tempSpectrogramData, spectrogram.frameSize,
                        spectrogram.frameSize, {pixelsPerFrame: 2});
                }
            }
            //collectExampleOptions.includeRawAudio = includeTimeDomainWaveformCheckbox.checked;
            collectExampleOptions.includeRawAudio = includeAudioWaveformSpec;
            const spectrogram = await transferRecognizer.collectExample(word, collectExampleOptions);

            if (intervalJob != null) {
                clearInterval(intervalJob);
            }
            if (progressBar != null) {
                _barprog.removeChild(progressBar);
            }
            const examples = transferRecognizer.getExamples(word);
            const example = examples[examples.length - 1];
            await datasetViz.drawExample(
                wordDiv, word, spectrogram, example.example.rawAudio, example.uid);
            //enableAllCollectWordButtons();
        });
    }    
    return wordDivs;
}

enterLearnWordsButton.addEventListener('click', () => {
    const modelName = transferModelNameInput.value;
    if (modelName == null || modelName.length === 0) {
        enterLearnWordsButton.textContent = 'Need Name!';
        setTimeout(() => {
            enterLearnWordsButton.textContent = 'Start Transfer';
        }, 2000);
        return;
    }
   //_background_noise_,red,green

    transferDurationMultiplier = durationMultiplierSelect.value;

    learnWordsInput.disabled = true;
    transferWords = learnWordsInput.value.trim().split(',').map(w => w.trim());
    transferWords.splice(0,0,"_background_noise_");
    if (transferWords == null || transferWords.length <= 1) {
        console.log("ERROR: Invalid list of transfer words");
        return;
    }

    transferRecognizer = recognizer.createTransfer(modelName);
    createWordDivs(transferWords);

});

cleanGraphData.addEventListener('click', async () => {
  Plotly.deleteTraces('loss-plot', [0, 1]);
  Plotly.deleteTraces('accuracy-plot', [0, 1]);
});

startTransferLearnButton.addEventListener('click', async () => {
    startTransferLearnButton.disabled = true;
    startButton.disabled = true;
    startTransferLearnButton.textContent = 'Learning Started';

    await tf.nextFrame();

    const INITIAL_PHASE = 'initial';
    const FINE_TUNING_PHASE = 'fineTuningPhase';

    const epochs = parseInt(epochsInput.value);
    const fineTuningEpochs = parseInt(fineTuningEpochsInput.value);
    const trainLossValues = {};
    const valLossValues = {};
    const trainAccValues = {};
    const valAccValues = {};

    for (const phase of [INITIAL_PHASE, FINE_TUNING_PHASE]) {
        const phaseSuffix = phase === FINE_TUNING_PHASE ? ' (FT)' : '';
        const lineWidth = phase === FINE_TUNING_PHASE ? 2 : 1;
        trainLossValues[phase] = {
            x: [],
            y: [],
            name: 'train' + phaseSuffix,
            mode: 'lines',
            line: {width: lineWidth}
        };
        valLossValues[phase] = {
            x: [],
            y: [],
            name: 'val' + phaseSuffix,
            mode: 'lines',
            line: {width: lineWidth}
        };
        trainAccValues[phase] = {
            x: [],
            y: [],
            name: 'train' + phaseSuffix,
            mode: 'lines',
            ilne: {width: lineWidth}
        };
        valAccValues[phase] = {
            x: [],
            y: [],
            name: 'val' + phaseSuffix,
            mode: 'lines',
            line: {width: lineWidth}
        };
    }
    function plotLossAndAccuracy(epoch, loss, acc, val_loss, val_acc, phase) {
        const displayEpoch = phase === FINE_TUNING_PHASE ? (epoch + epochs) : epoch;
        trainLossValues[phase].x.push(displayEpoch);
        trainLossValues[phase].y.push(loss);
        trainAccValues[phase].x.push(displayEpoch);
        trainAccValues[phase].y.push(acc);
        valLossValues[phase].x.push(displayEpoch);
        valLossValues[phase].y.push(val_loss);
        valAccValues[phase].x.push(displayEpoch);
        valAccValues[phase].y.push(val_acc);
        
        Plotly.newPlot(
            'loss-plot',
            [
              trainLossValues[INITIAL_PHASE], valLossValues[INITIAL_PHASE],
              trainLossValues[FINE_TUNING_PHASE], valLossValues[FINE_TUNING_PHASE]
            ],
            layout);
        Plotly.newPlot(
            'accuracy-plot',
            [
              trainAccValues[INITIAL_PHASE], valAccValues[INITIAL_PHASE],
              trainAccValues[FINE_TUNING_PHASE], valAccValues[FINE_TUNING_PHASE]
            ],
            layout1);
        startTransferLearnButton.textContent = phase === INITIAL_PHASE ?
            `Learning (${(epoch / epochs * 1e2).toFixed(0)}%)` :
            `Learning (FT)... (${
                (epoch / fineTuningEpochs * 1e2).toFixed(0)}%)`
                
    }

    const augmentByMixingNoiseRatio = augmentNoise == true ? 0.5 : null;
    console.log(`augmentByMixingNoiseRatio = ${augmentByMixingNoiseRatio}`);
    await transferRecognizer.train({
        epochs,
        validationSplit: 0.25,
        augmentByMixingNoiseRatio,
        callback: {
            onEpochEnd: async (epoch, logs) => {
                plotLossAndAccuracy(
                    epoch, logs.loss, logs.acc, logs.val_loss, logs.val_acc,
                    INITIAL_PHASE);
            }
        },
        fineTuningEpochs,
        fineTuningCallback: {
            onEpochEnd: async (epoch, logs) => {
                plotLossAndAccuracy(
                    epoch, logs.loss, logs.acc, logs.val_loss, logs.val_acc,
                    FINE_TUNING_PHASE);
            }
        }
    });
    saveTransferModelButtonDisk.disabled = false;
    transferModelNameInput.value = transferRecognizer.name;
    transferModelNameInput.disable = true;
    startTransferLearnButton.textContent = 'Learning Complete';
    transferModelNameInput.disabled = false;
    startButton.disabled = false;
    evalModelOnDatasetButton.disabled = false;
});

console.log(SpeechCommands);
console.log(transferRecognizer);
console.log("stop listen button not properly working");

downloadAsFileButton.addEventListener('click', () => {
    const basename = getDateString();
    const artifacts = transferRecognizer.serializeExamples();

    const anchor = document.createElement('a');
    anchor.download = `${document.getElementById('transfer-model-name').value}`
    anchor.href = window.URL.createObjectURL(
        new Blob([artifacts], {type: 'application/octet-stream'}));
    anchor.click();
})

function getDateString() {
    const d = new Date();
    const year = `${d.getFullYear()}`;
    let month = `${d.getMonth() + 1}`;
    let day = `${d.getDate()}`;
    if (month.length < 2) {
      month = `0${month}`;
    }
    if (day.length < 2) {
      day = `0${day}`;
    }
    let hour = `${d.getHours()}`;
    if (hour.length < 2) {
      hour = `0${hour}`;
    }
    let minute = `${d.getMinutes()}`;
    if (minute.length < 2) {
      minute = `0${minute}`;
    }
    let second = `${d.getSeconds()}`;
    if (second.length < 2) {
      second = `0${second}`;
    }
    return `${year}-${month}-${day}`;
}

async function loadDatasetInTransferRecognizer(serialized) {
    const modelName = transferModelNameInput.value;
    if (modelName == null || modelName.length === 0) {
        throw new Error('Need model name!');
    }
    if (transferRecognizer == null) {
        transferRecognizer = recognizer.createTransfer(modelName);
    }
    transferRecognizer.loadExamples(serialized);
    const exampleCounts = transferRecognizer.countExamples();
    transferWords = [];
    const modelNumFrames = transferRecognizer.modelInputShape()[1];
    const durationMultipliers = [];
    for (const word in exampleCounts) {
        transferWords.push(word);
        const examples = transferRecognizer.getExamples(word);
        for (const example of examples) {
            const spectrogram = example.example.spectrogram;
            // ignore _background_noise examples when determining the duration (is?)
            // multiplier of the dataset.
            if (word !== BACKGROUND_NOISE_TAG) {
                durationMultipliers.push(Math.round(spectrogram.data.length / spectrogram.frameSize / modelNumFrames));
            }
        }
    }
    transferWords.sort();
    learnWordsInput.value = transferWords.join(',');

    //determine the transferDurationMultiplier value from the dataset.

    transferDurationMultiplier = durationMultipliers.length > 0 ? Math.max(...durationMultipliers) : 1;
    console.log(`Determined transferDurationMultiplier from uploaded ` + `dataset: ${transferDurationMultiplier}`);
    createWordDivs(transferWords);
    datasetViz.redrawAll();
}


evalModelOnDatasetButton.addEventListener('click', async () => {
    const files = datasetFileInput.files;
    if (files == null || files.length !== 1) {
      throw new Error('Must select exactly one file.');
    }
    evalModelOnDatasetButton.disabled = true;
    const datasetFileReader = new FileReader();
    datasetFileReader.onload = async event => {
      try {
        if (transferRecognizer == null) {
          throw new Error('There is no model!');
        }
  
        // Load the dataset and perform evaluation of the transfer
        // model using the dataset.
        transferRecognizer.loadExamples(event.target.result);
        const evalResult = await transferRecognizer.evaluate({
          windowHopRatio: 0.25,
          wordProbThresholds: [
            0,    0.05, 0.1,  0.15, 0.2,  0.25, 0.3,  0.35, 0.4,  0.5,
            0.55, 0.6,  0.65, 0.7,  0.75, 0.8,  0.85, 0.9,  0.95, 1.0
          ]
        });
        // Plot the ROC curve.
        const rocDataForPlot = {x: [], y: []};
        evalResult.rocCurve.forEach(item => {
          rocDataForPlot.x.push(item.fpr);
          rocDataForPlot.y.push(item.tpr);
        });
        
        /*Plotly.newPlot('roc-plot', [rocDataForPlot], {
          width: 360,
          height: 360,
          mode: 'markers',
          marker: {size: 7},
          xaxis: {title: 'False positive rate (FPR)', range: [0, 1]},
          yaxis: {title: 'True positive rate (TPR)', range: [0, 1]},
          font: {size: 18}
        });*/
        evalResultsSpan.textContent = `AUC = ${evalResult.auc}`;
      } catch (err) {
        const originalTextContent = evalModelOnDatasetButton.textContent;
        evalModelOnDatasetButton.textContent = err.message;
        setTimeout(() => {
          evalModelOnDatasetButton.textContent = originalTextContent;
        }, 2000);
      }
      evalModelOnDatasetButton.disabled = false;
    };
    datasetFileReader.onerror = () =>
        console.error(`Failed to binary data from file '${dataFile.name}'.`);
    datasetFileReader.readAsArrayBuffer(files[0]);
});
  
async function populateSavedTransferModelsSelect() {

    const savedModelKeys = await SpeechCommands.listSavedTransferModels();
    while (savedTransferModelsSelect.firstChild) {
      savedTransferModelsSelect.removeChild(savedTransferModelsSelect.firstChild);
    }
    if (savedModelKeys.length > 0) {
      for (const key of savedModelKeys) {
        const option = document.createElement('option');
        option.textContent = key;
        option.id = key;
        savedTransferModelsSelect.appendChild(option);
      }
    }
}

console.log("supervizd metadata");

saveTransferModelButton.addEventListener('click', async () => {
    
    //await transferRecognizer.save();

    await populateSavedTransferModelsSelect(); 
    saveTransferModelButton.textContent = 'Model saved!';
    //await transferRecognizer.save('downloads://my-model'); //await
    await transferRecognizer.save(`indexeddb://${document.getElementById('transfer-model-name').value}`);
    //await transferRecognizer.save('localstorage://my-model'); //await
    await indexddb();
});

saveTransferModelButtonDisk.addEventListener('click', async () => {
  console.log("well");
  await transferRecognizer.save(`downloads://${document.getElementById('transfer-model-name').value}`);
  var __a = transferRecognizer.words;
  downloadObjectAsJson(__a, `${document.getElementById('transfer-model-name').value}-metadata`);
  saveTransferModelButtonDisk.textContent = 'Model saved!';
});

function downloadObjectAsJson(exportObj, exportName){
  var dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(exportObj));
  var downloadAnchorNode = document.createElement('a');
  downloadAnchorNode.setAttribute("href",     dataStr);
  downloadAnchorNode.setAttribute("download", exportName + ".json");
  document.body.appendChild(downloadAnchorNode); // required for firefox
  downloadAnchorNode.click();
  downloadAnchorNode.remove();
}

var transactedAmazonModel, transactedAmazonModel1;
var transac = false;
var loadedmodel;
console.log("new idea well we dont need everyone to use the model just one to keep things light")

async function indexddb() {

  var DBOpenRequest = window.indexedDB.open("tensorflowjs", dbVersion);

    DBOpenRequest.onsuccess = function(event) {

      db = DBOpenRequest.result;

      function getData() {

        var transaction = db.transaction(["models_store"], "readwrite");

        transaction.oncomplete = function(event) {
        };

        // create an object store on the transaction
        // Make a request to get a record by key from the object store
        var objectStore = transaction.objectStore("models_store");
        
        var objectStoreRequest = objectStore.get(`${document.getElementById("transfer-model-name").value}`);

        objectStoreRequest.onsuccess = function(event) {

          var myRecord = objectStoreRequest.result;
          loadedmodel = myRecord;
          loadedmodel.metadata = transferRecognizer.wordLabels();
          console.log(loadedmodel);

          localStorage.setItem(document.getElementById("transfer-model-name").value, JSON.stringify(loadedmodel));
          console.log(myRecord);
          
          var modelStringify = JSON.stringify(myRecord);
          console.log(modelStringify);
        
          var _parse = JSON.parse(modelStringify);
          console.log(_parse);
          
          /*var _modelStringify = JSON.stringify(Array.from(new Int32Array(myRecord.modelArtifacts.weightData)));
          console.log(_modelStringify);
          var __modelStringify = StringToArrayBuffer(_modelStringify);
          console.log(__modelStringify);*/

          const uploadFile = (fileName) => {

            const params = {
                Bucket: 'xperimusmodels/Models',
                Key: document.getElementById('transfer-model-name').value,//'my-model',//`xperimus-${getDateString()}`, 
                ACL: 'public-read',
                Body: fileName
            };

            s3.upload(params, function(err, data) {
                if (err) {
                    throw err;
                }
                console.log(`File uploaded successfully. ${data.Location}`);
            });
          };
          uploadFile(myRecord);
          listAmazonObjects();
        };
      }
      getData();

    }

}
  
deleteTransferModelButton.addEventListener('click', async () => {
  transferModelNameInput.value = "";
  SpeechCommands.deleteSavedTransferModel(transferRecognizer.name);
  transferRecognizer = "";
});

// other files

function removeNonFixedChildrenFromWordDiv(wordDiv) {
    for (let i = wordDiv.children.length - 1; i >= 0; --i) {
      if (wordDiv.children[i].getAttribute('isFixed') == null) {
        wordDiv.removeChild(wordDiv.children[i]);
      } else {
        break;
      }
    }
}




/**
 * Log a message to a textarea.
 *
 * @param {string} message Message to be logged.
 */
function logToStatusDisplay(message) {
    const date = new Date();
    statusDisplay.value += `[${date.toISOString()}] ` + message + '\n';
    statusDisplay.scrollTop = statusDisplay.scrollHeight;
}

let candidateWordSpans;

/**
 * Display candidate words in the UI.
 *
 * The background-noise "word" will be omitted.
 *
 * @param {*} words Candidate words.
 */
var _word, btnColor = false;
function populateCandidateWords(words) {
  document.getElementById("candidate-words").innerHTML = "";
    candidateWordSpans = {};
    _candidateWordSpans = {};

    var existingDirectChildrenDivCount = $('#cont4 > div').size();
    console.log(existingDirectChildrenDivCount);
  
    for (const word of words) {
      if (word === BACKGROUND_NOISE_TAG || word === UNKNOWN_TAG) {
        continue;
      }
      _word = word;
      const wordSpan = document.createElement('div');
      wordSpan.textContent = word;
      wordSpan.classList.add('candidate-word');
      //document.getElementById("cont4").appendChild(wordSpan);
      candidateWordSpans[word] = wordSpan;
      const _button = document.createElement("button");
      _button.style['position'] = 'absolute';
      _button.style['left'] = '100%';
      _button.style['top'] = '-1px';
      _button.style['backgroundColor'] = 'rgba(32,32,32,1)';
      _button.style['border-top-right-radius'] = '2px';
      _button.style['border-bottom-right-radius'] = '2px';

      _button.style['border'] = '1px solid black';
      _button.style['width'] = '20%';
      _button.style['height'] = 'calc(100% + 2px)';
      _button.setAttribute("id", word);
      console.log(_button.style.backgroundColor);
      var newColor;
      _button.onclick = function() { 
        if (_button.classList.contains("buttonBack1") != true) {
          _button.classList.add("buttonBack1");
          console.log(_button.id);
          _btnsArray.push(_button.id);

        } else {
          _button.classList.remove("buttonBack1");
          _btnsArray = _btnsArray.filter(e => e !== _button.id);
        }
      };

      wordSpan.appendChild(_button);
      candidateWordsContainer.appendChild(wordSpan);

      const _wordSpanDiv = document.createElement('button');
      _wordSpanDiv.id = "sendannotbtn";

      _wordSpanDiv.style['backgroundColor'] = 'rgba(32, 32, 32, 1)';
      _wordSpanDiv.style['border'] = '1px solid black';
      _wordSpanDiv.style['color'] = 'rgba(200,200,200,1)';

      _wordSpanDiv.style['border-radius'] = '3px';
      _wordSpanDiv.style['position'] = 'relative';
      _wordSpanDiv.style['padding-top'] = '1px';
      _wordSpanDiv.style['margin-left'] = '0px';
      _wordSpanDiv.style['margin-bottom'] = '1px';

      _wordSpanDiv.style['width'] = "calc(97% - 1px)";//'calc(100% - 2px)';
      _wordSpanDiv.style['height'] = "25%";//'calc(100% - 2px)';
      _wordSpanDiv.textContent = _word;

      //_candidateWordSpans[word] = _wordSpanDiv;
      //_wordSpanDiv.appendChild(_wordSpan);
      document.getElementById("sendannotfill").appendChild(_wordSpanDiv);      
      document.getElementById("sendannotfill").style.height = "auto";      
    }
}

async function wordAudioSockets() {

}

/**
 * Show an audio spectrogram in a canvas.
 *
 * @param {HTMLCanvasElement} canvas The canvas element to draw the
 *   spectrogram in.
 * @param {Float32Array} frequencyData The flat array for the spectrogram
 *   data.
 * @param {number} fftSize Number of frequency points per frame.
 * @param {number} fftDisplaySize Number of frequency points to show. Must be
 * @param {Object} config Optional configuration object, with the following
 *   supported fields:
 *   - pixelsPerFrame {number} Number of pixels along the width dimension of
 *     the canvas for each frame of spectrogram.
 *   - maxPixelWidth {number} Maximum width in pixels.
 *   - markKeyFrame {bool} Whether to mark the index of the frame
 *     with the maximum intensity or a predetermined key frame.
 *   - keyFrameIndex {index?} Predetermined key frame index.
 *
 *   <= fftSize.
 */
async function plotSpectrogram(
    canvas, frequencyData, fftSize, fftDisplaySize, config) {
  if (fftDisplaySize == null) {
    fftDisplaySize = fftSize;
  }
  if (config == null) {
    config = {};
  }

  // Get the maximum and minimum.
  let min = Infinity;
  let max = -Infinity;
  for (let i = 0; i < frequencyData.length; ++i) {
    const x = frequencyData[i];
    if (x !== -Infinity) {
      if (x < min) {
        min = x;
      }
      if (x > max) {
        max = x;
      }
    }
  }
  if (min >= max) {
    return;
  }

  const context = canvas.getContext('2d');
  context.clearRect(0, 0, canvas.width, canvas.height);
  
  const numFrames = frequencyData.length / fftSize;
  if (config.pixelsPerFrame != null) {
    let realWidth = Math.round(config.pixelsPerFrame * numFrames);
    if (config.maxPixelWidth != null && realWidth > config.maxPixelWidth) {
      realWidth = config.maxPixelWidth;
    }
    canvas.width = realWidth;
  }

  const pixelWidth = canvas.width / numFrames;
  const pixelHeight = canvas.height / fftDisplaySize;
  for (let i = 0; i < numFrames; ++i) {
    const x = pixelWidth * i;
    const spectrum = frequencyData.subarray(i * fftSize, (i + 1) * fftSize);
    if (spectrum[0] === -Infinity) {
      break;
    }
    for (let j = 0; j < fftDisplaySize; ++j) {
      const y = canvas.height - (j + 1) * pixelHeight;

      let colorValue = (spectrum[j] - min) / (max - min);
      colorValue = Math.pow(colorValue, 3);
      colorValue = Math.round(255 * colorValue);
      const fillStyle =
          `rgb(${0},${colorValue},${colorValue})`; // cor espectro `rgb(${colorValue},${255 - colorValue},${255 - colorValue})`; // cor espectro
      context.fillStyle = fillStyle;
      context.fillRect(x, y, pixelWidth, pixelHeight);
      //`rgb(${0},${colorValue},${colorValue})`;
    }
  }
  console.log(config);

  if (config.markKeyFrame) {
    const keyFrameIndex = config.keyFrameIndex == null ?
        await SpeechCommands
            .getMaxIntensityFrameIndex(
                {data: frequencyData, frameSize: fftSize})
            .data() :
        config.keyFrameIndex;

        context.strokeStyle = 'aqua';
    context.beginPath();
    context.moveTo(pixelWidth * keyFrameIndex, 0);
    context.lineTo(pixelWidth * keyFrameIndex, canvas.height * 1);
    context.stroke();
    context.beginPath();
    context.moveTo(pixelWidth * keyFrameIndex, canvas.height * 0.9);
    context.lineTo(pixelWidth * keyFrameIndex, canvas.height);
    context.stroke();
  }
}

/**
 * Plot top-K predictions from a speech command recognizer.
 *
 * @param {HTMLCanvasElement} canvas The canvas to render the predictions in.
 * @param {string[]} candidateWords Candidate word array.
 * @param {Float32Array | number[]} probabilities Probability scores from the
 *   speech command recognizer. Must be of the same length as `candidateWords`.
 * @param {number} timeToLiveMillis Optional time to live for the active label
 *   highlighting. If not provided, will the highlighting will live
 *   indefinitely till the next highlighting.
 * @param {number} topK Top _ scores to render.
 */

var truthChain = new Array(3);
for (var i = 0; i < truthChain.length; ++i) { truthChain[i] = false; } 

var _btnsArray = [];

function plotPredictions( canvas, candidateWords, probabilities, topK, timeToLiveMillis) {
  if (topK != null) {
    let wordsAndProbs = [];
    for (let i = 0; i < candidateWords.length; ++i) {
      wordsAndProbs.push([candidateWords[i], probabilities[i]]);
    }
    wordsAndProbs.sort((a, b) => (b[1] - a[1]));
    wordsAndProbs = wordsAndProbs.slice(0, topK);
    candidateWords = wordsAndProbs.map(item => item[0]);
    probabilities = wordsAndProbs.map(item => item[1]);

    // Highlight the top word.
    const topWord = wordsAndProbs[0][0];
    console.log( `"${topWord}" (p=${wordsAndProbs[0][1].toFixed(6)}) @ ` + new Date().toTimeString());
    var prob_ = wordsAndProbs[0][1].toFixed(2);
    document.getElementById('probabil').innerHTML = `"${topWord}" ${prob_}` //@ ` + new Date().toTimeString();

    const _recordDiv = document.createElement("div");
    _recordDiv.style['width'] = "10%";
    _recordDiv.style['font-size'] = "8px";
    _recordDiv.style['border'] = "1px solid black";
    _recordDiv.style['border-radius'] = "2px";
    _recordDiv.style['padding-top'] = "1%";
    _recordDiv.style['padding-left'] = "1%";
    _recordDiv.style['padding-right'] = "1%";

    _recordDiv.style['margin-top'] = "1%";
    _recordDiv.style['margin-left'] = "1%";

    _recordDiv.style['height'] = "78%";
    _recordDiv.style['background-color'] = "#353535";
    _recordDiv.style['float'] = "left";

    _recordDiv.innerHTML = `Word: "${topWord}" <br> Prob: ${wordsAndProbs[0][1].toFixed(2)} <br> Time: ` + new Date().getHours() + ":" + new Date().getMinutes() + ":" + new Date().getSeconds()
    const _directionArray = document.getElementById("detectionarray");
    _directionArray.appendChild(_recordDiv);

    if (_btnsArray.includes(topWord)) {
      socket.emit("regionsocket", "__");
    }

    ///var hasButtonClick = candidateWordsContainer.querySelector(topWord) != null;
    if (prob_ > 0.9 && topWord == "one") {
      //document.getElementById("sequence1").style.backgroundColor = "green";
      truthChain[0] = true;
      console.log(truthChain);
    }
    if (prob_ > 0.9 && topWord == "two" && truthChain[0] == true) {
      //document.getElementById("sequence2").style.backgroundColor = "green";
      truthChain[1] = true;
      console.log(truthChain);
    }
    if (prob_ > 0.9 && topWord == "three" && truthChain[1] == true) {
      //document.getElementById("sequence3").style.backgroundColor = "green";
      truthChain[2] = true;
      console.log("found song!");
    }


    for (const word in candidateWordSpans) {
      if (word === topWord) {
        candidateWordSpans[word].classList.add('candidate-word-active');

        if (timeToLiveMillis != null) {
          setTimeout(() => {
            if (candidateWordSpans[word]) {
              candidateWordSpans[word].classList.remove(
                  'candidate-word-active');
            }
          }, timeToLiveMillis);
        }
      } else {
        candidateWordSpans[word].classList.remove('candidate-word-active');
      }
    }
  }
}

function includewavform() {
  if (includeAudioWaveformSpec == false) {
    includeAudioWaveformSpec = true;
    document.getElementById("includewav").style.backgroundColor = "rgba(70,70,70,1)";
    document.getElementById("includewav").style.border = "solid 1px grey";

  }
  else if (includeAudioWaveformSpec == true) {
    includeAudioWaveformSpec = false;
    document.getElementById("includewav").style.backgroundColor = "rgba(52, 52, 52, 1)";
    document.getElementById("includewav").style.border = "solid 1px black";
  }
}

function augmentnoisemix() {
  if (augmentNoise == false) {
    augmentNoise = true;
    document.getElementById("mixnoise").style.backgroundColor = "rgba(70,70,70,1)";
    document.getElementById("mixnoise").style.border = "solid 1px grey";
  }
  else if (augmentNoise == true) {
    augmentNoise = false;
    document.getElementById("mixnoise").style.backgroundColor = "rgba(52, 52, 52, 1)";
    document.getElementById("mixnoise").style.border = "solid 1px black";
  }
}


var wavesurfer = WaveSurfer.create({
  container: '#cont5',
  waveColor: 'white',
  progressColor: 'rgba(38,165,164,1)',
  loaderColor: 'rgba(38,165,164,1)',
  cursorColor: 'rgba(38,165,164,1)',

  height: 70,

  normalize: true,
  minimap: true,
  backend: 'MediaElement',
  plugins: [
    WaveSurfer.regions.create(/*{
      regions: [
          {
              start: 1,
              end: 3,
              loop: false,
              color: 'hsla(400, 100%, 30%, 0.5)'
          }, {
              start: 5,
              end: 7,
              loop: false,
              color: 'hsla(200, 50%, 70%, 0.4)'
          }
      ],
      dragSelection: {
          slop: 5
      }
  }*/),
    /*WaveSurfer.minimap.create({
                height: 30,
                waveColor: '#ddd',
                progressColor: '#999',
                cursorColor: '#999'
    }),*/
    WaveSurfer.timeline.create({
                container: '#cont6',
                primaryColor: 'white',
                secondaryColor: 'white',
                primaryFontColor: 'white',
                secondaryFontColor: 'white'

    }),
    WaveSurfer.cursor.create({
        showTime: true,
        opacity: 1,
        customShowTimeStyle: {
            'background-color': '#000',
            color: 'rgba(38,165,164,1)',
            padding: '2px',
            'font-size': '10px'
        }
    }),
    /*WaveSurfer.spectrogram.create({
      wavesurfer: wavesurfer,
      container: "#cont6",
      labels: true,
      //colorMap: need xxx.json
      //fftSamples - number of FFT samples (512 by default)
    })*/
]
});

wavesurfer.load('./static/scripts/audio/drum-loop.wav');

function playStopFile(v) {
  if (v == 'play') {
    wavesurfer.play();
    //play([start[, end]])
  }
  if (v == 'pause') {
    wavesurfer.pause();
  }
  if (v == 'stop') {
    wavesurfer.stop();
  }
  if (v == 'load') {
    wavesurfer.stop();
  }
}

wavesurfer.on('ready', function () {
});




document.getElementById('file-input').onclick = function() {
  document.getElementById('my_file').click();
};

document.getElementById('upload-dataset').onclick = function() {
  document.getElementById('dataset-file-input').click();
};

document.getElementById('audiofile').onclick = function() {
  document.getElementById('audio-file').click();
};

/*document.getElementById("modeldiskload").addEventListener('change', function(e){ 
  console.log(e);
}, false);*/
var newModelWords;
async function loadFile(file) {
  let text = await file.text();
  var e_ = file.name;
  var e__ = e_.replace('-metadata', '');
  console.log(e__);
  newModelWords = text;
  loadNewModelAfterWords(newModelWords, e__);
}

async function loadNewModelAfterWords(v, v_) {
  await recognizer.ensureModelLoaded();
  transferRecognizer = recognizer.createTransfer("newloaded");

  //transferRecognizer.load(`downloads://${v_}`);
  transferModelNameInput.value = loadedModelName;

  var obj = JSON.parse(v);
  console.log(obj);
  //obj = transferRecognizer.wordLabels().join(',');
  transferRecognizer.words = obj;
  console.log(transferRecognizer);
  
  //learnWordsInput.value = transferRecognizer.wordLabels().join(',');
  loadTransferModelButton.textContent = 'Model loaded!';  
}

document.getElementById("dataset-file-input").addEventListener('change', function(e){ 
  const files = datasetFileInput.files;
  if (files == null || files.length !== 1) {
      throw new Error('Must select exactly one file.');
  }
  const datasetFileReader = new FileReader();
  datasetFileReader.onload = async event => {
      try {
          await loadDatasetInTransferRecognizer(event.target.result);
      } catch (err) {
          const originalTextContent = uploadFilesButton.textContent;
          uploadFilesButton.textContent = err.message;
          setTimeout(() => {
              uploadFilesButton.textContent = originalTextContent;
          }, 2000);
      }
      durationMultiplierSelect.value = `${transferDurationMultiplier}`;
      durationMultiplierSelect.disabled = true;
      enterLearnWordsButton.disabled = true;
  };
  datasetFileReader.onerror = () => console.error(`Failed to binary data from file '${dataFile.name}'.`);
  datasetFileReader.readAsArrayBuffer(files[0]);
}, false);

document.getElementById("my_file").addEventListener('change', function(e){
  var file = this.files[0];
  if (file) {
      var reader = new FileReader();
      
      reader.onload = function (evt) {
          // Create a Blob providing as first argument a typed array with the file buffer
          var blob = new window.Blob([new Uint8Array(evt.target.result)]);

          // Load the blob into Wavesurfer
          let audio = new Audio();
          audio.src = URL.createObjectURL(blob);
          wavesurfer.load(audio);

          /*wavesurfer.loadBlob(blob);*/
      };

      reader.onerror = function (evt) {
          console.error("An error ocurred reading the file: ", evt);
      };

      // Read File as an ArrayBuffer
      reader.readAsArrayBuffer(file);
  }
}, false);

console.log("abrir waveform noutra janela");

var li;
document.body.onkeyup = function(e){
  if(e.keyCode == 32){
    //space bar
    wavesurfer.play();

    console.log(transferRecognizer.dataset.examples);
    
    for (const prop in transferRecognizer.dataset.examples) {
      var _e = prop;
        speechCommands.utils.playRawAudio(_rawAudio);
    }
    console.log(transferRecognizer);


  }
}

//https://github.com/katspaugh/wavesurfer.js/blob/master/example/annotation/app.js
var annotationID = 0;
function addAnnot(v){
  var _v = wavesurfer.getCurrentTime();
  var __e = wavesurfer.getDuration();

  console.log(wavesurfer);
  if (v == 'add') {
    wavesurfer.addRegion({
      start: _v,
      end: _v + __e/7,
      color: 'rgba(78,215,214,0.2)',
      id: annotationID
    });

    var _newfloat = parseFloat(_v).toFixed(3);
    var newfloat_ = _newfloat.replace(".", ":");

    var __newfloat = parseFloat(__e/7).toFixed(3);
    var ___newfloat = __newfloat.replace(".", ":");

    var _finalfloat = _v + __e/7;
    var __finalfloat = parseFloat(_finalfloat).toFixed(3);
    var ___finalfloat = __finalfloat.replace(".", ":");


    document.getElementById("idval").value = annotationID;
    document.getElementById("idlength").value = `00:000-${___newfloat}`;
    document.getElementById("triggerspace").value = `${newfloat_}-${___finalfloat}`;

    annotationID++;

  }
}
var annotObject;

wavesurfer.on('region-click', function(region, e) {
  e.stopPropagation();
  annotObject = region;
  // Play on click, loop on shift click
  e.shiftKey ? region.playLoop() : region.play();
  document.getElementById("idval").value = region.id;

});

wavesurfer.on('region-created', function(region,e) {
})


wavesurfer.on('region-updated', function(region, e) {

  annotObject = region;

  var _newtimeStart = parseFloat(region.start).toFixed(3);
  var __newtimeStart = _newtimeStart.replace(".", ":");

  var _newtimeStop = parseFloat(region.end).toFixed(3);
  var __newtimeStop = _newtimeStop.replace(".", ":");

  document.getElementById("triggerspace").value = `0${__newtimeStart}-0${__newtimeStop}`;

  var _difference = _newtimeStop - _newtimeStart;
  var __difference = parseFloat(_difference).toFixed(3);
  var ___difference = __difference.replace(".", ":");


  document.getElementById("idlength").value = `00:000-0${___difference}`;


});

wavesurfer.on('region-in', function (region, e) {
  annotObject = region;

  if (isMobile == true) {
    socket.emit("regionsocket", "_olaola_");
  }
  document.getElementById("idval").value = region.id;
  document.getElementById("blink-when-region").style["background-color"] = "rgba(38,165,164,1)";
  setTimeout(function(){
    document.getElementById("blink-when-region").style["background-color"] = "#353535";
  }, 70)
});

wavesurfer.on('region-out', function(region, e) {
  document.getElementById("blink-when-region").style["background-color"] = "rgba(38,165,164,1)";
  setTimeout(function(){
    document.getElementById("blink-when-region").style["background-color"] = "#353535";
  }, 70)
});

wavesurfer.on('region-mouseenter', function (region, e) {
  annotObject = region;

  document.getElementById("idval").value = region.id;
});

wavesurfer.on('region-updated', function (region, e) {
  annotObject = region;

  document.getElementById("idval").value = region.id;
});

wavesurfer.on('region-mouseleave', function (region, e) {
  annotObject = region;

  //document.getElementById("idval").value = "---";
});

wavesurfer.on('region-removed', function (region, e) {
  annotObject = region;
  //document.getElementById("idval").value = "---";
});
//CLEAR REGIONS
async function playstopRegion(v) {
  if (v == "play") {
    annotObject.playLoop();
    console.log("playloop?");
  }
  if (v == "stop") {
    wavesurfer.pause();

  }
  if (v == "close") {
    annotObject.remove();
  }
}


wavesurfer.on('region-play', function(region) {
  region.once('out', function() {
      wavesurfer.play(region.start);
      wavesurfer.pause();
  });
});

var loadedModelName, loadedModelName1;
$(document).click(function(event) {
  var text = $(event.target).text();
  if (text.includes("Models/") == true && !text.includes("Trained") && !text.includes("metadata") && !text.includes("weights")) {
    loadedModelName = text.replace('Models/','');
    transactedAmazonModel = loadedModelName;
    getmodels(text);
  }
  if (text.includes("Datasets/") == true && !text.includes("Recorded")) {
    loadedModelName1 = text.replace('Datasets/','');
    transactedAmazonModel1 = loadedModelName1;
    getdatasets(text);
  }
});

async function getdatasets(v) {
  console.log(v);
  var params = {
    Bucket: "xperimusmodels", 
    Key: v, 
    //Range: "bytes=0-9"
   };
   s3.getObject(params, function(err, data) {
    if (err) console.log(err, err.stack); 
    else     console.log(data);  
    //var __e = data.Body.toString();

    //var _dname = `Datasets/${v_}.weights.bin`
    window.open(`https://xperimusmodels.s3.eu-west-2.amazonaws.com/${v}`, '_blank');
   
 });
}

async function getmodels(v) {
  var params = {
    Bucket: "xperimusmodels", 
    Key: v, 
    //Range: "bytes=0-9"
   };
  s3.getObject(params, function(err, data) {
     if (err) console.log(err, err.stack); 
     else     console.log(data);           
     //document.location = 'data:audio/midi;base64,' + btoa(file.toBytes());
     var __e = data.Body.toString();
     console.log(__e);
    var _e = JSON.parse(__e);
    //_e.metadata = recornizer.;
    console.log(_e); 
    var __v = v.replace('Models/','');

    var dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(__e));
    var dlAnchorElem = document.getElementById('downloadAnchorElem');
    dlAnchorElem.setAttribute("href",     dataStr     );
    dlAnchorElem.setAttribute("download", __v);
    dlAnchorElem.click();
    getSameModelMetadata(__v);

    _well(_e);
    
  });
}

async function getSameModelMetadata(v) {
  var v_ = v.replace('.json','');
  var _key = `Models/${v_}-metadata.json`
  var _sname = `${v_}-metadata.json`
  var params = {
    Bucket: "xperimusmodels", 
    Key: _key, 
   };
  s3.getObject(params, function(err, data) {
     if (err) console.log(err, err.stack); 
     else     console.log(data);           
     var __e = data.Body.toString();
     /*console.log(__e);
     var _e = JSON.parse(__e);
     //_e.metadata = recornizer.;
     console.log(_e);*/

    var dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(__e));
    var dlAnchorElem = document.getElementById('downloadAnchorElem');
    dlAnchorElem.setAttribute("href",     dataStr     );
    dlAnchorElem.setAttribute("download", _sname);
    dlAnchorElem.click();

    var _wname = `Models/${v_}.weights.bin`
    window.open(`https://xperimusmodels.s3.eu-west-2.amazonaws.com/${_wname}`, '_blank');
    
  });
}


var _metadata;
async function _well(v) {
  console.log(v);
  var DBOpenRequest = window.indexedDB.open("tensorflowjs", dbVersion);
  DBOpenRequest.onupgradeneeded = function(event) {
    var db = event.target.result;
    var objectStore = db.createObjectStore("models_store", { keyPath: "modelPath" });
    _metadata = v.metadata;
    delete v["metadata"];
    objectStore.add(v);
    __well(v, _metadata);
  }
}

async function __well(v, metadata_) {
  
  await recognizer.ensureModelLoaded();
  //await tf.loadLayersModel('indexeddb//my-model');
  transferRecognizer = recognizer.createTransfer(loadedModelName);
  console.log(loadedModelName);
  transferRecognizer.load(`indexeddb://${loadedModelName}`);
  
  transferModelNameInput.value = loadedModelName;
  //v.metadata = transferRecognizer.wordLabels().join(',');
  transferRecognizer.words = metadata_;
  //learnWordsInput.value = transferRecognizer.wordLabels().join(',');
  loadTransferModelButton.textContent = 'Model loaded!';  
}


function ArrayBufferToString(buffer) {
  return BinaryToString(String.fromCharCode.apply(null, Array.prototype.slice.apply(new Uint8Array(buffer))));
}

function StringToArrayBuffer(string) {
  return StringToUint8Array(string).buffer;
}

function BinaryToString(binary) {
  var error;

  try {
      return decodeURIComponent(escape(binary));
  } catch (_error) {
      error = _error;
      if (error instanceof URIError) {
          return binary;
      } else {
          throw error;
      }
  }
}

function StringToBinary(string) {
  var chars, code, i, isUCS2, len, _i;

  len = string.length;
  chars = [];
  isUCS2 = false;
  for (i = _i = 0; 0 <= len ? _i < len : _i > len; i = 0 <= len ? ++_i : --_i) {
      code = String.prototype.charCodeAt.call(string, i);
      if (code > 255) {
          isUCS2 = true;
          chars = null;
          break;
      } else {
          chars.push(code);
      }
  }
  if (isUCS2 === true) {
      return unescape(encodeURIComponent(string));
  } else {
      return String.fromCharCode.apply(null, Array.prototype.slice.apply(chars));
  }
}

function StringToUint8Array(string) {
  var binary, binLen, buffer, chars, i, _i;
  binary = StringToBinary(string);
  binLen = binary.length;
  buffer = new ArrayBuffer(binLen);
  chars  = new Uint8Array(buffer);
  for (i = _i = 0; 0 <= binLen ? _i < binLen : _i > binLen; i = 0 <= binLen ? ++_i : --_i) {
      chars[i] = String.prototype.charCodeAt.call(binary, i);
  }
  return chars;
}

var trace1 = {
  x: [],
  y: [],
  type: 'scatter'
};

var trace2 = {
  x: [],
  y: [],
  type: 'scatter'
};

var data = [trace1, trace2];
var colors = ['rgba(67,67,67,1)', 'rgba(115,115,115,1)'];
var layout = {
  autosize: true,
  //height: "5%",//150,
  //width: 282,
  showlegend: false,
  line: {
    color: colors[i]
  },
  colorway : ['rgba(38,165,164,1)', 'rgba(38,165,164,1)'],
  margin: {
    l: 0,
    r: 0,
    b: 0,
    t: 0,
    pad: -4
  },
  xaxis: {
    showticklabels: true,
    showgrid: true,
    zeroline: true,
    showline: true,
    mirror: 'ticks',
    gridcolor: 'rgba(32,32,32,1)',
    gridwidth: 1,
    zerolinecolor: 'rgba(32,32,32,1)',
    zerolinewidth: 4,
    linecolor: '#636363',
    linewidth: 1,
    title: 'Epoch',
    range: [-1.2, parseInt(epochsInput.value)]

  },
  yaxis: {
    showticklabels: true,
    showgrid: true,
    zeroline: true,
    showline: true,
    mirror: 'ticks',
    gridcolor: 'rgba(32,32,32,1)',
    gridwidth: 1,
    zerolinecolor: 'rgba(32,32,32,1)',
    zerolinewidth: 4,
    linecolor: '#636363',
    linewidth: 1,
    title: 'Loss',
    range: [-0.2, 1.2]
  },
  paper_bgcolor: 'rgba(52,52,52,1)',
  plot_bgcolor: 'rgba(52,52,52,1)',
  font: {
    //family: 'Courier New, monospace',
    //size: 18,
    color: 'rgba(200,200,200,1)'
  }
};

var layout1 = {
  autosize: true,
  //height: "5%",//150,
  //width: 282,
  showlegend: false,
  line: {
    color: colors[i]
  },
  colorway : ['rgba(38,165,164,1)', 'rgba(38,165,164,1)'],
  margin: {
    l: 0,
    r: 0,
    b: 0,
    t: 0,
    pad: -4
  },
  xaxis: {
    showgrid: true,
    zeroline: true,
    showline: true,
    mirror: 'ticks',
    gridcolor: 'rgba(32,32,32,1)',
    gridwidth: 1,
    zerolinecolor: 'rgba(32,32,32,1)',
    zerolinewidth: 4,
    linecolor: '#636363',
    linewidth: 1,
    title: 'Epoch',
    range: [-1.2, parseInt(epochsInput.value)]
  },
  yaxis: {
    showticklabels: true,
    showgrid: true,
    zeroline: true,
    showline: true,
    mirror: 'ticks',
    gridcolor: 'rgba(32,32,32,1)',
    gridwidth: 1,
    zerolinecolor: 'rgba(32,32,32,1)',
    zerolinewidth: 4,
    linecolor: '#636363',
    linewidth: 1,
    title: 'Accuracy',
    range: [-0.2, 1.2]
  },
  paper_bgcolor: 'rgba(52,52,52,1)',
  plot_bgcolor: 'rgba(52,52,52,1)',
  font: {
    //family: 'Courier New, monospace',
    //size: 18,
    color: 'rgba(200,200,200,1)'
  }
};

Plotly.newPlot('loss-plot', data, layout);
Plotly.newPlot('accuracy-plot', data, layout1);

var isMobile = false;

async function mobilePerformanceSetup() {
  /*$('div').not('#allPage').remove();
  document.body.innerHTML = '';
  $('body').append('<div id="performancemode"><br><br><br>performance-mode<br><div id="roomSend"><input type="text" id="interroom" name="room" value="Connect"></input><br><button>Send</button></div></div>');
  isMobile = true;*/
}

async function sendingDataSockets() {

  if (isMobile == true) {
    isMobile = false;
    var _a = document.getElementById("streamButton");
    _a.style['backgroundColor'] = 'rgba(32,32,32,1)';
  }
  else if (isMobile == false) {
    isMobile = true;
    var _a = document.getElementById("streamButton");
    _a.style['backgroundColor'] = 'rgba(38,165,164,1)';
  }
  console.log(isMobile);
}

async function spectrogramNewWindow() {
  var w = window.open("", "", "toolbar=no,location=no,directories=no,status=no,menubar=no,scrollbars=yes,resizable=yes,width=780,height=200,top="+(screen.height-400)+",left="+(screen.width-840));
  w.document.title = 'Audio Spectrogram';
}

var modal = document.getElementById("amazonmodal");
var _modal = document.getElementById("modal-content");
var span = document.getElementById("closemodal");

buttonIDDownload = 0;
document.getElementById('load-transfer-model').onclick = function() {
  document.getElementById('modal-content').innerHTML = "";

  s3.listObjects(function (err, data) {
    if(err)throw err;
    //var e = data.Contents[0].Key;
    var e = data.Contents
    var _e = JSON.stringify(e);
  
    Object.keys(e).forEach((key, index) => {  
      if (e[key].Key.includes("Models") == true && !e[key].Key.includes("metadata") && !e[key].Key.includes("weights") && e[key].Key.includes(".json")) {

        var button = document.createElement("button");
        button.style["height"] = "10%"; 
        button.style["overflow"] = "auto"; 
        button.style["position"] = "relative"; 
        button.style["width"] = "60%"; 
        button.style["left"] = "20%"; 
        button.style["top"] = "30%"; 
        button.style["text-align"] = "center"; 
        button.style["background-color"] = "rgba(42,42,42,1)"; 
        button.style["border-radius"] = "3px"; 
        button.style["border"] = "1px solid #888"; 
        button.style["color"] = "grey"; 
        button.id = buttonIDDownload;
        button.onclick = downloadFilesDirectly;

        var e_ = e[key].Key.replace("Models/", "");
        var e__ = e_.replace(".json", "");
        button.innerHTML = e__;
        var __e = document.getElementById('modal-content')
        __e.appendChild(button);
      }
      buttonIDDownload++;
    });
  });

  //wordDiv.style['margin'] = '2px';

  /*ar $el_ = $('#cont11').clone(true, true).appendTo('#modal-content');
  
  $el_.css({position:'absolute', width: '60%', top: 200, left: '20%', backgroundColor: 'red'});
  $el_.children().attr( "onclick", null );
  var children = $el_.children();
  for (var i = 0; i < children.length; i++) {
    var tableChild = children[i];
    var e = tableChild.innerHTML.replace("Models/", "");
    var e_ = tableChild.innerHTML.replace(".json", "");
    if (tableChild.innerHTML.includes("metadata")) {

    }
    tableChild.innerHTML = _e;
    console.log(tableChild.innerHTML);
  }

  console.log($el_.children());*/
  modal.style.display = "block";
};

var newArrayOfNames;
function reqListener () {
  var _e = JSON.parse(this.responseText);
  newArrayOfNames = _e;
}



async function downloadFilesDirectly() {
  var oReq = new XMLHttpRequest();
  oReq.addEventListener("load", reqListener);
  oReq.open("GET", `https://xperimusmodels.s3.eu-west-2.amazonaws.com/Models/${event.srcElement.innerHTML}-metadata.json`, false );
  oReq.send();
  transferRecognizer = recognizer.createTransfer(event.srcElement.innerHTML);
  transferRecognizer.words = newArrayOfNames; // AQUI MAN .words 
  transferRecognizer.load(`https://xperimusmodels.s3.eu-west-2.amazonaws.com/Models/${event.srcElement.innerHTML}.json`);

  modal.style.display = "none";

}


span.onclick = function() {
  console.log("works");
  modal.style.display = "none";
}
window.onclick = function(event) {
  if (event.target == modal) {
    modal.style.display = "none";
  }
}

$( function() {
  $("#draggable").draggable({containment: "parent"});
  $('#draggable').animate({
    'left' : "20%",
    'top' : "5%"
  });

  $("#draggable1").draggable({containment: "parent"});
  $('#draggable1').animate({
    'left' : "65%",
    'top' : "-5%"
  });

  $("#draggable2").draggable({containment: "parent"});
  $('#draggable2').animate({
    'left' : "45%",
    'top' : "5%"
  });
});

var c = document.getElementById("door");
var ctx = c.getContext("2d");
ctx.beginPath();
ctx.lineWidth = 4;
ctx.arc(0, 130, 90, 10, 2 * Math.PI);
ctx.fillStyle = 'rgba(32,32,32,1)';
ctx.fill();
ctx.lineTo(0, 130);
ctx.strokeStyle = 'black';
ctx.stroke();

const interactionState = {
  name: [],
  players: 0,
  playerIDS: [],
  thisid: ""
}

var _room = document.getElementById("interroom");

lockRoom.addEventListener('click', () => {
  _room.disabled = true;
  console.log(_room.value);
  interactionState.name = [];
  interactionState.name.push(_room.value);

  lockRoom.backgroundColor = "rgba(72,72,72,1)";
  lockRoom.style.border = "1px solid grey";
  _room.style.backgroundColor = "rgba(72,72,72,1)";
  _room.style.border = "1px solid grey";

  socket.emit("addRoom", _room.value);
});

var controlTerminal = document.getElementById("control-terminal");

socket.on('new-room-added', function(data) {
  var output_node = document.createElement("div");
  output_node.innerHTML = `${data}`;
  output_node.style["padding-right"] = "10px";

  controlTerminal.appendChild(output_node);
});


sendRoom = document.getElementById("send-room");
_enterRoom = document.getElementById("enter-room");

sendRoom.addEventListener('click', () => {
  socket.emit("enter-room", _enterRoom.value);
});

socket.on("room-token", function(data) {
  console.log(data);
  if (data == interactionState.name) {
    interactionState.players++

  }
});

/*lockRoom.backgroundColor = "rgba(72,72,72,1)";
lockRoom.style.border = "1px solid grey";
_room.style.backgroundColor = "rgba(72,72,72,1)";
_room.style.border = "1px solid grey";
_room.value = data;*/

newRoom.addEventListener('click', () => {
  _room.style.backgroundColor = "#353535";
  _room.style.border = "1px solid black";
  _room.disabled = false;
});

var _bufwavesurfer = WaveSurfer.create({
  container: '#bufferplot',
  //waveColor: 'rgba(38,165,164,1)',
  waveColor: 'white',
  progressColor: 'rgba(38,165,164,1)',
  loaderColor: 'rgba(38,165,164,1)',
  cursorColor: 'rgba(38,165,164,0)',
  height: 60,
  normalize: true,
  minimap: true,
  backend: 'MediaElement'
});


const _fileInput = document.getElementById('audio-file');

console.log("check multiple audio contexts");

var _audioCtx = new AudioContext(); 
var _sourceNode = _audioCtx.createBufferSource();
var _dataSocketBuf = null;
var _receiverBuffer = [];


_fileInput.addEventListener("change", function(event) {
  var evtAttrs = event.srcElement.files[0];
  var reader = new FileReader();
  //
  reader.onload = function (evt) {

    var blob = new window.Blob([new Uint8Array(evt.target.result)]);

    let audio = new Audio();
    audio.src = URL.createObjectURL(blob);
    _bufwavesurfer.load(audio);
  };

  reader.addEventListener("loadend", function(e) {

    arrayBuffer = reader.result;
    //plotWaveformBuf(arrayBuffer);


    _audioCtx.decodeAudioData(reader.result, function(buffer) {

      var bufAttrs = [];
      var _channeldata = buffer.getChannelData(0);
      var arrayBuffer = new Float32Array(_channeldata);

      //var __e = new Uint8Array(_channeldata);
      //console.log(__e);
      //
      
      bufAttrs.push(buffer.length, buffer.duration, buffer.sampleRate, buffer.numberOfChannels);

      socket.emit("new-buffer", bufAttrs);
      socket.emit("buffer-qual", arrayBuffer.buffer);

      var _bufAttrs = buffer;
      aboutAudioFile(evtAttrs, _bufAttrs);

      //socket.emit("buffer-qual", arrayBuffer.buffer);

    });
  });

	reader.readAsArrayBuffer(this.files[0]);
}, false);


async function aboutAudioFile(e,a) {
  console.log(e);
  document.getElementById('name-audio-file-fill').innerHTML = e.name;
  document.getElementById('type-audio-file-fill').innerHTML = e.type;
  document.getElementById('size-audio-file-fill').innerHTML = e.size;

  document.getElementById('buflen-audio-file-fill').innerHTML = a.length;
  var _duration = parseFloat(a.length).toFixed(3);
  document.getElementById('bufdur-audio-file-fill').innerHTML = _duration;
  document.getElementById('bufsamp-audio-file-fill').innerHTML = a.sampleRate;
  document.getElementById('bufnumc-audio-file-fill').innerHTML = a.numberOfChannels;



  
  console.log(a);

  //_bufwavesurfer.loadDecodedBuffer(blob);
  
}

async function plotWaveformBuf(v) {
  console.log(v);
}

var _newSongData;
socket.on('new-buffer', function(data) {
  console.log(data);
  _newSongData = data
});

var newSongBufferToCopy;
socket.on('buffer-qual', function(data) {
  console.log(_newSongData);
  var __arrayBuffer = new Float32Array(data);
  console.log(__arrayBuffer);
  var myArrayBuffer = _audioCtx.createBuffer(_newSongData[3], _newSongData[0], _newSongData[2]);
  myArrayBuffer.copyToChannel(__arrayBuffer, 0, 0); 
  if (_newSongData[3] != 1) {
    myArrayBuffer.copyToChannel(__arrayBuffer, 1, 0);
  }
  //myArrayBuffer.duration = _newSongData[1];
  var _source = _audioCtx.createBufferSource();
  _source.buffer = myArrayBuffer;
  newSongBufferToCopy = myArrayBuffer;
  _source.connect(_audioCtx.destination);
  _source.start();
});

navigator.mediaDevices.enumerateDevices().then((devices) => {
  devices.filter((d) => d.kind === 'audioinput');
  console.log(devices);
  devices.forEach(function(device) {
    console.log(device.kind + ": " + device.label +
                " id = " + device.deviceId);
  }); 
});

var button1 = document.querySelector('#play-stream-socket');
button1.addEventListener("mousedown", function(){ 
  button1.style.backgroundColor = 'rgba(38,165,164,1)';
});

button1.addEventListener("mouseup", function() {
  button1.style.backgroundColor = '#353535';
});

button1.addEventListener("click", function() {
  button1.style.backgroundColor = '#353535';
});

button1.addEventListener('click', () => {
  socket.emit("play-buffer", "play");
});

socket.on("buffer-play", function(data) {
  console.log(data);
  var _source = _audioCtx.createBufferSource();
  _source.buffer = newSongBufferToCopy;
  _source.connect(_audioCtx.destination);
  _source.start();
  //AudioBufferSourceNode.start([when][, offset][, duration]);
});


