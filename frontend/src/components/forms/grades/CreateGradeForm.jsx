import React, { useState } from 'react';
import Modal from '../../Modal';
import Button from '../../Button';
import { getToken } from '../../../utils/UserRoleUtils';

function CreateGradeForm({ isOpen, onClose, onSuccess, students, lessonId, subjectId, teacherId }) {
  const [description, setDescription] = useState('');
  const [grades, setGrades] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const token = getToken();

  const handleGradeChange = (studentId, value) => {
    setGrades(prevGrades => ({
      ...prevGrades,
      [studentId]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
  
    try {
      const gradePromises = Object.entries(grades).map(async ([studentId, grade]) => {
        if (grade === '') return null;
  
        const response = await fetch('http://localhost:3000/grade', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({
            description,
            grade: Number(grade),
            studentId,
            subjectId,
            teacherId,
          }),
        });
  
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || `Error: ${response.status}`);
        }
  
        return response.json();
      });
  
      await Promise.all(gradePromises);
  
      onSuccess();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setDescription('');
    setGrades({});
    setError(null);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} widthHeightClassname="max-w-2xl">
      <h2 className="text-xl font-bold mb-4">Add Grades</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Description</label>
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
            className="mt-1 block w-full border border-gray-300 rounded-md p-2"
            placeholder="Enter grade description"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Students</label>
          <div className="mt-2 space-y-2 max-h-60 overflow-y-auto custom-scrollbar">
            {students.map(student => (
              <div key={student.id} className="flex items-center justify-between">
                <span>{student.first_name} {student.last_name}</span>
                <input
                  type="number"
                  min="1"
                  max="100"
                  value={grades[student.id] || ''}
                  onChange={(e) => handleGradeChange(student.id, e.target.value)}
                  className="w-20 border border-gray-300 rounded-md p-1"
                  placeholder="Grade"
                />
              </div>
            ))}
          </div>
        </div>

        {error && <div className="text-red-500">Error: {error}</div>}
        {loading && <div className="text-blue-500">Submitting grades...</div>}

        <div className="flex justify-end gap-2">
          <Button type="secondary" text="Cancel" onClick={handleClose} />
          <Button type="primary" text="Submit" disabled={loading} />
        </div>
      </form>
    </Modal>
  );
}

export default CreateGradeForm;
