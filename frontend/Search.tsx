import React, { useState } from "react";

export default function Search({ nodes }) {
  const [username, setUsername] = useState<string>("");
  const [devShortName, setDevShortName] = useState<string>("");
  const [devLongName, setDevLongName] = useState<string>("");
  return (
    <div>
      <h3>There are currently {nodes.size} nodes to search</h3>
      <form className="form-div-h">
        <div className="form-section-div-h">
          <label className='form-label' htmlFor='username'>Username: </label>
          <input className="form-input" id="username" type="text" value={username} onChange={(e) => setUsername(e.target.value)} />
        </div>
        <div className="form-section-div-h">
          <label className='form-label' htmlFor='devShortName'>SName: </label>
          <input className="form-input" id="devShortName" type="text" value={devShortName} onChange={(e) => setDevShortName(e.target.value)} />
        </div>
        <div className="form-section-div-h">
          <label className='form-label' htmlFor='devLongName'>LName: </label>
          <input className="form-input" id="devLongName" type="text" value={devLongName} onChange={(e) => setDevLongName(e.target.value)} />
        </div>
        <button className='form-submit-button-search' type='submit'>Submit</button>
      </form>
    </div>
  );
}
