import styled from 'styled-components'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faTrash } from '@fortawesome/free-solid-svg-icons'
import { faPen } from '@fortawesome/free-solid-svg-icons'
import { useEffect, useState, useRef, useLayoutEffect } from 'react';


export default function Snippet({ text }) {

  const [snippetText, setSnippetText] = useState(text);
  const WIDTH = '70ch';
  const [height, setHeight] = useState('0px');
  const textarea_ref = useRef(null);

  const Container = styled.div`
    background: transparent;
    border-radius: 3px;
    border: 1px solid palevioletred;
    color: palevioletred;
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
    color: palevioletred;
  `

  useLayoutEffect(() => {                                           // useLayoutEffect TO AVOID FLICKERING
    textarea_ref.current.style.height = '0px';                    // NEEDS TO SET HEIGHT TO ZERO
    const scrollHeight = textarea_ref.current.scrollHeight;       // TO READ THE CORRECT SCROLL HEIGHT WHEN IT SHRINKS
    textarea_ref.current.removeAttribute('style');                // REMOVE INLINE STYLE THAT WAS ADDED WITH 0px
    setHeight(scrollHeight + 2 + 'px');                             // NEEDS TO ADD 2. I THINK IT'S BECAUSE OF THE BORDER
    console.log(scrollHeight)
  }, [snippetText]);


  useEffect(() => {
    setSnippetText(text);
  }, []);

  useEffect(() => {
    textarea_ref.current.style.height = '0px';                    // NEEDS TO SET HEIGHT TO ZERO
    const scrollHeight = textarea_ref.current.scrollHeight;       // TO READ THE CORRECT SCROLL HEIGHT WHEN IT SHRINKS
    textarea_ref.current.removeAttribute('style');                // REMOVE INLINE STYLE THAT WAS ADDED WITH 0px
    setHeight(scrollHeight + 2 + 'px');
  }, [textarea_ref.current]);

  const setText = (event) => {
    setSnippetText(event.target.value);
    // setHeight(1 + Math.ceil(event.target.value.length / (WIDTH / 2)) + 'ch')
  }

  return (
    <div>
      <Container>
        {/* <div style={{ "display": "flex", "flex-direction": "row", "justify-content": "flex-end" }}>
          <FontAwesomeIcon style={{ "color": 'palevioletred' }} icon={faPen} />
          <FontAwesomeIcon style={{ "color": 'palevioletred' }} icon={faTrash} />
        </div> */}

        <SnippetText value={snippetText} onChange={setText} width={WIDTH} height={height} ref={textarea_ref}>
        </SnippetText>
      </Container>
    </div>
  );
}
