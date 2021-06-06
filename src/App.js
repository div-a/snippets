import logo from './logo.svg';
import './App.css';
import { useEffect } from 'react';

const { clipboard } = window.require("electron")

function App() {

  useEffect(() => {
    console.log(clipboard.readText())
  }, [])

  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          Edit <code>src/App.js</code> and save to reload. cHI

          {clipboard.readText()}
        </p>
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </a>
      </header>
    </div>
  );
}

export default App;
