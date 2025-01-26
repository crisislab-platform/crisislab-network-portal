import React from 'react'
import Login from './Login'
import ModAccounts from './ModAccounts'
export default function Accounts({loggedIn, setLoggedIn, setCurrUser, host}) {
    if (loggedIn) {
        return <ModAccounts />
    } else {
        return <Login setLoggedIn={setLoggedIn} setCurrUser={setCurrUser}host={host} />
    }
}
