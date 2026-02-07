import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import Test from './pages/Test'
import Payment from './pages/Payment'
import Result from './pages/Result'
import History from './pages/History'
import Recharge from './pages/Recharge'
import AdminUsers from './pages/AdminUsers'
import Shell from './components/Shell'

function App() {
  return (
    <BrowserRouter>
      <Shell>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/test" element={<Test />} />
          <Route path="/payment" element={<Payment />} />
          <Route path="/result" element={<Result />} />
          <Route path="/history" element={<History />} />
          <Route path="/recharge" element={<Recharge />} />
          <Route path="/admin" element={<AdminUsers />} />
        </Routes>
      </Shell>
    </BrowserRouter>
  )
}

export default App
