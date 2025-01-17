import React from 'react'
import { useNavigate } from 'react-router-dom';


export default function Header() {
  const navigate = useNavigate();
  const goToTable = () => { navigate('/table')};
  const goToMap = () => { navigate('/map')}
  return (
    <div>
      <button onClick={goToTable}>Table</button>
      <button onClick={goToMap}>Map</button>
    </div>
  )
}
