import React from 'react'
import Login from './Login'
import ModAccounts from './ModAccounts'
export default function Accounts({loggedIn, setLoggedIn, currUser, setCurrUser, host, logout}) {
    if (loggedIn) {
        return <ModAccounts host={host} currUser={currUser} setCurrUser={setCurrUser} setLoggedIn={setLoggedIn} logout={logout}/>
    } else {
        return <Login setLoggedIn={setLoggedIn} setCurrUser={setCurrUser}host={host} currUser={currUser} />
    }
}
