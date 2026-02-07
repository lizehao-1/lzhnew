import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { lazy, Suspense } from 'react'
import Shell from './components/Shell'

// 懒加载页面组件
const Home = lazy(() => import('./pages/Home'))
const Test = lazy(() => import('./pages/Test'))
const Payment = lazy(() => import('./pages/Payment'))
const Result = lazy(() => import('./pages/Result'))
const History = lazy(() => import('./pages/History'))
const Recharge = lazy(() => import('./pages/Recharge'))

// 加载中占位
function PageLoader() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-200 border-t-slate-800" />
    </div>
  )
}

function App() {
  return (
    <BrowserRouter>
      <Shell>
        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/test" element={<Test />} />
            <Route path="/payment" element={<Payment />} />
            <Route path="/result" element={<Result />} />
            <Route path="/history" element={<History />} />
            <Route path="/recharge" element={<Recharge />} />
          </Routes>
        </Suspense>
      </Shell>
    </BrowserRouter>
  )
}

export default App
