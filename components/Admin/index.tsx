'use client';
import React, { useEffect, useState } from 'react';
import { FaUserCheck, FaFileAlt } from 'react-icons/fa'; // Importing icons

interface SignupRequest {
  _id: string;
  username: string;
  email: string;
  university: string;
  userType: string;
  status: string;
}

interface ProjectRequest {
  _id: string;
  projectName: string;
  universityName: string;
  departmentName: string;
  supervisorName: string;
  file: File;
  status: string;
  submittedBy: string;
}

const AdminDashboard: React.FC = () => {
  const [signupRequests, setSignupRequests] = useState<SignupRequest[]>([]);
  const [projectRequests, setProjectRequests] = useState<ProjectRequest[]>([]);

  useEffect(() => {
    const fetchSignupRequests = async () => {
      try {
        const response = await fetch('/api/admin/signupreq');
        const data = await response.json();

        if (Array.isArray(data)) {
          setSignupRequests(data);
        } else {
          console.error('Unexpected response format for signupRequests:', data);
        }
      } catch (error) {
        console.error('Error fetching signup requests:', error);
      }
    };

    const fetchProjectRequests = async () => {
      try {
        const response = await fetch('/api/admin/projectreq');
        const data = await response.json();

        if (Array.isArray(data)) {
          setProjectRequests(data);
        } else {
          console.error('Unexpected response format for projectRequests:', data);
        }
      } catch (error) {
        console.error('Error fetching project requests:', error);
      }
    };

    fetchSignupRequests();
    fetchProjectRequests();
  }, []);

  const handleApproval = async (type: 'signup' | 'project', id: string, status: 'approved' | 'rejected') => {
    try {
      const endpoint = type === 'signup' ? `/api/admin/signupreq/${id}` : `/api/admin/projectreq/${id}`;
      const response = await fetch(endpoint, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status }),
      });

      if (response.ok) {
        // Update the UI or state as necessary
        if (type === 'signup') {
          setSignupRequests(signupRequests.filter((req) => req._id !== id));
        } else {
          setProjectRequests(projectRequests.filter((req) => req._id !== id));
        }
      } else {
        console.error('Failed to update request:', await response.text());
      }
    } catch (error) {
      console.error('Error in handleApproval:', error);
    }
  };

  return (
    <div>
      <div style={styles.dashboardCards}>
        <div style={styles.dashboardCard}>
          <FaUserCheck style={styles.dashboardIcon} />
          <div>
            <h3>Signup Requests</h3>
            <p>{signupRequests.length}</p>
          </div>
        </div>
        <div style={styles.dashboardCard}>
          <FaFileAlt style={styles.dashboardIcon} />
          <div>
            <h3>Project Approval Requests</h3>
            <p>{projectRequests.length}</p>
          </div>
        </div>
      </div>
      <div style={styles.dashboardLists}>
        <div>
          <h2 className="flex cursor-pointer items-center justify-between py-2 text-base text-dark group-hover:text-primary dark:text-white/70 dark:group-hover:text-white lg:mr-0 lg:inline-flex lg:px-0 lg:py-6 ms-5">Signup Requests</h2>
          <ul style={styles.ul}>
            {signupRequests.map((req) => (
              <li key={req._id} style={styles.li}>
                {req.username} ({req.email}, {req.university}) - {req.userType} - {req.status}
                <button style={styles.button} onClick={() => handleApproval('signup', req._id, 'approved')}>Approve</button>
                <button style={styles.button} onClick={() => handleApproval('signup', req._id, 'rejected')}>Reject</button>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h2 className="flex cursor-pointer items-center justify-between py-2 text-base text-dark group-hover:text-primary dark:text-white/70 dark:group-hover:text-white lg:mr-5 lg:inline-flex lg:px-0 lg:py-6 ">Project Approval Requests</h2>
          <ul style={styles.ul}>
            {projectRequests.map((req) => (
              <li key={req._id} style={styles.li}>
                {req.projectName} ({req.universityName},{req.departmentName},{req.supervisorName}) - Submitted by {req.submittedBy} - {req.status}
                <button style={styles.button} onClick={() => handleApproval('project', req._id, 'approved')}>Approve</button>
                <button style={styles.button} onClick={() => handleApproval('project', req._id, 'rejected')}>Reject</button>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

const styles = {
  dashboardCards: {
    display: 'flex',
    justifyContent: 'space-around',
    marginBottom: '20px',
  },
  dashboardCard: {
    display: 'flex',
    alignItems: 'center',
    padding: '20px',
    backgroundColor: '#fff',
    borderRadius: '10px',
    boxShadow: '0 0 10px rgba(0, 0, 0, 0.1)',
  },
  dashboardIcon: {
    fontSize: '2em',
    marginRight: '10px',
  },
  dashboardLists: {
    display: 'flex',
    justifyContent: 'space-between',
  },
  ul: {
    listStyleType: 'none',
    padding: 0,
  },
  li: {
    padding: '10px',
    backgroundColor: '#fff',
    marginBottom: '10px',
    borderRadius: '5px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  button: {
    marginLeft: '10px',
    padding: '5px 10px',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    backgroundColor: '#f0f0f0',
  },
  buttonHover: {
    backgroundColor: '#ddd',
  }
};

export default AdminDashboard;
