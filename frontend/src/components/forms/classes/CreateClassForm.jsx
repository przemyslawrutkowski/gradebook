import React, { useState, useEffect } from "react";
import Button from "../../Button";
import { getToken } from '../../../utils/UserRoleUtils';
import Modal from "../../Modal";
import { X } from "lucide-react";
import { toast } from "react-toastify";

function CreateClassForm({ onSuccess, isOpen, closeModal}) {
  const [classNames, setClassNames] = useState([]);
  const [schoolYears, setSchoolYears] = useState([]);

  const [classNameId, setClassNameId] = useState('');
  const [schoolYearId, setSchoolYearId] = useState('');

  const [loading, setLoading] = useState(false);

  const token = getToken();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);

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
        toast.error(err.message || 'An unexpected error occurred.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [token]);

  const handleCreate = async (e) => {
    e.preventDefault();
    setLoading(true);

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

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create class.');
      }

      const data = await response.json();

      onSuccess(data); 
      toast.success(data.message || 'Class created successfully.'); 
    } catch (err) {
      toast.error(err.message || 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={closeModal} widthHeightClassname="max-w-lg">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-textBg-700">Create New Class</h2>
        <X size={24} className="hover:cursor-pointer" onClick={closeModal}/>
      </div>
      <form className="flex flex-col gap-6" onSubmit={handleCreate}>
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
            <option value="" disabled hidden>Select Class Name</option>
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
            <option value="" disabled hidden>Select School Year</option>
            {schoolYears.map((year) => (
              <option key={year.id} value={year.id}>{year.name}</option>
            ))}
          </select>
        </div>

        <div className="flex justify-end gap-4">
          <Button
            text="Cancel"
            type="secondary"
            onClick={closeModal}
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
    </Modal>
  );
}

export default CreateClassForm;
