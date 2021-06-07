import logo from './logo.svg';
import './App.css';
import { useEffect, useState } from 'react';

const { clipboard, ipcRenderer } = window.require("electron")

function App() {

  const [allSnippets, setAllSnippets] = useState([clipboard.readText()])

  const doStuff = () => {
    if (allSnippets.length > 0 && clipboard.readText() != allSnippets[allSnippets.length - 1]) {
      setAllSnippets([...allSnippets, clipboard.readText()])
    }
  }

  useEffect(() => {
    ipcRenderer.on('asynchronous-message', function (evt, message) {
      doStuff();
    });

  }, [allSnippets])

  return (
    <div className="App">
      <header className="App-header">
        <p>
          Edit <code>src/App.js</code> and save to reload.

          {allSnippets.map((snip) => {
            return (<div> {snip} </div>)
          })}
        </p>
      </header>
    </div>
  );
}

export default App;
