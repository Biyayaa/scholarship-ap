// src/components/AdminDashboard.js
import React, { useState, useEffect } from 'react';
import { getDocs, collection } from 'firebase/firestore';
import { firestore } from '../firebase';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const [applications, setApplications] = useState([]);

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        const querySnapshot = await getDocs(collection(firestore, 'applications'));
        const applicationsData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setApplications(applicationsData);
      } catch (error) {
        console.error('Error fetching applications:', error);
      }
    };

    fetchApplications();
  }, []);

  return (
    <div className="admin-dashboard-container">
      <h2>Admin Dashboard</h2>
      {applications.map((application) => (
        <div key={application.id} className="application-card">
          <h3>{application.fullName}</h3>
          <p><strong>Email:</strong> {application.email}</p>
          <p><strong>Field of Study:</strong> {application.fieldOfStudy}</p>
          <p><strong>JAMB Score:</strong> {application.jambScore}</p>
          <p><strong>Guardian's Yearly Income:</strong> {application.guardianIncome}</p>
          <p><strong>Additional Note:</strong> {application.additionalNote}</p>
          <p><strong>WAEC Result URL:</strong> <a href={application.waecResultUrl} target="_blank" rel="noopener noreferrer">View</a></p>
          <p><strong>JAMB Result URL:</strong> <a href={application.jambResultUrl} target="_blank" rel="noopener noreferrer">View</a></p>
          <p><strong>Financial Statement URL:</strong> <a href={application.financialStatementUrl} target="_blank" rel="noopener noreferrer">View</a></p>
          <div>
            <h4>Grades:</h4>
            {application.grades && Object.keys(application.grades).map((subject) => (
              <p key={subject}><strong>{subject}:</strong> {application.grades[subject]}</p>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default AdminDashboard;
