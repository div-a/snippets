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

const SnippetList = styled.div`
backgroud-color: #282c34;
height: 80vh;
display: flex;
flex-direction: column;
align-items: center;
justify-content: flex-start;
overflow-y: scroll;
`;

const PageList = styled.div`
backgroud-color: #282c34;
height: 80vh;
display: flex;
flex-direction: column;
align-items: center;
justify-content: flex-start;
overflow-y: scroll;
min-width: 20%;
`;

const PageButton = styled.button`
background: transparent;
border-radius: 3px;
border: 2px solid palevioletred;
color: palevioletred;
margin: 0 1em;
padding: 0.25em 1em;
margin: 0.25em;
`;

function App() {


  const [allSnippets, setAllSnippets] = useState([])
  const [page, setPage] = useState({ name: "" })
  const [allPages, setAllPages] = useState([])


  const addSnippet = async () => {
    const newSnippet = clipboard.readText();
    if (allSnippets.length == 0 || (allSnippets.length > 0 && newSnippet != allSnippets[allSnippets.length - 1])) {
      setAllSnippets([...allSnippets, newSnippet])
      await db.Snippet.add({
        text: newSnippet,
        pageId: page.id
      })
    }
  };

  useEffect(() => {
    ipcRenderer.on('asynchronous-message', async () => { await addSnippet(); });

    return () => {
      ipcRenderer.removeAllListeners();
    };
  }, [allSnippets]);

  useEffect(() => {
    async function fetchData() {
      if (page.id) {
        const pageSnippets = await db.Snippet.where("pageId").anyOf([page.id]).toArray();
        setAllSnippets(pageSnippets.map(ps => ps.text))
      }
    }


  }, [page]);


  useEffect(() => {
    async function fetchData() {
      const newPageName = new Date().toISOString().substring(0, 19);
      const res = await db.Page.add({
        name: newPageName
      });
      setPage(await db.Page.where({ id: res }).first());
      setAllPages(await db.Page.toArray())
    }

    fetchData();
  }, [])

  const selectPage = async (event) => {
    const selectedPage = allPages.filter(ap => ap.name === event.target.innerText)[0];
    setPage(selectedPage)
  }

  return (
    <div className="App">
      <header className="App-header">
        <Input value={page.name} ></Input>
      </header>
      <body className="App-body">
        <PageList>
          {allPages.map((page) => {
            return <PageButton onClick={selectPage}>{page.name}</PageButton>
          })}
        </PageList>

        <SnippetList>
          {allSnippets?.map((snip) => {
            return <Snippet text={snip} ></Snippet>
          })}
        </SnippetList>
      </body>
      <footer className="App-footer">
        <SaveButton> Save </SaveButton>
      </footer>
    </div>
  );
}

export default App;
