import React from 'react'
import Hamburger from './Hamburger'

export default function Nav({room, setRoom, sendRoomNum, username, setUsername}) {
    const [hamburgerOpen, setHamburgerOpen] = React.useState(false);

    const toggleHamburger = () => {
        setHamburgerOpen(!hamburgerOpen);
    }

    return (
    <><div>
          <div className='parameters'>
              <ul>
                  <li>Username: <input type="text" value={username} onChange={(e) => setUsername(e.target.value)}/></li>
                  <li>Room: <input type="text" value={room} onChange={(e) => setRoom(e.target.value)}/></li>
                  <li><button onClick={sendRoomNum}>🚪</button></li>
              </ul>
                    <div className='hamburger' onClick={toggleHamburger}>
                        <Hamburger isOpen={hamburgerOpen} />
                    </div>
              
          </div>
      </div>

      <style jsx>{`
        .parameters {
            width: 270px;
            height: 100%;
            background-color: #282828;
            color: #ebdbb2;
            border-style: solid;
            border-width: 4px;
            border-color: #458588;
        }

        .parameters ul {
            display: flex;
            flex-wrap: wrap;
            float: right;
            margin: 0px;
            padding: 0px;
            overflow: hidden;            
        }        

        .parameters ul li {
            list-style-type: none;
            padding-right: 10px;
        }

        .hamburger {
                display: none;
                z-index: 6;
        }

        @media (max-width: 800px) {
            .hamburger {
                width: 2rem;
                height: 2rem;
                display: flex;
                justify-content: space-around;
                flex-flow: column nowrap;
                z-index: 6;
            }

            .parameters {
                width: 2rem;
                height: 100%;
                background-color: #282828;
                color: #ebdbb2;
            }

            .parameters ul{
                    display: ${hamburgerOpen ? 'inline' : 'none'};
                    background-color: #282828;
                    color: #ebdbb2;
                    height: 100vh;
                    width: 270px;
                    margin-top: 50px;
                    position: fixed;
            }

        }
      
      `}</style>    
      </>
  )
}
