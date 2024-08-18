import { useLocation } from 'react-router-dom';
import DashboardAdmin from './DashboardAdmin.jsx';
import RiderDashboard from './DashboardRider.jsx';
import DashboardDriver from './DashboardDriver.jsx';

export default function Dashboard() {
  const location = useLocation();
  const user = location.state?.user;
  console.log("This is user from main dashboard");
  console.log(user);
  const userRole = user["role"];
  return (
   <div>
     {userRole === 0 && <DashboardAdmin user={user}/>}
     {userRole === 1 && <DashboardAdmin user={user}/>}
     {userRole === 2 && <DashboardAdmin user={user}/>}
   </div>
  );
}