import React from 'react'
import Login from './Login'
import ModAccounts from './ModAccounts'
export default function Accounts({loggedIn, setLoggedIn}) {
    if (loggedIn) {
        return <ModAccounts />
    } else {
        return <Login setLoggedIn={setLoggedIn}/>
    }
}
