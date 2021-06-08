import './App.css';
import Snippet from './Snippet';
import styled from 'styled-components'
import { useEffect, useState, useCallback } from 'react';
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
  const [page, setPage] = useState({})

  const doStuff = () => {
    const text = clipboard.readText();
    if (allSnippets.length > 0 && text != allSnippets[allSnippets.length - 1]) {
      setAllSnippets([...allSnippets, text])
      db.Snippet.add({
        text,
        pageId: page.id
      })
    }
  };

  useEffect(() => {
    ipcRenderer.on('asynchronous-message', () => { doStuff(); });

    return () => {
      ipcRenderer.removeAllListeners();
    };
  }, [allSnippets]);

  useEffect(async () => {
    const newPageName = new Date().toISOString().substring(0, 19);
    await db.Page.add({
      name: newPageName
    });

    setPage(await db.Page.where("name").equalsIgnoreCase(newPageName).first());

  }, [])

  return (
    <div className="App">
      <header className="App-header">
        <Input value={page.name} ></Input>
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
