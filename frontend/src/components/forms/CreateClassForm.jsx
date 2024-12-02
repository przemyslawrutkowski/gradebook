import React, { useState, useEffect } from "react";
import Button from "../Button";
import { getToken } from '../../utils/UserRoleUtils';

function CreateClassForm({ onSuccess, onClose }) {
  const [classNames, setClassNames] = useState([]);
  const [schoolYears, setSchoolYears] = useState([]);

  const [classNameId, setClassNameId] = useState('');
  const [schoolYearId, setSchoolYearId] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const token = getToken();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);

      try {
        const [classNamesRes, schoolYearsRes] = await Promise.all([
          fetch('http://localhost:3000/class-name', {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`, 
            },
          }),
          fetch('http://localhost:3000/school-year', {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`, 
            },
          }),
        ]);

        if (!classNamesRes.ok || !schoolYearsRes.ok) {
          throw new Error('Failed to fetch form data.');
        }

        const classNamesData = await classNamesRes.json();
        const schoolYearsData = await schoolYearsRes.json();

        setClassNames(classNamesData.data || []);
        setSchoolYears(schoolYearsData.data || []);
      } catch (err) {
        console.error('Error fetching data for form:', err);
        setError('Failed to load form data. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [token]);

  const handleCreate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (!classNameId || !schoolYearId) {
      setError('All fields are required.');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('http://localhost:3000/class', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`, 
        },
        body: JSON.stringify({ 
          classNameId,
          schoolYearId,

        }),
      });

      if (response.status === 200 || response.status === 201) { 
        const data = await response.json();
        onSuccess(data); 
        onClose();   
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Failed to create class.');
      }
    } catch (err) {
      console.error('Error creating class:', err);
      if (err.name === 'TypeError') {

        setError('Network error. Please check your connection and try again.');
      } else if (err.response && err.response.data && err.response.data.errors) {

        const errorMessages = err.response.data.errors.map(error => error.msg).join(', ');
        setError(errorMessages);
      } else if (err.response && err.response.data && err.response.data.message) {
        setError(err.response.data.message);
      } else {
        setError('An unexpected error occurred while creating the class.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="flex flex-col gap-6" onSubmit={handleCreate}>
      {error && <p className="text-red-500">{error}</p>}
      {loading && <p className="text-gray-500">Loading...</p>}

      <div className="flex flex-col gap-2">
        <label className="text-base text-textBg-700" htmlFor="className">Class Name</label>
        <select
          id="className"
          value={classNameId}
          onChange={(e) => setClassNameId(e.target.value)}
          required
          className="w-full text-textBg-900 px-3 py-2 border border-textBg-200 rounded text-base focus:outline-none focus:border-textBg-500"
        >
          <option value="" disabled>Select Class Name</option>
          {classNames.map((clsName) => (
            <option key={clsName.id} value={clsName.id}>{clsName.name}</option>
          ))}
        </select>
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-base text-textBg-700" htmlFor="schoolYear">School Year</label>
        <select
          id="schoolYear"
          value={schoolYearId}
          onChange={(e) => setSchoolYearId(e.target.value)}
          required
          className="w-full text-textBg-900 px-3 py-2 border border-textBg-200 rounded text-base focus:outline-none focus:border-textBg-500"
        >
          <option value="" disabled>Select School Year</option>
          {schoolYears.map((year) => (
            <option key={year.id} value={year.id}>{year.name}</option>
          ))}
        </select>
      </div>

      <div className="flex justify-end gap-4">
        <Button
          text="Cancel"
          type="secondary"
          onClick={onClose}
          className="px-4 py-2"
          btnType="button" 
        />
        <Button
          text={loading ? "Creating..." : "Create"}
          type="primary"
          disabled={loading}
          className="px-4 py-2"
          btnType="submit"
        />
      </div>
    </form>
  );
}

export default CreateClassForm;
