import React, { useState } from 'react';
import Button from '../../Button';
import { validate as validateUUID } from 'uuid';
import Modal from '../../Modal';
import { X } from 'lucide-react';
import { getToken } from '../../../utils/UserRoleUtils';
import { toast } from 'react-toastify';

const EditSubjectForm = ({ id, currentName, isOpen, onSuccess, onClose}) => {
  const [name, setName] = useState(currentName);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const token = getToken();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateUUID(id)) {
      setError('Invalid UUID identifier.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`http://localhost:3000/subject/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ name }),
      });

      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }
      const data = await response.json();

      onSuccess(data);
      toast.success(data.message || 'Class name deleted successfully.');
    } catch (err) {
      setError(err.message);
      toast.error(err.message || 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} widthHeightClassname="max-w-lg">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-textBg-700">Edit Subject</h2>
        <X size={24} className="hover:cursor-pointer" onClick={onClose} />
      </div>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label htmlFor="name" className="block text-textBg-700 mb-2">Subject</label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="w-full px-3 py-2 border rounded focus:outline-none focus:ring focus:border-blue-300"
          />
        </div>
        <div className="flex justify-end space-x-2">
          <Button
            type="secondary"
            btnType="button"
            text="Cancel"
            onClick={onClose}
          />
          <Button
            btnType="submit"
            text={loading ? "Updating..." : "Update"}
            disabled={loading}
          />
        </div>
      </form>
    </Modal>
  );
};

export default EditSubjectForm;
