import Register from './Components/Register';
import Login from './Components/Login';
import Dashboard from './Components/Dashboard';
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
                <Route   path="/" element={<Login />} />  
                <Route  path="/Register" element={<Register />} />
                <Route  exact path='/Dashboard' element={<Dashboard/>} ></Route>
            </Routes>
        </Router>
    </>
  );
}

export default App;