import './App.css';
import Snippet from './Snippet';
import styled from 'styled-components'
import { useEffect, useState } from 'react';
import { Dexie } from 'dexie';


const { clipboard, ipcRenderer } = window.require("electron")

const db = new Dexie('Snippet');
db.version(1).stores(
  {
    Snippet: "++id,text,pageId",
    Page: "++id,name"
  }
)

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

  let page = {};

  const doStuff = async () => {
    const text = clipboard.readText();
    if (allSnippets.length > 0 && text != allSnippets[allSnippets.length - 1]) {
      setAllSnippets([...allSnippets, text])
      await db.Snippet.add({
        text,
        pageId: page.id
      })
    }
  }

  useEffect(() => {
    ipcRenderer.on('asynchronous-message', async function (evt, message) {
      await doStuff();
    });

  }, [allSnippets])

  useEffect(async () => {
    await db.Page.add({
      name: ""
    });

    page = db.Page.where("name").equals("");
  }, [])

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
