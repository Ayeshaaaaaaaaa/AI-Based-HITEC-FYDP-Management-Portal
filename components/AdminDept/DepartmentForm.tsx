import React, { useState } from 'react';
import styles from "../../styles/modal.module.css";

interface DepartmentFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (department: any) => void;
  department?: any;
}

const DepartmentForm: React.FC<DepartmentFormProps> = ({ isOpen, onClose, onSave, department }) => {
  const [name, setName] = useState(department?.name || '');
  const [description, setDescription] = useState(department?.description || '');
  const [imageUrl, setImageUrl] = useState(department?.imageUrl || '');
  const [link, setLink] = useState(department?.link || '');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      
      reader.onloadend = () => {
        setImageUrl(reader.result as string);
      };
      
      reader.readAsDataURL(file);
    }
  };

  const handleSave = () => {
    onSave({ name, description, imageUrl, link });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <h2>{department ? 'Edit Department' : 'Add Department'}</h2>
        <div className={styles.formGroup}>
          <label>Name</label>
          <input type="text" value={name} onChange={(e) => setName(e.target.value)} />
        </div>
        <div className={styles.formGroup}>
          <label>Description</label>
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} />
        </div>
        <div className={styles.formGroup}>
          <label>Image</label>
          <input type="file" onChange={handleFileChange} />
          {imageUrl && <img src={imageUrl} alt="Preview" className={styles.previewImage} />}
        </div>
        <div className={styles.formGroup}>
          <label>Project Link</label>
          <input type="text" value={link} onChange={(e) => setLink(e.target.value)} />
        </div>
        <div className={styles.modalActions}>
          <button onClick={onClose}>Cancel</button>
          <button onClick={handleSave}>{department ? 'Update' : 'Save'}</button>
        </div>
      </div>
    </div>
  );
};

export default DepartmentForm;
