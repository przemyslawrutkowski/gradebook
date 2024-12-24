import React, { useState, useEffect } from 'react';
import Button from "../../Button";
import { X } from 'lucide-react';
import Modal from '../../Modal';
import { getToken } from '../../../utils/UserRoleUtils';
import { toast } from 'react-toastify';

const formatDate = (date) => {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = (`0${d.getMonth() + 1}`).slice(-2);
    const day = (`0${d.getDate()}`).slice(-2);
    return `${year}-${month}-${day}`;
  };

function EditHomeworkForm({ onSuccess, onClose, isOpen, homework }) {
  const [description, setDescription] = useState('');
  const [deadline, setDeadline] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const token = getToken();

  useEffect(() => {
    if (homework) {
      setDescription(homework.description);
      setDeadline(formatDate(homework.deadline)); // Format to YYYY-MM-DD
    }
  }, [homework]);

  const handleEdit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
  
    try {
      const response = await fetch(`http://localhost:3000/homework/${homework.id}`, { // Ensure the endpoint matches your backend
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`, 
        },
        body: JSON.stringify({ description, deadline }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Error: ${response.status}`);
      }
  
      const result = await response.json();
      onSuccess(result.data);
      onClose(); 
      toast.success("Homework updated successfully!");
    } catch (err) {
      setError(err.message || 'An error occurred.');
      toast.error(`Update failed: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  if (!homework) {
    return null;
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} widthHeightClassname="max-w-lg">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-textBg-700">Edit Homework</h2>
        <X size={24} className="hover:cursor-pointer" onClick={onClose}/>
      </div>
      <form className="flex flex-col gap-6" onSubmit={handleEdit}>
        {error && <p className="text-red-500">{error}</p>}
        
        <div className="flex flex-col gap-2">
          <label className="text-base text-textBg-700" htmlFor="description">Description</label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
            className="w-full text-textBg-900 px-3 py-2 border border-textBg-200 rounded text-base focus:outline-none focus:border-textBg-500"
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
            text={loading ? "Saving..." : "Save Changes"}
            type="primary"
            disabled={loading}
            className="px-4 py-2"
          />
        </div>
      </form>
    </Modal>
  );
}

export default EditHomeworkForm;