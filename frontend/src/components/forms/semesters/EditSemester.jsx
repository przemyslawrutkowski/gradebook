import React, { useState, useEffect } from 'react';
import Button from '../../Button';
import { validate as validateUUID } from 'uuid';
import Modal from '../../Modal';
import { X } from 'lucide-react';
import { getToken } from '../../../utils/UserRoleUtils';

const EditSemesterForm = ({ id, currentSemester, currentStartDate, currentEndDate, isOpen, onSuccess, onClose }) => {
  const [semester, setSemester] = useState(currentSemester);
  const [startDate, setStartDate] = useState(currentStartDate);
  const [endDate, setEndDate] = useState(currentEndDate);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const token = getToken();

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    if (isNaN(date)) return '';
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  useEffect(() => {
    setSemester(currentSemester);
    setStartDate(formatDate(currentStartDate));
    setEndDate(formatDate(currentEndDate));
  }, [currentSemester, currentStartDate, currentEndDate]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateUUID(id)) {
      setError('Invalid UUID identifier.');
      return;
    }

    const semesterNumber = parseInt(semester, 10);
    if (isNaN(semesterNumber) || semesterNumber <= 0) {
      setError('Semester must be a positive number.');
      return;
    }

    if (new Date(startDate) >= new Date(endDate)) {
      setError('Start Date must be before End Date.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`http://localhost:3000/semester/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ 
          semester: semesterNumber, 
          startDate, 
          endDate 
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Error: ${response.status}`);
      }

      const data = await response.json();
      onSuccess(data);
      onClose();
    } catch (err) {
      setError(err.message || 'An error occurred while updating the semester.');
    } finally {
      setLoading(false);
    }
  }; 

  return (
    <Modal isOpen={isOpen} onClose={onClose} widthHeightClassname="max-w-lg">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-textBg-700">Edit Semester</h2>
        <X size={24} className="hover:cursor-pointer" onClick={onClose}/>
      </div>
      <form className="flex flex-col gap-6" onSubmit={handleSubmit}>
        {error && <p className="text-red-500">{error}</p>}

        <div className="flex flex-col gap-2">
          <label className="text-base text-textBg-700" htmlFor="semesterNumber">Semester Number</label>
          <input
            id="semesterNumber"
            type="number"
            value={semester}
            onChange={(e) => setSemester(e.target.value)}
            required
            min="1"
            className="w-full text-textBg-900 px-3 py-2 border border-textBg-200 rounded text-base focus:outline-none focus:border-textBg-500"
            placeholder="e.g., 1"
          />
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-base text-textBg-700" htmlFor="startDate">Start Date</label>
          <input
            id="startDate"
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            required
            className="w-full text-textBg-900 px-3 py-2 border border-textBg-200 rounded text-base focus:outline-none focus:border-textBg-500"
            placeholder="Select start date"
          />
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-base text-textBg-700" htmlFor="endDate">End Date</label>
          <input
            id="endDate"
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            min={startDate}
            required
            className="w-full text-textBg-900 px-3 py-2 border border-textBg-200 rounded text-base focus:outline-none focus:border-textBg-500"
            placeholder="Select end date"
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
            text={loading ? "Saving..." : "Save"}
            type="primary"
            disabled={loading}
            className="px-4 py-2"
            btnType="submit" 
          />
        </div>
      </form>
    </Modal>
  );
};

export default EditSemesterForm;
