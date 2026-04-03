import { BrowserRouter, Routes, Route } from "react-router-dom";
import AppBar from "./components/AppBar";
import Home from "./pages/Home";
import Level from "./pages/Level";
import DataBase from "./pages/DataBase";

function App() {
  return (
    <>
      <BrowserRouter>
        <AppBar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/level/:levelId/:questionId" element={<Level />} />
          <Route path="/database" element={<DataBase />} />
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;
