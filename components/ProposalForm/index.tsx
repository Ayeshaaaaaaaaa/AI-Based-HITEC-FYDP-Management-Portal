// components/ProposalForm.tsx
'use client'
import React, { useState } from 'react';

interface ProposalFormProps {
  onClose: () => void;
  onSubmit: (data: {
    title: string;
    description: string;
    document: File | null;
    deptName: string;
    supervisorName: string;
  }) => void;
  deptName: string;
  supervisorName: string;
}

const ProposalForm: React.FC<ProposalFormProps> = ({
  onClose,
  onSubmit,
  deptName,
  supervisorName,
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [document, setDocument] = useState<File | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (title && description && document) {
      onSubmit({
        title,
        description,
        document,
        deptName,
        supervisorName,
      });
      onClose(); // Close the modal after submission
    } else {
      alert('Please fill in all fields.');
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-11/12 max-w-lg">
        <h2 className="text-xl font-semibold mb-4">Submit Proposal</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700">Project Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="border rounded w-full py-2 px-3"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700">Project Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="border rounded w-full py-2 px-3"
              rows={4}
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700">Upload Document</label>
            <input
              type="file"
              onChange={(e) => setDocument(e.target.files?.[0] || null)}
              className="border rounded w-full py-2 px-3"
              accept=".pdf, .doc, .docx"
              required
            />
          </div>
          <button
            type="submit"
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors duration-300"
          >
            Send Proposal
          </button>
        </form>
        <button
          className="mt-4 text-gray-500 hover:text-gray-700"
          onClick={onClose}
        >
          Cancel
        </button>
      </div>
    </div>
  );
};

export default ProposalForm;
