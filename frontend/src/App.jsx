import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import { useState } from 'react';
import { Editor } from './pages/Editor';
import { ThemeProvider } from './contexts/ThemeContext';
import { ThemeToggle } from './components/common/ThemeToggle';
import { C4Wizard } from './components/c4';
import './App.css';

// A simple component for the home page
function Home() {
  const [showC4Wizard, setShowC4Wizard] = useState(false);

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-blue-50 via-white to-indigo-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 sm:py-32">
          <div className="text-center">
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-gray-900 tracking-tight mb-6">
              Custom Architecture
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
                Platform
              </span>
            </h1>
            <p className="mt-6 text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
              A modern web-based platform for creating, visualizing, and managing
              software architecture diagrams with powerful customization capabilities.
            </p>
            <div className="mt-10 flex items-center justify-center gap-4">
              <button
                onClick={() => setShowC4Wizard(true)}
                className="px-8 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-lg font-medium transition-all shadow-lg hover:shadow-xl text-base"
              >
                Create C4 Diagram
              </button>
              <Link to="/editor" className="btn btn-primary text-base px-8 py-3">
                Open Editor
              </Link>
            </div>
          </div>
        </div>

        {/* Decorative elements */}
        <div className="absolute top-0 left-0 w-72 h-72 bg-blue-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob" />
        <div className="absolute top-0 right-0 w-72 h-72 bg-indigo-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000" />
        <div className="absolute bottom-0 left-1/2 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000" />
      </div>

      {/* C4 Wizard */}
      <C4Wizard
        isOpen={showC4Wizard}
        onClose={() => setShowC4Wizard(false)}
        onComplete={(diagramId) => {
          setShowC4Wizard(false);
          window.location.href = `/editor/${diagramId}`;
        }}
      />

      {/* Features Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">
          Quick Links
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Link
            to="/editor"
            className="card card-interactive p-6 group"
          >
            <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <span className="text-2xl">✨</span>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Main Editor
            </h3>
            <p className="text-gray-600">
              Access the full-featured editor with template-based nodes, custom styling, and more.
            </p>
          </Link>

          <Link
            to="/editor"
            className="card card-interactive p-6 group"
          >
            <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <span className="text-2xl">📐</span>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              C4 Model Support
            </h3>
            <p className="text-gray-600">
              Native support for C4 architecture model with contextual elements.
            </p>
          </Link>

          <Link
            to="/editor"
            className="card card-interactive p-6 group"
          >
            <div className="w-12 h-12 rounded-lg bg-purple-100 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <span className="text-2xl">📦</span>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Template Library
            </h3>
            <p className="text-gray-600">
              Create and reuse node templates with Jinja2 customization.
            </p>
          </Link>
        </div>
      </div>

      {/* Features Grid */}
      <div className="bg-gray-50 py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Powerful Features
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Everything you need to create professional architecture diagrams
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                title: 'Custom Nodes',
                description: 'Create fully customizable HTML nodes with Jinja2 templates',
                icon: '🎯',
              },
              {
                title: 'Drag & Drop',
                description: 'Intuitive drag-and-drop interface for easy diagram creation',
                icon: '🖱️',
              },
              {
                title: 'C4 Model Support',
                description: 'Native support for C4 architecture model notation',
                icon: '📐',
              },
              {
                title: 'Export Options',
                description: 'Export your diagrams as PNG, SVG, or JSON',
                icon: '📤',
              },
            ].map((feature, index) => (
              <div key={index} className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white shadow-md mb-4">
                  <span className="text-3xl">{feature.icon}</span>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600 text-sm">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <div className="min-h-screen bg-gray-50 flex flex-col">
          {/* Modern Navigation Bar */}
          <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-lg border-b border-gray-200 shadow-sm flex-shrink-0">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex items-center justify-between h-16">
                {/* Logo/Brand */}
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-sm">
                    <span className="text-white font-bold text-lg">A</span>
                  </div>
                  <span className="text-xl font-semibold text-gray-900">
                    ArchPlatform
                  </span>
                </div>

                {/* Navigation Links */}
                <ul className="flex items-center gap-1">
                  <li>
                    <Link
                      to="/"
                      className="px-4 py-2 rounded-lg text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 transition-all duration-200"
                    >
                      Home
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/editor"
                      className="px-4 py-2 rounded-lg text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 transition-all duration-200"
                    >
                      Editor
                    </Link>
                  </li>
                </ul>

                {/* Right side actions */}
                <div className="flex items-center gap-2">
                  <ThemeToggle />
                </div>
              </div>
            </div>
          </nav>

          {/* Main Content */}
          <main className="flex-1 overflow-hidden">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/editor" element={<Editor />} />
              <Route path="/editor/:diagramId" element={<Editor />} />
            </Routes>
          </main>
        </div>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
