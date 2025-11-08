import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Home from './app/page';
import './app/globals.css';

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-background text-foreground">
        <Header />
        <main>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/projects" element={<ProjectsPage />} />
            <Route path="/order" element={<OrderPage />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

// Временные компоненты страниц (будут созданы позже)
function ProjectsPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold">Проекты</h1>
      <p className="mt-4 text-gray-600 dark:text-gray-400">Страница проектов</p>
    </div>
  );
}

function OrderPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold">Заказать проект</h1>
      <p className="mt-4 text-gray-600 dark:text-gray-400">Страница заказа</p>
    </div>
  );
}

