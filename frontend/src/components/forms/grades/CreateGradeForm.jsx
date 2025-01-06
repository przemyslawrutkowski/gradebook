import React, { useState } from 'react';
import Modal from '../../Modal';
import Button from '../../Button';
import { getToken } from '../../../utils/UserRoleUtils';
import { toast } from 'react-toastify';

function CreateGradeForm({ isOpen, onClose, onSuccess, students, lessonId, subjectId, teacherId }) {
  const [description, setDescription] = useState('');
  const [weight, setWeight] = useState('');
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
  
    if (weight === '') {
      toast.error('Please enter the weight.');
      setLoading(false);
      return;
    }

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
            weight: Number(weight),
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
      handleClose();
      toast.success('Grades added successfully.');
    } catch (err) {
      toast.error(err.message || 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setDescription('');
    setWeight('');
    setGrades({});
    setError(null);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} widthHeightClassname="max-w-2xl">
      <h2 className="text-xl font-bold mb-4">Add Grades</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex flex-col gap-2">
          <label className="text-base text-textBg-700" htmlFor="description">Description</label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
            className="w-full text-textBg-900 px-3 py-2 border min-h-16 border-textBg-200 rounded text-base focus:outline-none focus:border-textBg-500"
            placeholder="Description..."
          />
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-base text-textBg-700" htmlFor="description">Weight</label>
          <input
            type="number"
            min="1"
            max="3"
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
            required
            className="w-full text-textBg-900 px-3 py-2 border border-textBg-200 rounded text-base focus:outline-none focus:border-textBg-500"
            placeholder="Enter grade weight"
          />
        </div>
        <div>
          <label className="text-base text-textBg-700">Students</label>
          <div className="mt-2 space-y-2 max-h-60 overflow-y-auto custom-scrollbar">
            {students.map(student => (
              <div key={student.id} className="flex items-center justify-between">
                <p className='text-sm'>{student.first_name} {student.last_name}</p>
                <input
                  type="number"
                  min="1"
                  max="6"
                  value={grades[student.id] || ''}
                  onChange={(e) => handleGradeChange(student.id, e.target.value)}
                  className="w-24 text-textBg-900 px-3 py-2 border border-textBg-200 rounded text-base focus:outline-none focus:border-textBg-500"
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
