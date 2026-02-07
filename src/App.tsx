import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import Test from './pages/Test'
import Payment from './pages/Payment'
import Result from './pages/Result'
import History from './pages/History'
import Recharge from './pages/Recharge'
import AdminUsers from './pages/AdminUsers'
import Shell from './components/Shell'
import Big5 from './pages/Big5'
import RIASEC from './pages/RIASEC'
import SJT from './pages/SJT'
import VisualTest from './pages/VisualTest'

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
          <Route path="/tests/big5" element={<Big5 />} />
          <Route path="/tests/riasec" element={<RIASEC />} />
          <Route path="/tests/sjt" element={<SJT />} />
          <Route path="/tests/visual" element={<VisualTest />} />
        </Routes>
      </Shell>
    </BrowserRouter>
  )
}

export default App
