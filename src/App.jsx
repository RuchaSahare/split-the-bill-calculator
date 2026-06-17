import React from 'react';
import Calculator from './components/Calculator';

const App = () => {
  return (
    <div className="App" style={{ padding: "20px" }}>

      <Calculator />

      {/* REQUIRED FOOTER */}
      <footer style={{ marginTop: "40px", textAlign: "center" }}>

        <p><strong>Built by:</strong> Rucha Sahare</p>
        <p><strong>Email:</strong> ruchasahare852@gmail.com</p>

        
        <a
          href="https://digitalheroesco.com"
          target="_blank"
          rel="noreferrer"
        >
            <button style={{
              marginTop: "15px",
              padding: "10px 18px",
              backgroundColor: "#4f46e5",
              color: "#fff",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
              fontWeight: "600"
            }}>
            Built for Digital Heroes
          </button>
        </a>

      </footer>

    </div>
  );
};

export default App;