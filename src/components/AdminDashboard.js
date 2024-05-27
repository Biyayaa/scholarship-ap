import React, { useState, useEffect } from "react";
import { getDocs, collection, doc, updateDoc } from "firebase/firestore";
import { firestore } from "../firebase";
import "./AdminDashboard.css";

const AdminDashboard = () => {
  const [applications, setApplications] = useState([]);
  const [selectedApplication, setSelectedApplication] = useState(null);

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        const querySnapshot = await getDocs(
          collection(firestore, "applications")
        );
        const applicationsData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setApplications(applicationsData);
      } catch (error) {
        console.error("Error fetching applications:", error);
      }
    };

    fetchApplications();
  }, []);

  const calculateScholarship = (grades, guardianIncome, jambScore) => {
    const gradePoints = {
      A1: 10,
      B2: 8,
      B3: 7,
      C4: 5,
      C5: 4,
      C6: 3,
      D7: 2,
      E8: 1,
      F9: 0,
    };

    const incomePoints =
      guardianIncome <= 300000
        ? 20
        : guardianIncome <= 550000
        ? 15
        : guardianIncome <= 850000
        ? 10
        : 5;

    const jambPoints =
      jambScore >= 300 ? 30 : jambScore >= 250 ? 20 : jambScore >= 200 ? 10 : 0;

    let totalPoints = Object.values(grades).reduce(
      (sum, grade) => sum + (gradePoints[grade] || 0),
      0
    );
    totalPoints += incomePoints + jambPoints;

    if (totalPoints >= 100) return 100;
    if (totalPoints >= 80) return 75;
    if (totalPoints >= 60) return 50;
    return 0;
  };

  const handleViewDetails = (application) => {
    const scholarshipPercentage = calculateScholarship(
      application.grades,
      application.guardianIncome,
      application.jambScore
    );
    setSelectedApplication({ ...application, scholarshipPercentage });
  };

  const handleCloseModal = () => {
    setSelectedApplication(null);
  };

  const handleAcceptApplication = async () => {
    try {
      await updateDoc(doc(firestore, "applications", selectedApplication.id), {
        status: "accepted",
      });
      alert("Application accepted");
      handleCloseModal();
    } catch (error) {
      console.error("Error updating application status:", error);
    }
  };

  const handleRejectApplication = async () => {
    try {
      await updateDoc(doc(firestore, "applications", selectedApplication.id), {
        status: "rejected",
      });
      alert("Application rejected");
      handleCloseModal();
    } catch (error) {
      console.error("Error updating application status:", error);
    }
  };

  return (
    <div className="admin-dashboard-container">
      <h2>Admin Dashboard</h2>
      <div className="applications-grid">
        {applications.map((application) => (
          <div
            key={application.id}
            className="application-card"
            onClick={() => handleViewDetails(application)}
          >
            <i className="file-icon">📄</i>
            <p>{application.fullName}</p>
          </div>
        ))}
      </div>

      {selectedApplication && (
        <div className="modal">
          <div className="modal-content">
            <span className="close-button" onClick={handleCloseModal}>
              &times;
            </span>
            <h3>{selectedApplication.fullName}</h3>
            <p>
              <strong>Email:</strong> {selectedApplication.email}
            </p>
            <p>
              <strong>Field of Study:</strong>{" "}
              {selectedApplication.fieldOfStudy}
            </p>
            <p>
              <strong>JAMB Score:</strong> {selectedApplication.jambScore}
            </p>
            <p>
              <strong>Guardian's Yearly Income:</strong>{" "}
              {selectedApplication.guardianIncome}
            </p>
            <p>
              <strong>Additional Note:</strong>{" "}
              {selectedApplication.additionalNote}
            </p>
            <p>
              <strong>WAEC Result URL:</strong>{" "}
              <a
                href={selectedApplication.waecResultUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                View
              </a>
            </p>
            <p>
              <strong>JAMB Result URL:</strong>{" "}
              <a
                href={selectedApplication.jambResultUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                View
              </a>
            </p>
            <p>
              <strong>Financial Statement URL:</strong>{" "}
              <a
                href={selectedApplication.financialStatementUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                View
              </a>
            </p>
            <div>
              <h4>Grades:</h4>
              {selectedApplication.grades &&
                Object.keys(selectedApplication.grades).map((subject) => (
                  <p key={subject}>
                    <strong>{subject}:</strong>{" "}
                    {selectedApplication.grades[subject]}
                  </p>
                ))}
            </div>
            <div className="scholarship-percentage">
              <strong>Scholarship Percentage:</strong>{" "}
              <span>{selectedApplication.scholarshipPercentage}%</span>
            </div>
            <div className="modal-buttons">
              <button onClick={handleAcceptApplication}>Accept</button>
              <button onClick={handleRejectApplication}>Reject</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
