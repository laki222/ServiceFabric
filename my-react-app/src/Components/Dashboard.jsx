import { useLocation } from 'react-router-dom';
import DashboardAdmin from './DashboardAdmin.jsx';
import DashboardRider from './DashboardRider.jsx';
import DashboardDriver from './DashboardDriver.jsx';

export default function Dashboard() {
  const location = useLocation();
  const user = location.state?.user;
  const userRole = user["role"];
  return (
   <div>
     {userRole === 0 && <DashboardAdmin user={user}/>}
     {userRole === 1 && <DashboardRider user={user}/>}
   </div>
  );
}