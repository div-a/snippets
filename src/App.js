import './App.css';
import Snippet from './Snippet';
import RevisionSnippet from './RevisionSnippet';

import styled from 'styled-components'
import { useEffect, useState, useContext, createContext } from 'react';
import { Dexie } from 'dexie';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

import { faPlus, faTimes } from '@fortawesome/free-solid-svg-icons'
// import "dexie-export-import";
import { importDB, exportDB, importInto, peakImportFile } from "dexie-export-import";
import backup from './backup.json';


const { clipboard, ipcRenderer } = window.require("electron")

const db = new Dexie('Snippet');
db.version(1).stores(
  {
    Snippet: "++id,text,pageId,reviseAt,score,question",
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
border: 1px solid #00000038;
border-radius: 3px;
margin: 0.5em;
padding: 0.5em;
background-color: transparent;
&:hover {
  color: black;
  font-weight: 500;
  background-color: #f7f5f2;
}
`;

const PageActions = styled.div`
display: flex;
justify-content: flex-end;
flex-direction: row;
width: 100%;
align-items: center;
padding-right:10px;
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
color: #2D3748;
&:hover {
  color: black;
  font-weight: 500;
}
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

const AddSnippetButton = styled.button`
background: transparent;
width: 100%;
border:none;
color: #00000038;
padding-bottom: 20px;
&:hover {
  color: black;
  font-weight: 500;
}
`;

const StyledFontAwesomeIcon = styled(FontAwesomeIcon)`
  color: transparent;
  &:hover {
    color: #00000038;
  }
`

function App() {

  const [allSnippets, setAllSnippets] = useState([])
  const [page, setPage] = useState(null)
  const [pageInput, setPageInput] = useState("")
  const [allPages, setAllPages] = useState([])

  const addSnippet = async (newSnippetText) => {
    if (newSnippetText == "" || allSnippets.length == 0 || (allSnippets.length > 0 && newSnippetText != allSnippets[allSnippets.length - 1].text)) {
      let newSnippet = {
        text: newSnippetText,
        pageId: page.id,
        reviseAt: Date.now(),
        score: 100
      }
      var snippetId = await db.Snippet.add(newSnippet)
      newSnippet.id = snippetId;
      setAllSnippets([...allSnippets, newSnippet])
    }
  };

  useEffect(() => {
    ipcRenderer.on('asynchronous-message', async () => {
      const newSnippetText = clipboard.readText();

      if (page) {
        await addSnippet(newSnippetText);
      }
      else {
        await onNewPage(null);
      }
    });

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
    const newPageName = new Date().toISOString().substring(0, 10);
    const res = await db.Page.add({
      name: newPageName
    });
    setPage(await db.Page.where({ id: res }).first());
    setAllPages(await db.Page.toArray())
  }

  function basicImport(data, db) {
    return Promise.all(data.map(t =>
      db.table(t.tableName).clear()
        .then(() => db.table(t.tableName).bulkAdd(t.rows))));
  }

  const onImport = async (event) => {
    await basicImport(backup.data.data, db)
  }

  function download(content, fileName, contentType) {
    var a = document.createElement("a");
    a.href = URL.createObjectURL(content);
    a.download = fileName;
    a.click();
  }

  const onExport = async (event) => {
    const blob = await exportDB(db);
    download(blob, 'backup.json', 'text/plain');
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
    const revisionSnippets = await db.Snippet.orderBy("score").toArray();
    setAllSnippets(revisionSnippets)
  }

  const deletePage = async (page) => {
    await db.Page.delete(page.id);
    await db.Snippet.where("pageId").anyOf([page.id]).delete();
    setAllPages(allPages.filter(p => p.id != page.id));
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
              return <PageActions>
                <PageButton onClick={selectPage} key={p.id} isSelected={selected}>{p.name}</PageButton>
                <StyledFontAwesomeIcon icon={faTimes} onClick={() => deletePage(p)} />

              </PageActions>
            })}
          </PageList>

          {!page &&
            <SnippetList>
              <PageActions>
                <ActionButton onClick={onImport}> Import </ActionButton>
                <ActionButton onClick={onExport}> Export </ActionButton>
              </PageActions>
              <Input type="text" value={"Revise"} ></Input>


              {allSnippets?.map((snip, snipIdx) => {
                return <RevisionSnippet snippetProp={snip} key={snip.question + snip.text} tickCallback={tickCallback} crossCallback={crossCallback} ></RevisionSnippet>
              })}

            </SnippetList>
          }

          {page && <SnippetList>
            <PageActions>
              <ActionButton onClick={onImport}> Import </ActionButton>
              <ActionButton onClick={onExport}> Export </ActionButton>
              <ActionButton onClick={onNewPage}> New </ActionButton>
            </PageActions>

            {page.id && <Input type="text" value={pageInput} onChange={onPageInputChange}></Input>}

            {allSnippets?.map((snip, snipIdx) => {
              return <div>
                <Snippet snippetProp={snip} key={snip.question + snip.text} deleteCallback={deleteCallback} ></Snippet>
              </div>
            })}
            <AddSnippetButton>
              <FontAwesomeIcon icon={faPlus} onClick={() => addSnippet("")} />
            </AddSnippetButton>

            <footer className="App-footer">
            </footer>
          </SnippetList>}
        </div>
      </div>
    </DatabaseContext.Provider>
  );
}

export default App;
