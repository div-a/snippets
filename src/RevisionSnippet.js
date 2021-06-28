import styled from 'styled-components'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faTrash, faCheck, faTimes } from '@fortawesome/free-solid-svg-icons'
import { useEffect, useState, useRef, useLayoutEffect, useContext } from 'react';
import { DatabaseContext } from './App';

const Container = styled.div`
    background: transparent;
    border-radius: 3px;
    border: 1px solid #00000038;
    margin: 0 1em;
    padding: 0.5em 2em;
    margin: 0.25em 2em;
  `

const SnippetText = styled.textarea`
    background: transparent;
    border-radius: 3px;
    border: none;
    outline: none;  
    width: ${props => props.width};
    height: ${props => props.height};
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif;
    color: #000000BF;
  `

const SnippetHeader = styled.div`
    display: flex;
    flex-direction: row;
    justify-content: flex-end;
    margin-bottom; 5%;
  `

export default function RevisionSnippet({ snippetProp, tickCallback, crossCallback }) {

  const db = useContext(DatabaseContext);
  const [snippet, setSnippet] = useState(snippetProp);
  const WIDTH = '70ch';
  const [height, setHeight] = useState('0px');
  const textarea_ref = useRef(null);

  useLayoutEffect(() => {
    textarea_ref.current.style.height = '0px';
    const scrollHeight = textarea_ref.current.scrollHeight;
    textarea_ref.current.removeAttribute('style');
    setHeight(scrollHeight + 2 + 'px');
  }, [snippet]);


  useEffect(() => {
    setSnippet(snippetProp);
  }, []);

  const setText = async (event) => {
    let { text, ...newSnippet } = snippet;
    newSnippet.text = event.target.value;
    setSnippet(newSnippet);
    await db.Snippet.update(snippet.id, { text: newSnippet.text });
  }

  const tickSnippet = async () => {
    var revisionTime = new Date(snippet.reviseAt);
    revisionTime.setDate(revisionTime.getDate() + 7);
    await db.Snippet.update(snippet.id, { reviseAt: revisionTime.getTime() });
    tickCallback(snippet);
  }

  const crossSnippet = async () => {
    var revisionTime = new Date(snippet.reviseAt);
    // revisionTime.setMinutes(revisionTime.getMinutes() + 1);
    revisionTime.setDate(revisionTime.getDate() + 1);

    console.log(revisionTime)
    await db.Snippet.update(snippet.id, { reviseAt: revisionTime.getTime() });
    crossCallback(snippet);
  }

  return (
    <div>
      <Container>
        <SnippetHeader>
          <FontAwesomeIcon style={{ "color": '#000000BF', "paddingLeft": '10px' }} icon={faCheck} onClick={tickSnippet} />
          <FontAwesomeIcon style={{ "color": '#000000BF', "paddingLeft": '10px' }} icon={faTimes} onClick={crossSnippet} />
        </SnippetHeader>

        <SnippetText value={snippet.text} onChange={setText} width={WIDTH} height={height} ref={textarea_ref}>
        </SnippetText>
      </Container>
    </div>
  );
}
