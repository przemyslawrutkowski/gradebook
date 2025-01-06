import React, { useState, useEffect } from 'react';
import Button from '../../Button';
import Modal from '../../Modal';
import { X } from 'lucide-react';
import { getToken } from '../../../utils/UserRoleUtils';
import { validate as validateUUID } from 'uuid';
import { toast } from 'react-toastify';

const EditGradeForm = ({ grade, isOpen, onSuccess, onClose }) => {
  const [description, setDescription] = useState(grade.description);
  const [gradeValue, setGradeValue] = useState(grade.grade);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const token = getToken();

  useEffect(() => {
    if (grade) {
      setDescription(grade.description);
      setGradeValue(grade.grade);
    }
  }, [grade]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateUUID(grade.id)) {
      setError('Invalid UUID identifier.');
      toast.error('Invalid UUID identifier.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`http://localhost:3000/grade/${grade.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          description,
          grade: gradeValue,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Error: ${response.status}`);
      }
      const data = await response.json();

      onSuccess(data);
      toast.success(data.message || 'Grade edited successfully.');
    } catch (err) {
      setError(err.message || 'An error occurred while updating the grade.');
      toast.error(err.message || 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} widthHeightClassname="max-w-lg">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-textBg-700">Edit Grade</h2>
        <X size={24} className="hover:cursor-pointer" onClick={onClose} />
      </div>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label htmlFor="description" className="block text-textBg-700 mb-2">Description</label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
            className="w-full px-3 py-2 border rounded focus:outline-none focus:ring focus:border-blue-300"
            rows={3}
          />
        </div>

        <div className="mb-4">
          <label htmlFor="grade" className="block text-textBg-700 mb-2">Grade</label>
          <input
            type="number"
            id="grade"
            value={gradeValue}
            onChange={(e) => setGradeValue(Number(e.target.value))}
            required
            min="1"
            max="10"
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

export default EditGradeForm;
