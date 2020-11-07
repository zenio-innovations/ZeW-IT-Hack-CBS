import React, { useState, useRef, useReducer } from "react";
import * as tf from '@tensorflow/tfjs';
import "./App.css";

const machine = {
  initial: "initial",
  states: {
    initial: { on: { next: "loadingModel" } },
    loadingModel: { on: { next: "modelReady" } },
    modelReady: { on: { next: "imageReady" } },
    imageReady: { on: { next: "identifying" }, showImage: true },
    identifying: { on: { next: "complete" } },
    complete: { on: { next: "modelReady" }, showImage: true, showResults: true }
  }
};

function check(props) {
  for(var i=0;i<=props.length;i++)
  {
    if(i==0 && props[i]==1)
      return <h1>metal</h1>
    else
    if(i==1 && props[i]==1)
      return <h1>cardboard</h1>
    else
    if(i==2 && props[i]==1)
      return <h1>glass</h1>
    else
    if(i==3 && props[i]==1)
      return <h1>Plastic</h1>
    else
    if(i==4 && props[i]==1)
      return <h1>paper</h1>
  };
}

function App() {
  const [results, setResults] = useState([]);
  const [imageURL, setImageURL] = useState(null);
  const [model, setModel] = useState(null);
  const imageRef = useRef();
  const inputRef = useRef();

  const reducer = (state, event) =>
    machine.states[state].on[event] || machine.initial;

  const [appState, dispatch] = useReducer(reducer, machine.initial);
  const next = () => dispatch("next");

  const loadModel = async () => {
    next();
    const model = await tf.loadLayersModel('https://raw.githubusercontent.com/zenio-innovations/ZeW-IT-Hack-CBS/master/models/model/tensorflow.js/model.json');
    setModel(model);
    next();
  };

  const identify = async () => {
    next();
    await tf.tidy(() => {

      // Convert the canvas pixels to a Tensor of the matching shape
      let img = tf.browser.fromPixels(imageRef.current).resizeNearestNeighbor([300, 300]).toFloat().expandDims();
      console.log(imageRef.current)
      //img = img.reshape([1, 300, 300, 3]);
      //img = tf.cast(img, 'float32');

      // Make and format the predications
      const output = model.predict(img);

      // Save predictions on the component
      const predictions = Array.from(output.dataSync()); 
      setResults(predictions);
      console.log(predictions)
    
    });
    //const results = await model.classify(imageRef.current);
    next();
  };

  const reset = async () => {
    setResults([]);
    next();
  };

  const upload = () => inputRef.current.click();

  const handleUpload = event => {
    const { files } = event.target;
    if (files.length > 0) {
      const url = URL.createObjectURL(event.target.files[0]);
      setImageURL(url);
      next();
    }
  };

  const actionButton = {
    initial: { action: loadModel, text: "Load Model" },
    loadingModel: { text: "Loading Model..." },
    modelReady: { action: upload, text: "Upload Image" },
    imageReady: { action: identify, text: "Identify Type of Waste" },
    identifying: { text: "Identifying..." },
    complete: { action: reset, text: "Reset" }
  };

  const { showImage, showResults } = machine.states[appState];

  return (
    <div>
      {showImage && <img src={imageURL} alt="upload-preview" ref={imageRef} />}
      <input
        type="file"
        accept="image/*"
        capture="camera"
        onChange={handleUpload}
        ref={inputRef}
      />
      {showResults && (
        <ul>
          {check(results)}
        </ul>
      )}
      <button onClick={actionButton[appState].action || (() => {})}>
        {actionButton[appState].text}
      </button>
    </div>
  );
}

export default App;
