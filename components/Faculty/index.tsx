'use client';
import React, { useEffect, useState } from 'react';
import styles from '../../styles/universities.module.css';
import '@fortawesome/fontawesome-free/css/all.min.css';

interface Faculty {
  _id: string;
  userType: string;
  username: string;
  email: string;
  password: string;
  university: string;
  studentId: string;
  program: string;
  year: string;
  department: string;
  position: string;
  status: string;
  createdAt: string;
}

const FacultyPage = () => {
  const [faculty, setFaculty] = useState<Faculty[]>([]);
  const [filteredFaculty, setFilteredFaculty] = useState<Faculty[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchFaculty = async () => {
    try {
      const response = await fetch('/api/admin/faculty', {
        credentials: 'include' // Ensure cookies are sent with the request
      });
      const data = await response.json();
      console.log('Fetched daculty:', data); // Debugging line
      if (Array.isArray(data)) {
        setFaculty(data);
        setFilteredFaculty(data);
      } else {
        console.error('Unexpected data format:', data);
        setFaculty([]);
        setFilteredFaculty([]);
      }
    } catch (error) {
      console.error('Failed to fetch students:', error);
      setFaculty([]);
      setFilteredFaculty([]);
    }
  };
  useEffect(() => {
    fetchFaculty();
  }, []);

  useEffect(() => {
    const filtered = faculty.filter((faculty) =>
      (faculty.username?.toLowerCase().includes(searchQuery.toLowerCase()) || '') ||
      (faculty.email?.toLowerCase().includes(searchQuery.toLowerCase()) || '') ||
      (faculty.university?.toLowerCase().includes(searchQuery.toLowerCase()) || '') ||
      (faculty.department?.toLowerCase().includes(searchQuery.toLowerCase()) || '') ||
      (faculty.status?.toLowerCase().includes(searchQuery.toLowerCase()) || '')
    );
    setFilteredFaculty(filtered);
  }, [searchQuery, faculty]);

  const handleUpdateStatus = async (id: string, status: string) => {
    await fetch(`/api/admin/faculty/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ status }),
    });
    fetchFaculty();
  };

  const handleDeleteStudent = async (id: string) => {
    await fetch(`/api/admin/faculty/${id}`, {
      method: 'DELETE',
    });
    fetchFaculty();
  };

  return (
    <div style={{ padding: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 className="flex cursor-pointer items-center justify-between py-2 text-base text-dark 
         font-bold text-xl group-hover:text-primary dark:text-white/70 dark:group-hover:text-white lg:mr-0 lg:inline-flex lg:px-0 lg:py-6 ms-5">Faculty Records</h1>
        <div className={styles.searchContainer}>
          <div className={styles.searchInputWrapper}>
            <input
              type="text"
              className={styles.searchInput}
              placeholder="Search students"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <span className={styles.searchIcon}>
              <i className="fa fa-search"></i>
            </span>
          </div>
        </div>
      </div>
      <br />
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ backgroundColor: '#f8f9fa' }}>
            <th style={{ border: '1px solid #dee2e6', padding: '10px' }}>Faculty Name</th>
            <th style={{ border: '1px solid #dee2e6', padding: '10px' }}>Email</th>
            <th style={{ border: '1px solid #dee2e6', padding: '10px' }}>University</th>
            <th style={{ border: '1px solid #dee2e6', padding: '10px' }}>Department</th>
            <th style={{ border: '1px solid #dee2e6', padding: '10px' }}>Position</th>
            <th style={{ border: '1px solid #dee2e6', padding: '10px' }}>Status</th>
            <th style={{ border: '1px solid #dee2e6', padding: '10px' }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredFaculty.map((faculty) => (
            <tr key={faculty._id} style={{ borderBottom: '1px solid #dee2e6' }} className="dark:text-white/70 dark:group-hover:text-white">
              <td style={{ border: '1px solid #dee2e6', padding: '10px' }}>{faculty.username}</td>
              <td style={{ border: '1px solid #dee2e6', padding: '10px' }}>{faculty.email}</td>
              <td style={{ border: '1px solid #dee2e6', padding: '10px' }}>{faculty.university}</td>
              <td style={{ border: '1px solid #dee2e6', padding: '10px' }}>{faculty.department}</td>
              <td style={{ border: '1px solid #dee2e6', padding: '10px' }}>{faculty.position}</td>
              <td style={{ border: '1px solid #dee2e6', padding: '10px' }}>
                <select
                  className="text-base text-dark dark:text-black/70 dark:group-hover:text-black"
                  value={faculty.status}
                  onChange={(e) => {
                    if (faculty.status === 'pending' || faculty.status === 'rejected') {
                      handleUpdateStatus(faculty._id, e.target.value);
                    }
                  }}
                  disabled={faculty.status === 'approved'}
                >
                  <option value="pending">Pending</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                </select>
              </td>
              <td style={{ border: '1px solid #dee2e6', padding: '10px' }}>
                <button
                  onClick={() => handleDeleteStudent(faculty._id)}
                  style={{ padding: '5px 10px', backgroundColor: '#dc3545', color: '#fff', border: 'none', borderRadius: '4px' }}
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default FacultyPage;
