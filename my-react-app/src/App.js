import Register from './Components/Register';
import Login from './Components/Login';
import Dashboard from './Components/Dashboard';
import { GoogleOAuthProvider } from '@react-oauth/google';

import {
  BrowserRouter as Router,
  Routes,
  Route,
} from "react-router-dom";



function App() {
  const apiEndpointClient = process.env.REACT_APP_CLIENT_ID;
  return (
    <GoogleOAuthProvider clientId={apiEndpointClient}>
        <Router>
            <Routes>
                <Route path="/" element={<Login />} />
                <Route path="/Register" element={<Register />} />
                <Route exact path='/Dashboard' element={<Dashboard/>} />
            </Routes>
        </Router>
    </GoogleOAuthProvider>
  );
}

export default App;
