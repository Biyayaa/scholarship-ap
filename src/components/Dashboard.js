import React, { useState, useEffect } from 'react';
import { auth, firestore, storage } from '../firebase';
import { getDoc, doc, setDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import './Dashboard.css';

const Dashboard = () => {
  const [userData, setUserData] = useState({});
  const [fieldOfStudy, setFieldOfStudy] = useState('');
  const [grades, setGrades] = useState({});
  const [waecResult, setWaecResult] = useState(null);
  const [jambScore, setJambScore] = useState('');
  const [jambResult, setJambResult] = useState(null);
  const [guardianIncome, setGuardianIncome] = useState('');
  const [financialStatement, setFinancialStatement] = useState(null);
  const [additionalNote, setAdditionalNote] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [scholarshipInfo, setScholarshipInfo] = useState(null);
  const [email, setEmail] = useState('');

  useEffect(() => {
    const fetchUserData = async () => {
      const user = auth.currentUser;
      if (user) {
        const userDoc = await getDoc(doc(firestore, 'users', user.uid));
        const applicationDoc = await getDoc(doc(firestore, 'applications', user.uid));

        if (userDoc.exists()) {
          const userData = userDoc.data();
          setUserData(userData);
          setEmail(user.email); // Set the email from auth user data
        }

        if (applicationDoc.exists()) {
          const applicationData = applicationDoc.data();
          setFieldOfStudy(applicationData.fieldOfStudy);
          setGrades(applicationData.grades);
          setJambScore(applicationData.jambScore);
          setGuardianIncome(applicationData.guardianIncome);
          setAdditionalNote(applicationData.additionalNote);
          setIsSubmitted(true);
          if (applicationData.scholarshipPercentage) {
            setScholarshipInfo({
              approved: applicationData.status === 'accepted',
              percentage: applicationData.scholarshipPercentage
            });
          }
        }
      }
    };

    fetchUserData();
  }, []);

  const handleFieldChange = (e) => {
    setFieldOfStudy(e.target.value);
  };

  const handleGradeChange = (subject, grade) => {
    setGrades((prevGrades) => ({
      ...prevGrades,
      [subject]: grade,
    }));
  };

  const handleFileChange = (e, setFile) => {
    setFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const user = auth.currentUser;
      if (!user) throw new Error("No user signed in");

      // Upload files to Firebase Storage and get URLs
      const waecResultUrl = waecResult ? await uploadFile(waecResult, `waecResults/${user.uid}`) : null;
      const jambResultUrl = jambResult ? await uploadFile(jambResult, `jambResults/${user.uid}`) : null;
      const financialStatementUrl = financialStatement ? await uploadFile(financialStatement, `financialStatements/${user.uid}`) : null;

      // Save application data to Firestore
      await setDoc(doc(firestore, 'applications', user.uid), {
        fullName: userData.name,
        email,
        fieldOfStudy,
        grades,
        jambScore,
        waecResultUrl,
        jambResultUrl,
        guardianIncome,
        financialStatementUrl,
        additionalNote,
        status: 'pending'
      });

      setIsSubmitted(true);
      alert("Application submitted successfully!");
    } catch (error) {
      console.error("Error submitting application:", error);
      alert("Failed to submit application");
    }
  };

  const uploadFile = async (file, path) => {
    if (!file) return null;
    const fileRef = ref(storage, path);
    try {
      await uploadBytes(fileRef, file);
      const url = await getDownloadURL(fileRef);
      console.log('File uploaded successfully, URL:', url);
      return url;
    } catch (error) {
      console.error('Error uploading file:', error);
      throw error;
    }
  };

  const subjects = {
    science: ['English', 'Mathematics', 'Chemistry', 'Physics', 'Biology'],
    arts: ['English', 'Mathematics', 'Government', 'Literature', 'Yoruba'],
    commercial: ['English', 'Mathematics', 'Commerce', 'Accounting', 'Economics'],
  };

  const gradeOptions = ['A1', 'B2', 'B3', 'C4', 'C5', 'C6', 'D7', 'E8', 'F9'];

  return (
    <div className="dashboard-container">
      <h2>Dashboard</h2>
      {isSubmitted ? (
        <div>
          <h3>Application Details</h3>
          {scholarshipInfo && scholarshipInfo.approved && (
            <div className="scholarship-info">
              <h4>Scholarship Approved</h4>
              <p className="scholarship-percentage">Scholarship Percentage: {scholarshipInfo.percentage}%</p>
            </div>
          )}
          <p><strong>Full Name:</strong> {userData.name}</p>
          <p><strong>Email:</strong> {email}</p>
          <p><strong>Field of Study:</strong> {fieldOfStudy}</p>
          <div className="grades-section">
            <h4>Grades:</h4>
            {Object.keys(grades).map(subject => (
              <p key={subject}><strong>{subject}:</strong> {grades[subject]}</p>
            ))}
          </div>
          <p><strong>JAMB Score:</strong> {jambScore}</p>
          <p><strong>Guardian's Yearly Income:</strong> {guardianIncome}</p>
          <p><strong>Additional Note:</strong> {additionalNote}</p>
          <p><strong>WAEC Result URL:</strong> <a href={waecResult} target="_blank" rel="noopener noreferrer">View</a></p>
          <p><strong>JAMB Result URL:</strong> <a href={jambResult} target="_blank" rel="noopener noreferrer">View</a></p>
          <p><strong>Financial Statement URL:</strong> <a href={financialStatement} target="_blank" rel="noopener noreferrer">View</a></p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="dashboard-form">
          <div className="form-group">
            <label>Full Name:</label>
            <input type="text" value={userData.name} readOnly />
          </div>
          <div className="form-group">
            <label>Email:</label>
            <input type="email" value={email} readOnly />
          </div>
          <div className="form-group">
            <label>Field of Study:</label>
            <select value={fieldOfStudy} onChange={handleFieldChange} required>
              <option value="">Select field</option>
              <option value="science">Science</option>
              <option value="arts">Arts</option>
              <option value="commercial">Commercial</option>
            </select>
          </div>
          {fieldOfStudy && (
            <div className="form-group">
              <label>WAEC Results:</label>
              {subjects[fieldOfStudy].map((subject) => (
                <div key={subject} className="subject-group">
                  <label>{subject}:</label>
                  <select
                    value={grades[subject] || ''}
                    onChange={(e) => handleGradeChange(subject, e.target.value)}
                    required
                  >
                    <option value="">Select grade</option>
                    {gradeOptions.map((grade) => (
                      <option key={grade} value={grade}>
                        {grade}
                      </option>
                    ))}
                  </select>
                </div>
              ))}
            </div>
          )}
          <div className="form-group">
            <label>Upload WAEC Result:</label>
            <input type="file" onChange={(e) => handleFileChange(e, setWaecResult)} required />
          </div>
          <div className="form-group">
            <label>JAMB Score:</label>
            <input
              type="number"
              value={jambScore}
              onChange={(e) => setJambScore(e.target.value)}
              max="400"
              required
            />
          </div>
          <div className="form-group">
            <label>Upload JAMB Result:</label>
            <input type="file" onChange={(e) => handleFileChange(e, setJambResult)} required />
          </div>
          <div className="form-group">
            <label>Guardian's Yearly Income:</label>
            <input
              type="number"
              value={guardianIncome}
              onChange={(e) => setGuardianIncome(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label>Upload Financial Statement:</label>
            <input type="file" onChange={(e) => handleFileChange(e, setFinancialStatement)} required />
          </div>
          <div className="form-group">
            <label>Additional Note:</label>
            <textarea
              value={additionalNote}
              onChange={(e) => setAdditionalNote(e.target.value)}
            />
          </div>
          <button type="submit">Submit Application</button>
        </form>
      )}
    </div>
  );
};

export default Dashboard;
