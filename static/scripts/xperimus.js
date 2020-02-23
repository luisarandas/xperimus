
// Instantiate Model

// enviar remote people ->
// fader controlar o threshold caso possivel dinamicamente
// controlar o numero dos outros samples que não o background noise
// jorge coelho -- plotly

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

s3.listObjects(function (err, data) {
  if(err)throw err;
  //var e = data.Contents[0].Key;
  var e = data.Contents
  var _e = JSON.stringify(e);

  Object.keys(e).forEach((key, index) => {
    //for (i = 0; i < e.length; i++) {}

    var button = document.createElement("button");
    button.innerHTML = e[key].Key;
    document.getElementById('database').appendChild(button);
    document.getElementById('database').appendChild(document.createElement("br"));
    
    console.log(key, e[key]);
  });

  console.log(e);
  //document.getElementById('database').innerHTML = _e;
  console.log(data);
});

const tensorflow = tf; // check later
const SpeechCommands = speechCommands;

const startButton = document.getElementById('start');
const stopButton = document.getElementById('stop');

const predictionCanvas = document.getElementById('prediction-canvas');

const probaThresholdInput = document.getElementById('proba-threshold');
const epochsInput = document.getElementById('epochs');
const fineTuningEpochsInput = document.getElementById('fine-tuning-epochs');

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
const savedTransferModelsSelect = document.getElementById('saved-transfer-models');
const deleteTransferModelButton = document.getElementById('delete-transfer-model');

const statusDisplay = document.getElementById('status-display');
const candidateWordsContainer = document.getElementById('candidate-words');

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


const XFER_MODEL_NAME = 'xfer-model';
const MIN_EXAMPLES_PER_CLASS = 8;

let recognizer;
let transferWords;
let transferRecognizer;
let transferDurationMultiplier;

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
      wordDiv.appendChild(leftButton);
  
      const rightButton = document.createElement('button');
      rightButton.textContent = '→';
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
      exampleCanvas.style['vertical-align'] = 'middle';
      exampleCanvas.height = 60;
      exampleCanvas.width = 80;
      exampleCanvas.style['padding'] = '3px';
  
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
  
      if (rawAudio != null) {
        const playButton = document.createElement('button');
        playButton.textContent = '▶️';
        playButton.addEventListener('click', () => {
          playButton.disabled = true;
          speechCommands.utils.playRawAudio(
              rawAudio, () => playButton.disabled = false);
        });
        wordDiv.appendChild(playButton);
      }
  
      // Create Delete button.
      const deleteButton = document.createElement('button');
      deleteButton.textContent = 'X';
      wordDiv.appendChild(deleteButton);
  
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
        this.startTransferLearnButton.textContent = 'Start transfer learning';
        this.startTransferLearnButton.disabled = false;
      } else {
        this.startTransferLearnButton.textContent =
            `Need at least ${requiredMinCountPerClass} examples per word`;
        this.startTransferLearnButton.disabled = true;
      }
  
      this.downloadAsFileButton.disabled =
          this.transferRecognizer.isDatasetEmpty();
    }
}


