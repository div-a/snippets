import styled from 'styled-components'

export default function Snippet({ text }) {

  const Container = styled.div`
    background: transparent;
    border-radius: 3px;
    border: 1px solid palevioletred;
    color: palevioletred;
    margin: 0 1em;
    padding: 0.5em 2em;
    margin: 0.25em 2em;
    
  `

  return (
    <Container>{text}</Container>
  );
}
