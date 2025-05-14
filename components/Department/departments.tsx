"use client"
import React, { useState, useEffect } from 'react';
import styles from "../../styles/departmentPage.module.css";
import SectionTitle from '../Common/SectionTitle';

interface Department {
  _id: string;
  university: string;
  name: string;
  description: string;
  imageUrl: string;
  link: string;
}

const DepartmentsPage = () => {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [filteredDepartments, setFilteredDepartments] = useState<Department[]>([]);
  const [activeLetter, setActiveLetter] = useState<string | null>(null);

  const fetchDepartments = async () => {
    try {
      const response = await fetch('/api/alldepartment/');
      if (!response.ok) {
        throw new Error('Failed to fetch departments');
      }
      const data = await response.json();
      setDepartments(data);
      setFilteredDepartments(data); // Initialize filtered departments
    } catch (error) {
      console.error('Error fetching departments:', error);
    }
  };

  useEffect(() => {
    fetchDepartments();
  }, []);

  useEffect(() => {
    if (activeLetter) {
      const filtered = departments.filter(dept =>
        dept.university.toUpperCase().startsWith(activeLetter.toUpperCase())
      );
      setFilteredDepartments(filtered);
    } else {
      setFilteredDepartments(departments); // Reset to all departments if no letter is selected
    }
  }, [activeLetter, departments]);

  return (
    <main className={styles.container}>
      <SectionTitle
        title="Different Departments"
        paragraph="Our platform offers tailored resources and tools for students to seamlessly upload and manage their final year projects across various departments, ensuring they can showcase their work, access essential information, and avoid project repetition in the future."
        center
      />
      <p className={` ${styles.pageTitle} dark:text-body-color-dark`}>
        {['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'].map((letter, index) => (
          <span
            key={index}
            className={`${styles.letter} ${activeLetter === letter ? styles.activeLetter : ''}`}
            onClick={() => setActiveLetter(letter)}
          >
            {letter}
          </span>
        ))}
      </p>
      <section className={styles.departments}>
        <div className={styles.cardContainer}>
          {filteredDepartments.map((dept) => (
            <div key={dept._id} className={`${styles.card} dark:text-body-color-dark bg-[#f8f8f8] 
            text-body-color hover:bg-primary/5 hover:text-primary dark:bg-[#2C303B] 
            dark:hover:bg-primary/5 dark:hover:text-primary`}>
              <img src={dept.imageUrl} alt={dept.name} className={styles.cardImage} />
              <div className={styles.cardContent}>
                <h2 className={ `${styles.cardTitle} dark:text-white/70 `}>{dept.name}</h2>
                <p className={ `${styles.cardDescription} dark:text-white/70 `}>{dept.description}</p>
                <p className={ `${styles.cardUniversity} dark:text-white/50 `}><strong>University:</strong> {dept.university}</p>
                <a href={dept.link} className={styles.cardLink}>View Projects</a>
              </div>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
};

export default DepartmentsPage;
