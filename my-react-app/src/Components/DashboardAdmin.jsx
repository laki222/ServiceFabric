import React from 'react';

export default function DashboardAdmin({ user }) {
  return (
    <div>
      <h1>Admin Dashboard</h1>
      <div className="user-info">
        <h2>User Information:</h2>
        <p><strong>Username:</strong> {user.id}</p>
        <p><strong>Email:</strong> {user.role}</p>
        <p><strong>Role:</strong> Admin</p>
      </div>
    </div>
  );
}