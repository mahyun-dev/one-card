import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/layout/Header';
import Toast from './components/layout/Toast';
import Home from './pages/Home';
import WaitingRoom from './components/lobby/WaitingRoom';
import GameBoard from './components/game/GameBoard';
import AIGameBoard from './components/game/AIGameBoard';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-900 text-white">
        <Header />
        <main className="pt-20">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/lobby/:roomCode" element={<WaitingRoom />} />
            <Route path="/game/:roomCode" element={<GameBoard />} />
            <Route path="/ai-game" element={<AIGameBoard />} />
          </Routes>
        </main>
        <Toast />
      </div>
    </Router>
  );
}

export default App;
