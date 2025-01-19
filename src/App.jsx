import { useState } from 'react';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import InputGroup from 'react-bootstrap/InputGroup';
import './App.css'
function App() {
  const [accountId, setAccountId] = useState("");
  const [playerData, setPlayerData] = useState([]);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleButtonClick = async () => {
    if (!accountId.trim()) {
      setError("Por favor ingrese un ID de cuenta");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("http://localhost:4000/api/run-script", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ accountId }),
      });

      if (!response.ok) {
        throw new Error(`Error en la solicitud: ${response.status}`);
      }

      const data = await response.json();
      setPlayerData(data.data);
      console.log(process.env.PWD);
       
    } catch (error) {
      setError(`Error: ${error.message}`);
    } finally {
      setIsLoading(false);
      const div = document.getElementById("tabla");
      fetch("../output_table.html")
        .then(response => response.text())
        .then(tableContent => {
          div.innerHTML = tableContent;
        })
        .catch(error => console.error('Error al cargar el archivo HTML:', error));
      
    }

  };
  return (
    <div className="contenedor">
  <div className="contenido">
    <h1>Fetch Dota Player Info</h1>

    {/* Input Group */}
    <div className="input-group">
      <input
        type="text"
        placeholder="Enter Account ID"
        value={accountId}
        onChange={(e) => setAccountId(e.target.value)}
      />
      <button id="button-addon2" onClick={handleButtonClick}>
        Fetch Data
      </button>
    </div>

    {/* Mostrar los datos obtenidos */}
    <div id="tabla" className="tabla">
      {/* Aquí se muestran los datos de la tabla */}
    </div>
  </div>
</div>
  )
}

export default App;
