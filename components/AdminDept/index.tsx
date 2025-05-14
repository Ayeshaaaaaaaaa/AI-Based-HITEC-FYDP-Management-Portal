import React, { useState, useEffect } from 'react';
import DepartmentForm from './DepartmentForm';
import styles from "../../styles/adminDepartment.module.css";
import styles2 from "../../styles/universities.module.css";
import '@fortawesome/fontawesome-free/css/all.min.css';

interface Department {
  _id: string;
  name: string;
  description: string;
  imageUrl: string;
  link: string;
  university: string;
  createdAt: string;
}

const AdminDepartment = () => {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [filteredDepartments, setFilteredDepartment] = useState<Department[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [university, setUniversity] = useState<string>('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDepartment, setSelectedDepartment] = useState<Department | null>(null);

  const fetchUniversity = async () => {
    try {
      const response = await fetch('/api/auth/adminsignin');
      const data = await response.json();
      setUniversity(data.university || '');
    } catch (error) {
      console.error('Failed to fetch university data:', error);
    }
  };

  useEffect(() => {
    fetchUniversity();
    fetchDepartments();
  }, []);

  const fetchDepartments = async () => {
    try {
      const response = await fetch('/api/admin/departments/');
      const data = await response.json();
      setDepartments(data);
      setFilteredDepartment(data);
    } catch (error) {
      console.error('Failed to fetch departments:', error);
    }
  };

  useEffect(() => {
    const filtered = departments.filter((department) =>
      department.name?.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredDepartment(filtered);
  }, [searchQuery, departments]);
  

  const handleAddDepartment = () => {
    setSelectedDepartment(null);
    setIsModalOpen(true);
  };

  const handleEditDepartment = (department: Department) => {
    setSelectedDepartment(department);
    setIsModalOpen(true);
  };

  const handleDeleteDepartment = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this department?')) {
      try {
        await fetch(`/api/admin/departments/${id}`, { method: 'DELETE' });
        setDepartments((prev) => prev.filter((dept) => dept._id !== id));
      } catch (error) {
        console.error('Failed to delete department:', error);
      }
    }
  };

  const handleSaveDepartment = async (department: Department) => {
    if (selectedDepartment) {
      // Update existing department
      await updateDepartment(selectedDepartment._id, department);
    } else {
      // Add new department
      await addNewDepartment(department);
    }
  };

  const updateDepartment = async (id: string, updatedInfo: any) => {
    try {
      const response = await fetch(`/api/admin/departments/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id, ...updatedInfo }),
      });
      const updatedDept = await response.json();
      if (response.ok) {
        setDepartments((prev) => prev.map((dept) => (dept._id === id ? updatedDept : dept)));
      } else {
        console.error('Failed to update department:', updatedDept);
      }
    } catch (error) {
      console.error('Failed to update department:', error);
    }
  };

  const addNewDepartment = async (department) => {
    try {
      const response = await fetch(`/api/admin/departments/id/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(department),
      });
  
      if (!response.ok) {
        const text = await response.text();
        console.error('Failed to add department:', text);
        throw new Error(`Server error: ${response.status}`);
      }
  
      const newDept = await response.json();
      setDepartments((prev) => [...prev, newDept]);
    } catch (error) {
      console.error('Failed to add department:', error);
    }
  };
  
  

  return (
    <div className={`${styles.container} dark:text-white`}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 className="flex cursor-pointer items-center justify-between py-2 text-base text-dark 
           font-bold text-xl group-hover:text-primary dark:text-white/70 dark:group-hover:text-white lg:mr-0 lg:inline-flex lg:px-0 lg:py-6 ms-5">Departments</h1>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <button
            onClick={handleAddDepartment}
            className="mr-4 px-4 py-2 bg-blue-500 text-white rounded-lg"
          >
            Add Department
          </button>
          <div className={styles2.searchContainer}>
            <div className={styles2.searchInputWrapper}>
              <input
                type="text"
                className={styles2.searchInput}
                placeholder="Search department"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <span className={styles2.searchIcon}>
                <i className="fa fa-search"></i>
              </span>
            </div>
          </div>
        </div>
      </div>
      <table className={`${styles.table} dark:text-white`}>
        <thead>
          <tr>
            <th>Name</th>
            <th>Description</th>
            <th>Image</th>
            <th>Project Link</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredDepartments.map((department) => (
            <tr key={department._id}>
              <td>{department.name}</td>
              <td>{department.description}</td>
              <td>
                <img
                  src={department.imageUrl}
                  alt={department.name}
                  className={styles.image} />
              </td>
              <td>
                <a href={department.link} target="_blank" rel="noopener noreferrer">
                  {department.link}
                </a>
              </td>
              <td className={styles.actionButtons}>
                <button
                  className={styles.editButton}
                  onClick={() => handleEditDepartment(department)}
                >
                  ✏️
                </button>
                <button
                  className={styles.deleteButton}
                  onClick={() => handleDeleteDepartment(department._id)}
                >
                  🗑️
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <DepartmentForm
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveDepartment}
        department={selectedDepartment}
      />
    </div>
  );
};

export default AdminDepartment;
