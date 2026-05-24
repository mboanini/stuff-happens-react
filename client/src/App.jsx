import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';

import AuthContext from './context/AuthContext';
import { useEffect, useState } from 'react';
import { Routes, Route, Outlet } from 'react-router-dom';
import './App.css'

import GameComponent from './components/GameComponent';
import HistoryComponent from './components/HistoryComponent'
import HomeComponent from './components/HomeComponent';
import LayoutComponent from './components/LayoutComponent';
import LoginForm from './components/LoginForm';
import NotFoudComponent from './components/NotFoundComponent';

function App() {
  
  const [user, setUser] = useState(null);
  const [game, setGame] = useState(null);

  /*const isLoggedIn = async () => {
      setUser(await API.isLoggedIn());
  }

  useEffect(() => {
      isLoggedIn();
  }, []);*/
  
  return (
    <AuthContext.Provider value={{user: user, setUser: setUser}}>
            <Routes>
                <Route path="/" element={<LayoutComponent/>}>
                    <Route index element={<HomeComponent/>}/>
                    <Route path="/login" element={<LoginForm/>}/>        
                    <Route path="/history" element={<HistoryComponent/>} />
                    <Route path="/*" element={<NotFoudComponent/>}/>
                </Route>
                <Route>
                    <Route path="/game/demo" element={<GameComponent />} /> 
                    <Route path="/game/:gameId" element={<GameComponent/>}/>

                </Route>
            </Routes>
    </AuthContext.Provider>
  )
}

export default App
