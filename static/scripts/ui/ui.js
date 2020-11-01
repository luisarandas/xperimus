/**
 * 
 *  Sttera UI
 *  © 2020
 * 
 */

var newFile = false;
//test if I can interact with DOM first

var _rawAudio;
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
      const exampleUIDs = this.transferRecognizer.getExamples(word).map(ex => ex.uid);
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
        playButton.textContent = '➤';
        playButton.addEventListener('click', () => {
          playButton.disabled = true;
          speechCommands.utils.playRawAudio(
              rawAudio, () => playButton.disabled = false);
        });
        playButton.style['position'] = 'absolute';
        playButton.style['left'] = `${_leftSize + 26 + _exampleC}px`;
        playButton.style['width'] = '30px';
        playButton.style['border-radius'] = '3px';
        playButton.style['border'] = '1px solid black';
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
      deleteButton.style['border'] = '1px solid black';
      deleteButton.style['background-color'] = "rgba(53,53,53,1)";
      deleteButton.style['color'] = "rgba(200,200,200,1)";
      deleteButton.style['width'] = "30px";
      deleteButton.style['height'] = '50%';
      deleteButton.style['font-height'] = '12px';

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
          `rgb(${0},${colorValue},${colorValue})`; 
      context.fillStyle = fillStyle;
      context.fillRect(x, y, pixelWidth, pixelHeight);
      
    }
  }

  if (config.markKeyFrame) {
    
    console.log(config);
    console.log(config.markKeyFrame);
    console.log(speechCommands);

  const keyFrameIndex = config.keyFrameIndex == null ?
      await speechCommands
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

  console.log(speechCommands.spectrogram2IntensityCurve);
}
}

function blinkButtons(divid) {
  var style = document.getElementById(divid).style;
  console.log(style.backgroundColor);
  if (style.backgroundColor === "rgb(38, 165, 164)") {
    style.backgroundColor = "#353535";
    style.color = "#C8C8C8"
  } else {
    style.backgroundColor = "rgb(38, 165, 164)";
    style.color = "black"
  }
  /*if (document.getElementById(divid).style["background-color"] == "rgb(38,165,164)") {

    document.getElementById(divid).style["background-color"] = "#c2c2c2";
    document.getElementById(divid).style["color"] = "white";
  
  } else {
    document.getElementById(divid).style["background-color"] = "rgb(38,165,164)"
    document.getElementById(divid).style["color"] = "black";
    console.log("OLA2")
  }  */
}

export { newFile }
export { DatasetViz, removeNonFixedChildrenFromWordDiv, plotSpectrogram, blinkButtons }