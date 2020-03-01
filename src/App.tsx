import React from 'react';
import logo from './logo.svg';
import './App.css';
import { FinnHub } from './FinnHub';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <FinnHub />
      </header>
    </div>
  );
}

export default App;
