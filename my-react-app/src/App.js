import Register from './Components/Register';


import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

function App() {
  return (
    <>
        <Router>
            <Routes>
               
                <Route  path="/Register" element={<Register />} />
               
            </Routes>
        </Router>
    </>
  );
}

export default App;