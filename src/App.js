import './App.css';
import Snippet from './Snippet';
import RevisionSnippet from './RevisionSnippet';

import styled from 'styled-components'
import { useEffect, useState, useContext, createContext } from 'react';
import { Dexie } from 'dexie';



const { clipboard, ipcRenderer } = window.require("electron")

const db = new Dexie('Snippet');
db.version(1).stores(
  {
    Snippet: "++id,text,pageId,reviseAt",
    Page: "++id,name"
  }
)

export const DatabaseContext = createContext(db);


const Input = styled.input`
color: #000000BF;
font-size: 28px;
padding: 0.75em;
background-color: transparent;
margin-right: auto;
border-bottom: 1px solid #00000038;
border-left: 0px;
border-right: 0px;
border-top: 0px;
width: 100%;
margin-bottom: 3%;
outline: none;
font-weight: 550;
`;

const ActionButton = styled.button`
color: #000000BF;
font-size: 1em;
border: 2px solid #000000BF;
border-radius: 3px;
margin: 0.5em;
padding: 0.5em;
background-color: transparent;
`;

const PageActions = styled.div`
display: flex;
justify-content: flex-end;
flex-direction: row;
width: 100%;
`;

const SnippetList = styled.div`
height: 100vh;
display: flex;
flex-direction: column;
align-items: center;
justify-content: flex-start;
overflow-y: scroll;
width: 100%;
`;

const PageList = styled.div`
height: 100vh;
display: flex;
flex-direction: column;
align-items: center;
justify-content: flex-start;
overflow-y: scroll;
width: 30%;
border-right: 1px solid #00000038;
`;

const PageButton = styled.div`
background: transparent;
background-color: ${props => props.isSelected ? '#f7f5f2' : ''};
padding: 0.5em 1em;
width: 100%;
// border-bottom: 1px solid #000000BF;
`;

const ReviseButton = styled(PageButton)`
  font-weight: bold;
`

const PageListHeader = styled.div`
color: #000000BF;
padding: 0.6em 1em;
width: 100%;
border-bottom: 1px solid #00000038;
font-size: 20px;
font-weight: 600;
`;


function App() {

  const [allSnippets, setAllSnippets] = useState([])
  const [page, setPage] = useState(null)
  const [pageInput, setPageInput] = useState("")
  const [allPages, setAllPages] = useState([])

  const addSnippet = async () => {
    const newSnippetText = clipboard.readText();
    if (allSnippets.length == 0 || (allSnippets.length > 0 && newSnippetText != allSnippets[allSnippets.length - 1].text)) {
      let newSnippet = {
        text: newSnippetText,
        pageId: page.id,
        reviseAt: Date.now()
      }
      var snippetId = await db.Snippet.add(newSnippet)
      newSnippet.id = snippetId;
      setAllSnippets([...allSnippets, newSnippet])
    }
  };

  useEffect(() => {
    ipcRenderer.on('asynchronous-message', async () => { if (page) await addSnippet(); });

    return () => {
      ipcRenderer.removeAllListeners();
    };
  }, [allSnippets]);

  useEffect(() => {
    async function fetchSnippets() {
      if (page?.id) {
        const pageSnippets = await db.Snippet.where("pageId").anyOf([page.id]).toArray();
        setAllSnippets(pageSnippets)
      }
    }

    fetchSnippets()
    setPageInput(page?.name)

  }, [page]);


  useEffect(() => {
    async function fetchData() {
      setAllPages(await db.Page.toArray())
      await revise();
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
    let p = allPages.find(p => p.id == page.id);
    p.name = event.target.value;
    setPageInput(event.target.value);
    await db.Page.update(page.id, { name: event.target.value });
  }

  const deleteCallback = async (snip) => {
    await db.Snippet.delete(snip.id);
    setAllSnippets(allSnippets.filter(s => s.id != snip.id));
  }

  const tickCallback = async (snippet) => {
    const filteredSnippets = allSnippets.filter(s => s.id != snippet.id);
    setAllSnippets(filteredSnippets);
  }

  const crossCallback = async (snippet) => {
    const filteredSnippets = allSnippets.filter(s => s.id != snippet.id);
    setAllSnippets(filteredSnippets);
  }


  const revise = async (event) => {
    setPage(null);
    const revisionSnippets = await db.Snippet.orderBy("reviseAt").toArray();
    setAllSnippets(revisionSnippets)
  }

  return (
    <DatabaseContext.Provider value={db}>
      <div className="App">
        <div className="App-body">
          <PageList>
            <PageListHeader>All Pages</PageListHeader>
            <ReviseButton onClick={revise} key="revise" isSelected={page == null}>Revise</ReviseButton>
            {allPages.map((p) => {
              const selected = (p && page && page.id == p.id);
              console.log(p)
              return <PageButton onClick={selectPage} key={p.id} isSelected={selected}>{p.name}</PageButton>
            })}
          </PageList>

          {!page &&
            <SnippetList>
              <Input type="text" value={"Revise"} ></Input>

              {allSnippets?.map((snip, snipIdx) => {
                if (snip.reviseAt < Date.now()) {
                  return <RevisionSnippet snippetProp={snip} key={snip.id} tickCallback={tickCallback} crossCallback={crossCallback} ></RevisionSnippet>
                }
                // else {
                //   return <Snippet snippetProp={snip} key={snipIdx} deleteCallback={deleteCallback} ></Snippet>
                // }
              })}

            </SnippetList>
          }

          {page && <SnippetList>
            <PageActions>
              <ActionButton onClick={onNewPage}> New </ActionButton>
            </PageActions>

            {page.id && <Input type="text" value={pageInput} onChange={onPageInputChange}></Input>}

            {allSnippets?.map((snip, snipIdx) => {
              return <Snippet snippetProp={snip} key={snipIdx} deleteCallback={deleteCallback} ></Snippet>
            })}

            <footer className="App-footer">
            </footer>
          </SnippetList>}
        </div>
      </div>
    </DatabaseContext.Provider>
  );
}

export default App;
