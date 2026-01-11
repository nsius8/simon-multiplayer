import { Routes, Route } from 'react-router-dom'
import { GameProvider } from './contexts/GameContext'
import Home from './pages/Home'
import HostLobby from './pages/HostLobby'
import PlayerLobby from './pages/PlayerLobby'
import Game from './pages/Game'

function App() {
  return (
    <GameProvider>
      <div className="min-h-screen bg-gradient-to-br from-purple-600 via-pink-600 to-blue-600">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/host" element={<HostLobby />} />
          <Route path="/join/:code?" element={<PlayerLobby />} />
          <Route path="/game/:gameId" element={<Game />} />
        </Routes>
      </div>
    </GameProvider>
  )
}

export default App