(async function() {
    console.log("Creating Recognizer");
    recognizer = SpeechCommands.create('BROWSER_FFT');

    // await populateSavedTransferModelsSelect();
    // onde ele vem por HTTP

    recognizer.ensureModelLoaded().then(() => {
        startButton.disabled = false;
        transferModelNameInput.value = `model-${getDateString()}`;

        console.log("Loaded Model");

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
    const activeRecognizer = transferRecognizer == null ? recognizer : transferRecognizer;
    populateCandidateWords(activeRecognizer.wordLabels());

    const suppressionTimeMillis = 1000;
    activeRecognizer.listen( result => {

      console.log(result);

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
    });
    console.log(probaThresholdInput.value);
});

stopButton.addEventListener('click', () => {
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

/** Transfer Learning Logic */

let collectWordButtons = {};
let datasetViz;

function createProgressBarAndIntervalJob(parentElement, durationSec) {
    const progressBar = document.createElement('progress');
    progressBar.value = 0;
    progressBar.style['width'] = `${Math.round(window.innerWidth * 0.25)}px`;
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
        wordDivs[word] = wordDiv;
        wordDiv.setAttribute('word', word);
        const button = document.createElement('button');
        button.setAttribute('isFixed', 'true');
        button.style['display'] = 'inline-clock';
        button.style['vertical-align'] = 'middle';

        const displayWord = word === BACKGROUND_NOISE_TAG ? 'noise' : word;

        button.textContent = `${displayWord} (0)`;
        wordDiv.appendChild(button);
        wordDiv.className = 'transfer-word';
        collectButtonsDiv.appendChild(wordDiv);
        collectWordButtons[word] = button;
        
        let durationInput;
        if (word === BACKGROUND_NOISE_TAG) {
            // create noise duration input
            durationInput = document.createElement('input');
            durationInput.setAttribute('isFixed', 'true');
            durationInput.value = '10';
            durationInput.style['width'] = '100px';
            wordDiv.appendChild(durationInput);
            //create time-unit span for noise duration
            const timeUnitSpan = document.createElement('span');
            timeUnitSpan.setAttribute('isFixed', 'true');
            timeUnitSpan.classList.add('settings');
            timeUnitSpan.style['vertical-align'] = 'middle';
            timeUnitSpan.textContent = 'seconds';
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

                const barAndJob = createProgressBarAndIntervalJob(wordDiv, durationSec);
                progressBar = barAndJob.progressBar;
                intervalJob = barAndJob.intervalJob;
            } else {
            // If this is not a background-noise word type and if the duration
            // multiplier is >1 (> ~1 s recoding), show an incrementally
            // updating spectrogram in real time.
                collectExampleOptions.durationMultiplier = transferDurationMultiplier;
                let tempSpectrogramData;
                const tempCanvas = document.createElement('canvas');
                tempCanvas.style['margin-left'] = '132px';
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
            collectExampleOptions.includeRawAudio = includeTimeDomainWaveformCheckbox.checked;
            const spectrogram = await transferRecognizer.collectExample(word, collectExampleOptions);

            if (intervalJob != null) {
                clearInterval(intervalJob);
            }
            if (progressBar != null) {
                wordDiv.removeChild(progressBar);
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
        enterLearnWordsButton.textContent = 'Need model name!';
        setTimeout(() => {
            enterLearnWordsButton.textContent = 'Enter transfer words';
        }, 2000);
        return;
    }
   

    transferDurationMultiplier = durationMultiplierSelect.value;

    learnWordsInput.disabled = true;
    transferWords = learnWordsInput.value.trim().split(',').map(w => w.trim());
    transferWords.sort();
    if (transferWords == null || transferWords.length <= 1) {
        console.log("ERROR: Invalid list of transfer words");
        return;
    }

    transferRecognizer = recognizer.createTransfer(modelName);
    createWordDivs(transferWords);

});
/*
function disableAllCollectWordButtons() {
    for (const word in collectWordButtons) {
        collectWordButtons[word].disabled = true;
    }
}

function enableAllCollectWordButtons() {
    for (const word in collectWordButtons) {
        collectWordButtons[word].disabled = false;
    }
}

function disableFileUploadControls() {
    datasetFileInput.disabled = true;
    uploadFilesButton.disabled = true;
}*/

startTransferLearnButton.addEventListener('click', async () => {
    startTransferLearnButton.disabled = true;
    startButton.disabled = true;
    startTransferLearnButton.textContent = 'Transfer learning started...';
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
            {
              width: 480,
              height: 360,
              xaxis: {title: 'Epoch #'},
              yaxis: {title: 'Loss'},
              font: {size: 18}
            });
        Plotly.newPlot(
            'accuracy-plot',
            [
              trainAccValues[INITIAL_PHASE], valAccValues[INITIAL_PHASE],
              trainAccValues[FINE_TUNING_PHASE], valAccValues[FINE_TUNING_PHASE]
            ],
            {
              width: 480,
              height: 360,
              xaxis: {title: 'Epoch #'},
              yaxis: {title: 'Accuracy'},
              font: {size: 18}
            });
        startTransferLearnButton.textContent = phase === INITIAL_PHASE ?
            `Transfer-learning... (${(epoch / epochs * 1e2).toFixed(0)}%)` :
            `Transfer-learning (fine-tuning)... (${
                (epoch / fineTuningEpochs * 1e2).toFixed(0)}%)`
                
    }

    //disableAllCollectWordButtons();
    const augmentByMixingNoiseRatio = document.getElementById('augment-by-mixing-noise').checked ? 0.5 : null;
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
    saveTransferModelButton.disabled = false;
    transferModelNameInput.value = transferRecognizer.name;
    transferModelNameInput.disable = true;
    startTransferLearnButton.textContent = 'Transfer learning complete.';
    transferModelNameInput.disabled = false;
    startButton.disabled = false;
    evalModelOnDatasetButton.disabled = false;
});

var modelname;

downloadAsFileButton.addEventListener('click', () => {
    const basename = getDateString();
    modelname = basename;
    const artifacts = transferRecognizer.serializeExamples();

    //trigger downloading of the data .bin file.
    const anchor = document.createElement('a');
    anchor.download = `${basename}.bin`;
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
    return `${year}-${month}-${day}T${hour}.${minute}.${second}`;
}

uploadFilesButton.addEventListener('click', async () => {
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
});

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
  
        Plotly.newPlot('roc-plot', [rocDataForPlot], {
          width: 360,
          height: 360,
          mode: 'markers',
          marker: {size: 7},
          xaxis: {title: 'False positive rate (FPR)', range: [0, 1]},
          yaxis: {title: 'True positive rate (TPR)', range: [0, 1]},
          font: {size: 18}
        });
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

    //aqui

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

saveTransferModelButton.addEventListener('click', async () => {
    
    //await transferRecognizer.save();

    await populateSavedTransferModelsSelect(); //await
    saveTransferModelButton.textContent = 'Model saved!';
    //await transferRecognizer.save('downloads://my-model'); //await
    await transferRecognizer.save('indexeddb://my-model'); //await
    //await transferRecognizer.save('localstorage://my-model'); //await

    await indexddb();
});

var transac = false;
var loadedmodel;

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
        
        var objectStoreRequest = objectStore.get("my-model");

        objectStoreRequest.onsuccess = function(event) {
        // report the success of our request
          var myRecord = objectStoreRequest.result;
          loadedmodel = myRecord;
          console.log(loadedmodel);

          localStorage.setItem('my-model', JSON.stringify(loadedmodel));

          var modelStringify = JSON.stringify(myRecord);
          console.log(modelStringify);



          const uploadFile = (fileName) => {

            const params = {
                Bucket: 'xperimusmodels/Models',
                Key: `model-${getDateString()}`, 
                Body: fileName
            };

            s3.upload(params, function(err, data) {
                if (err) {
                    throw err;
                }
                console.log(`File uploaded successfully. ${data.Location}`);
            });
          };
          uploadFile(modelStringify);
        };
      }
      getData();

    }

}

