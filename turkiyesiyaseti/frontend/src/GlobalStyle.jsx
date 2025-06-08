// src/GlobalStyle.js
import { createGlobalStyle } from 'styled-components';

const GlobalStyle = createGlobalStyle`
  /* Ubuntu font import */
  @import url('https://fonts.googleapis.com/css2?family=Ubuntu:wght@300;400;500;700&display=swap');
  
  * {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }
  
  html, body, #root {
    width: 100%;
    height: 100%;
    font-family: 'Ubuntu', sans-serif;
  }
  
  body {
    background-color: #121212;
    color: white;
    font-family: 'Ubuntu', sans-serif;
    line-height: 1.5;
    overflow: hidden;
  }
  
  button, input, select, textarea {
    font-family: 'Ubuntu', sans-serif;
  }
  
  h1, h2, h3, h4, h5, h6 {
    font-family: 'Ubuntu', sans-serif;
    font-weight: 500;
  }
`;

export default GlobalStyle;
