// App.tsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import About from './pages/About';
import Pathsala from './pages/Pathsala';
import PathsalaLevel from './pages/PathsalaLevel'; // ✅ Must match filename exactly
import Contribute from './pages/Contribute';
import Events from './pages/Events';
import Gallery from './pages/Gallery';
import Membership from './pages/Membership';
import Feedback from './pages/Feedback';
import Jinalay from './pages/Jinalay';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50">
        <Navbar />
        <main>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/pathsala" element={<Pathsala />} />
            <Route path="/pathsala/level-:level" element={<PathsalaLevel />} /> {/* ✅ This route handles dynamic levels */}
            <Route path="/contribute" element={<Contribute />} />
            <Route path="/events" element={<Events />} />
            <Route path="/gallery" element={<Gallery />} />
            <Route path="/membership" element={<Membership />} />
            <Route path="/feedback" element={<Feedback />} />
            <Route path="/jinalay" element={<Jinalay />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
