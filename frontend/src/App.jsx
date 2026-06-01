import { HashRouter, Routes, Route } from 'react-router-dom'
import Header from './components/Header'
import Home from './pages/Home'
import CreateBet from './pages/CreateBet'
import BetDetail from './pages/BetDetail'
import JoinBet from './pages/JoinBet'

export default function App() {
  return (
    <HashRouter>
      <Header />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/create" element={<CreateBet />} />
        <Route path="/bet/:id" element={<BetDetail />} />
        <Route path="/join/:id" element={<JoinBet />} />
      </Routes>
    </HashRouter>
  )
}