var __e;
var _e;
function well() {
  var params = {
    Bucket: "xperimusmodels", 
    Key: "Models/model-2020-02-21T11.03.34", 
    //Range: "bytes=0-9"
   };
  s3.getObject(params, function(err, data) {
     if (err) console.log(err, err.stack); // an error occurred
     else     console.log(data);           // successful response
     //document.location = 'data:audio/midi;base64,' + btoa(file.toBytes());
     __e = data.Body.toString();
     console.log(__e);
    
    _e = JSON.parse(__e);
    console.log(_e); 

    transferRecognizer.save();

     
    //transferRecognizer = recognizer.createTransfer("olaz");
    //console.log(transferRecognizer);

    //const transferRecognizer = await recognizer.loadModel(tf.io.fromMemory(
    //  modelTopology, weightSpecs, weightData));
    //console.log(transferRecognizer);

  });
}

loadTransferModelButton.addEventListener('click', async () => {

  await recognizer.ensureModelLoaded();
  await tf.loadLayersModel('indexeddb://my-model');
  await transferRecognizer.load('indexeddb://my-model');
  transferModelNameInput.value = 'my-model';
  learnWordsInput.value = transferRecognizer.wordLabels().join(',');
  loadTransferModelButton.textContent = 'Model loaded!';
        
});
  
deleteTransferModelButton.addEventListener('click', async () => {
    const transferModelName = savedTransferModelsSelect.value;
    await recognizer.ensureModelLoaded();
    transferRecognizer = recognizer.createTransfer(transferModelName);
    await SpeechCommands.deleteSavedTransferModel(transferModelName);
    deleteTransferModelButton.disabled = true;
    deleteTransferModelButton.textContent = `Deleted "${transferModelName}"`;
    await populateSavedTransferModelsSelect();
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

function populateCandidateWords(words) {

    candidateWordSpans = {};
  
    for (const word of words) {
      if (word === BACKGROUND_NOISE_TAG || word === UNKNOWN_TAG) {
        continue;
      }
      const wordSpan = document.createElement('span');
      wordSpan.textContent = word;
      wordSpan.classList.add('candidate-word');
      candidateWordsContainer.appendChild(wordSpan);
      candidateWordSpans[word] = wordSpan;
    }
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
          `rgb(${colorValue},${255 - colorValue},${255 - colorValue})`;
      context.fillStyle = fillStyle;
      context.fillRect(x, y, pixelWidth, pixelHeight);
    }
  }

  if (config.markKeyFrame) {
    const keyFrameIndex = config.keyFrameIndex == null ?
        await SpeechCommands
            .getMaxIntensityFrameIndex(
                {data: frequencyData, frameSize: fftSize})
            .data() :
        config.keyFrameIndex;
    // Draw lines to mark the maximum-intensity frame.
    context.strokeStyle = 'black';
    context.beginPath();
    context.moveTo(pixelWidth * keyFrameIndex, 0);
    context.lineTo(pixelWidth * keyFrameIndex, canvas.height * 0.1);
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

    document.getElementById('probabil').innerHTML = `"${topWord}" (p=${wordsAndProbs[0][1].toFixed(6)}) @ ` + new Date().toTimeString();



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
