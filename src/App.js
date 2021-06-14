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
font-size: 20px;
padding: 1em;
background-color: transparent;
margin-right: auto;
border: none;
`;

const ActionButton = styled.button`
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
height: 90vh;
display: flex;
flex-direction: column;
align-items: center;
justify-content: flex-start;
overflow-y: scroll;
width: 100%;
`;

const PageList = styled.div`
backgroud-color: #282c34;
height: 100vh;
display: flex;
flex-direction: column;
align-items: center;
justify-content: flex-start;
overflow-y: scroll;
width: 30%;
border-right: 1px solid palevioletred;
`;

const PageButton = styled.div`
background: transparent;
color: palevioletred;
padding: 0.5em 1em;
width: 100%;
border-bottom: 1px solid palevioletred;
`;

const PageListHeader = styled.div`
color: palevioletred;
padding: 0.6em 1em;
width: 100%;
border-bottom: 1px solid palevioletred;
font-size: 20px;
`;


function App() {


  const [allSnippets, setAllSnippets] = useState([])
  const [page, setPage] = useState({ name: "" })
  const [pageInput, setPageInput] = useState("")

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
    async function fetchSnippets() {
      if (page?.id) {
        const pageSnippets = await db.Snippet.where("pageId").anyOf([page.id]).toArray();
        setAllSnippets(pageSnippets.map(ps => ps.text))
      }
    }

    fetchSnippets()
    setPageInput(page?.name)

  }, [page]);


  useEffect(() => {
    async function fetchData() {
      setAllPages(await db.Page.toArray())
    }

    fetchData();
  }, [])

  const selectPage = async (event) => {
    const selectedPage = allPages.filter(ap => ap.name === event.target.innerText)[0];
    setPage(selectedPage)
  }

  const onNewPage = async (event) => {
    const newPageName = new Date().toISOString().substring(0, 19);
    const res = await db.Page.add({
      name: newPageName
    });
    setPage(await db.Page.where({ id: res }).first());
    setAllPages(await db.Page.toArray())
  }

  const onPageInputChange = async (event) => {
    setPageInput(event.target.value);
    await db.Page.update(page.id, { name: pageInput });
  }


  return (
    <div className="App">
      <div className="App-body">
        <PageList>
          <PageListHeader>All Pages</PageListHeader>
          {allPages.map((page) => {
            return <PageButton onClick={selectPage} key={page.id}>{page.name}</PageButton>
          })}
        </PageList>

        <SnippetList>

          {page.id && <Input type="text" value={pageInput} onChange={onPageInputChange} ></Input>}

          {allSnippets?.map((snip, snipIdx) => {
            return <Snippet text={snip} key={snipIdx} ></Snippet>
          })}

          <footer className="App-footer">
            <ActionButton onClick={onNewPage}> New </ActionButton>
          </footer>
        </SnippetList>
      </div>

    </div>
  );
}

export default App;
