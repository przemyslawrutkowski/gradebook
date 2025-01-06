import React, { useState, useEffect } from 'react';
import Modal from '../../Modal';
import Button from '../../Button';
import { getToken } from '../../../utils/UserRoleUtils';
import { toast } from 'react-toastify';

function FinalGradeForm({ 
  isOpen, 
  onClose, 
  onSuccess, 
  studentId, 
  teacherId, 
  subjectId, 
  semesterId,
  existingFinalGrade
}) {
  const [grade, setGrade] = useState('');
  const [loading, setLoading] = useState(false);

  const token = getToken();

  useEffect(() => {
    if (existingFinalGrade) {
      setGrade(existingFinalGrade.grade);
    } else {
      setGrade('');
    }
  }, [existingFinalGrade]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (!grade) {
      toast.error('Please enter a grade.');
      setLoading(false);
      return;
    }

    if (grade < 1 || grade > 6) {
      toast.error('Grade must be between 1 and 6.');
      setLoading(false);
      return;
    }

    if (!semesterId || !subjectId || !teacherId) {
      toast.error('Please ensure all required fields are selected.');
      setLoading(false);
      return;
    }

    try {
      const url = existingFinalGrade 
        ? `http://localhost:3000/grade/final/${existingFinalGrade.id}`
        : 'http://localhost:3000/grade/final';
      
      const method = existingFinalGrade ? 'PATCH' : 'POST';

      const response = await fetch(url, {
        method: method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          grade: Number(grade),
          studentId,
          subjectId,
          teacherId,
          semesterId,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Error: ${response.status}`);
      }

      const data = await response.json();
      toast.success(existingFinalGrade ? 'Final grade updated successfully.' : 'Final grade added successfully.');
      onSuccess(data);
      handleClose();
    } catch (err) {
      toast.error(err.message || 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setGrade('');
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} widthHeightClassname="max-w-2xl">
      <h2 className="text-xl font-bold mb-4">{existingFinalGrade ? 'Edit Final Grade' : 'Add Final Grade'}</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="grade" className="block text-sm font-medium text-gray-700">
            Final Grade
          </label>
          <input
            type="number"
            id="grade"
            name="grade"
            min="1"
            max="6"
            value={grade}
            onChange={(e) => setGrade(e.target.value)}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:border-textBg-500"
            placeholder="Enter grade (1-6)"
            required
          />
        </div>

        {loading && <div className="text-blue-500">Submitting final grade...</div>}

        <div className="flex justify-end gap-2">
          <Button type="secondary" text="Cancel" onClick={handleClose} />
          <Button type="primary" text={existingFinalGrade ? "Update" : "Submit"} disabled={loading || !grade} />
        </div>
      </form>
    </Modal>
  );
}

export default FinalGradeForm;
