import logo from './logo.svg';
import './App.css';
import { useEffect, useState } from 'react';

const { clipboard, ipcRenderer } = window.require("electron")

function App() {

  const [clipboardText, setClipboard] = useState('')

  const doStuff = () => {
    console.log("doing stuff")
    setClipboard(clipboard.readText());
    setTimeout(doStuff, 1000);
  }

  useEffect(() => {
    doStuff();
  })

  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          Edit <code>src/App.js</code> and save to reload.

          {clipboardText}
        </p>
      </header>
    </div>
  );
}

export default App;
