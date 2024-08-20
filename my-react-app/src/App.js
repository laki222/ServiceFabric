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
  return (
    <GoogleOAuthProvider clientId="666899120556-pgqh6ju9k0aur2mcgv94eker6endktdo.apps.googleusercontent.com">
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
