import './App.css';
import Snippet from './Snippet';
import styled from 'styled-components'
import { useEffect, useState } from 'react';

const { clipboard, ipcRenderer } = window.require("electron")

function App() {

  const Input = styled.input`
    color: palevioletred;
    font-size: 1em;
    border: 2px solid palevioletred;
    border-radius: 3px;
    margin: 0.5em;
    padding: 0.5em;
    background-color: transparent;
  `;

  const SaveButton = styled.button`
    color: palevioletred;
    font-size: 1em;
    border: 2px solid palevioletred;
    border-radius: 3px;
    margin: 0.5em;
    padding: 0.5em;
    background-color: transparent;
  `;

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
        <Input></Input>
      </header>
      <body className="App-body">
        {allSnippets.map((snip) => {
          return <Snippet text={snip} ></Snippet>
        })}
      </body>
      <footer className="App-footer">
        <SaveButton> Save </SaveButton>
      </footer>
    </div>
  );
}

export default App;
