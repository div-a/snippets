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
    color: ${props => props.color};;
    &:hover {
      color: #000000BF;
    }
  `

const SnippetHeader = styled.div`
    display: flex;
    flex-direction: row;
    justify-content: flex-end;
    margin-bottom; 5%;
  `

const Score = styled.div`
  color: #00000038;
`

const StyledFontAwesomeIcon = styled(FontAwesomeIcon)`
  color: #00000038;
  padding-left: 10px;
  &:hover {
    color: #000000BF;
  }
`


const QuestionInput = styled.textarea`
  color: #000000BF;
  font-size: 14px;
  padding-top: 0.75em;
  background-color: transparent;
  margin-right: auto;
  border-bottom: 1px solid #00000038;
  border-left: 0px;
  border-right: 0px;
  border-top: 0px;
  width: 100%;
  margin-bottom: 1%;
  outline: none;
  font-weight: 550;
  width: ${props => props.width};
  height: ${props => props.height};
  resize: none;
`;

export default function RevisionSnippet({ snippetProp, tickCallback, crossCallback }) {

  const db = useContext(DatabaseContext);
  const [snippet, setSnippet] = useState(snippetProp);
  const WIDTH = '70ch';
  const [height, setHeight] = useState('0px');
  const textarea_ref = useRef(null);

  const [questionHeight, setQuestionHeight] = useState('0px');
  const question_ref = useRef(null);


  useLayoutEffect(() => {
    textarea_ref.current.style.height = '0px';
    const scrollHeight = textarea_ref.current.scrollHeight;
    textarea_ref.current.removeAttribute('style');
    setHeight(scrollHeight + 2 + 'px');


    question_ref.current.style.height = '0px';
    const questionScrollHeight = question_ref.current.scrollHeight;
    question_ref.current.removeAttribute('style');
    setQuestionHeight(questionScrollHeight + 2 + 'px');
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

  const scoreToMinutes = {
    0: 1,
    1: 5,
    2: 15,
    3: 60,
    4: 60 * 12,
    5: 60 * 24,
    6: 60 * 24 * 2,
    7: 60 * 24 * 7,
  }

  const tickSnippet = async () => {
    const newScore = snippet.score < 7 ? snippet.score + 1 : snippet.score;
    var revisionTime = new Date().getTime() + (scoreToMinutes[newScore] * 60000);
    await db.Snippet.update(snippet.id, { score: newScore, reviseAt: revisionTime });
    tickCallback(snippet);
  }

  const crossSnippet = async () => {
    const newScore = 0;
    var revisionTime = new Date().getTime() + (scoreToMinutes[newScore] * 60000);
    await db.Snippet.update(snippet.id, { score: newScore, reviseAt: revisionTime });
    crossCallback(snippet);
  }

  const onSnippetQuestionChange = async (event) => {
    let { ...newSnippet } = snippet;
    newSnippet.question = event.target.value
    setSnippet(newSnippet)
    await db.Snippet.update(snippet.id, { question: event.target.value });
  }

  return (
    <div>
      <Container>
        <SnippetHeader>

          <QuestionInput type="text" value={snippet.question} onChange={onSnippetQuestionChange} width={WIDTH} height={questionHeight} ref={question_ref} />

          <Score>
            {new Date(snippet.reviseAt).toISOString()}
          </Score>
          <StyledFontAwesomeIcon icon={faCheck} onClick={tickSnippet} />
          <StyledFontAwesomeIcon icon={faTimes} onClick={crossSnippet} />
        </SnippetHeader>

        <SnippetText value={snippet.text} onChange={setText} width={WIDTH} height={height} ref={textarea_ref} color={snippet.question ? 'white' : 'black'}>
        </SnippetText>
      </Container>
    </div>
  );
}
