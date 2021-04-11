import React from 'react';
import Layout from './routes/layout.js';
import { BrowserRouter as Router } from 'react-router-dom'
import './App.css';

function App() {
  return (
    <Router>
      <Layout />
    </Router>
  );
}

export default App;
