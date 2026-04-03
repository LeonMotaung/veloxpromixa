import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './Home';
import Dashboard from './Dashboard';
import Docs from './Docs';
import Pricing from './Pricing';
import UseCases from './UseCases';
import Skills from './Skills';
import Admin from './Admin';
import ModelRegistry from './ModelRegistry';
import BlueprintLibrary from './BlueprintLibrary';
import ApiKeys from './ApiKeys';
import Status from './Status';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/use-cases" element={<UseCases />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/pricing" element={<Pricing />} />
        <Route path="/skills" element={<Skills />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="/docs" element={<Docs />} />
        <Route path="/docs/:docName" element={<Docs />} />
        <Route path="/registry" element={<ModelRegistry />} />
        <Route path="/blueprints" element={<BlueprintLibrary />} />
        <Route path="/keys" element={<ApiKeys />} />
        <Route path="/status" element={<Status />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
