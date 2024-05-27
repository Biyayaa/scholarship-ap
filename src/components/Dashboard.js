// src/components/Dashboard.js
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

  useEffect(() => {
    const fetchUserData = async () => {
      const user = auth.currentUser;
      if (user) {
        const userDoc = await getDoc(doc(firestore, 'users', user.uid));
        if (userDoc.exists()) {
          setUserData(userDoc.data());
        } else {
          console.error('User document does not exist');
        }
      } else {
        console.error('No user is signed in');
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
        fieldOfStudy,
        grades,
        jambScore,
        waecResultUrl,
        jambResultUrl,
        guardianIncome,
        financialStatementUrl,
        additionalNote,
      });

      alert("Application submitted successfully!");
    } catch (error) {
      console.error("Error submitting application:", error);
      alert("Failed to submit application: " + error.message);
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
      <form onSubmit={handleSubmit} className="dashboard-form">
        <div className="form-group">
          <label>Full Name:</label>
          <input type="text" value={userData.name || ''} disabled />
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
          ></textarea>
        </div>
        <button type="submit" className="submit-button">Submit Application</button>
      </form>
    </div>
  );
};

export default Dashboard;
