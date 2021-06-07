import styled from 'styled-components'

export default function Snippet({ text }) {

  const Container = styled.div`
    background: transparent;
    border-radius: 3px;
    border: 2px solid palevioletred;
    color: palevioletred;
    margin: 0 1em;
    padding: 0.25em 1em;
    margin: 0.25em;
  `

  return (
    <Container>{text}</Container>
  );
}
