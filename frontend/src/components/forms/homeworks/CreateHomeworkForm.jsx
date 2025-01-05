import React, { useState, useEffect } from 'react';
import Button from "../../Button";
import { X } from 'lucide-react';
import Modal from '../../Modal';
import { getToken } from '../../../utils/UserRoleUtils';

function CreateHomeworkForm({ onSuccess, onClose, isOpen, lessonId }) {
  const [description, setDescription] = useState('');
  const [deadline, setDeadline] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const token = getToken();

  const handleCreate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
  
    try {
      const response = await fetch('http://localhost:3000/homework', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`, 
        },
        body: JSON.stringify({ description, deadline, lessonId }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Error: ${response.status}`);
      }
  
      onSuccess(); 
      onClose(); 
    } catch (err) {
      setError(err.message || 'An error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} widthHeightClassname="max-w-lg">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-textBg-700">Create Homework</h2>
        <X size={24} className="hover:cursor-pointer" onClick={onClose}/>
      </div>
      <form className="flex flex-col gap-6" onSubmit={handleCreate}>
        {error && <p className="text-red-500">{error}</p>}
        
        <div className="flex flex-col gap-2">
          <label className="text-base text-textBg-700" htmlFor="description">Description</label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
            className="w-full text-textBg-900 px-3 py-2 border min-h-16 border-textBg-200 rounded text-base focus:outline-none focus:border-textBg-500"
            placeholder="Homework description..."
          />
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-base text-textBg-700" htmlFor="deadline">Deadline</label>
          <input
            id="deadline"
            type="date"
            value={deadline}
            onChange={(e) => setDeadline(e.target.value)}
            required
            className="w-full text-textBg-900 px-3 py-2 border border-textBg-200 rounded text-base focus:outline-none focus:border-textBg-500"
          />
        </div>

        <div className="flex justify-end gap-4">
          <Button
            text="Cancel"
            type="secondary"
            onClick={onClose}
            className="px-4 py-2"
          />
          <Button
            text={loading ? "Creating..." : "Create"}
            type="primary"
            disabled={loading}
            className="px-4 py-2"
          />
        </div>
      </form>
    </Modal>
  );
}

export default CreateHomeworkForm;
