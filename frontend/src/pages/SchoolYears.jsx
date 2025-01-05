import React, { useState, useEffect, useMemo } from "react";
import PageTitle from '../components/PageTitle';
import { Search, Plus } from 'lucide-react';
import Button from "../components/Button";
import SchoolYearAndSemesterCard from "../components/SchoolYearAndSemesterCard";
import CreateSchoolYearForm from "../components/forms/schoolyears/CreateSchoolYearForm";
import { getToken } from "../utils/UserRoleUtils";
import { validate as validateUUID } from 'uuid'; 
import ConfirmForm from '../components/forms/ConfirmForm';
import EditSchoolYearForm from "../components/forms/schoolyears/EditSchoolYearForm";

export function SchoolYears() {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOption, setSortOption] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [editingSchoolYear, setEditingSchoolYear] = useState(null);
  const [schoolYearToDelete, setSchoolYearToDelete] = useState(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const [schoolYears, setSchoolYears] = useState([]);
  const token = getToken();

  const fetchSchoolYears = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('http://localhost:3000/school-year',{
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        }
      });
      if(!response.ok){
        throw new Error(`Error: ${response.status}`);
      }
      const result = await response.json();
      setSchoolYears(result.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSchoolYears();
  }, []);

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleSortChange = (e) => {
    setSortOption(e.target.value);
  };

  const filteredAndSortedSchoolYears = useMemo(() => {
    const filtered = Array.isArray(schoolYears) ? schoolYears.filter(sy => 
      sy.name.toLowerCase().includes(searchTerm.toLowerCase())
    ) : [];

    const sorted = [...filtered].sort((a, b) => {

      if (sortOption === 'startDate-asc') {
        return new Date(a.start_date) - new Date(b.start_date);
      } else if (sortOption === 'startDate-desc') {
        return new Date(b.start_date) - new Date(a.start_date);
      } else {
        return 0;
      }
    });

    return sorted;
  }, [searchTerm, sortOption, schoolYears]);

  const openCreateModal = () => setIsCreateModalOpen(true);
  const closeCreateModal = () => setIsCreateModalOpen(false);

  const openEditModal = (id, name, startDate, endDate) => {
    if(!validateUUID(id)){
      return;
    }
    setEditingSchoolYear({id, name, startDate, endDate});
    setIsEditModalOpen(true);
  };

  const closeEditModal = () => {
    setEditingSchoolYear(null);
    setIsEditModalOpen(false);
  };

  const openDeleteModal = (id) => {
    if(!validateUUID(id)){
      return;
    }
    setSchoolYearToDelete(id);
    setIsDeleteModalOpen(true);
  }

  const closeDeleteModal = () => {
    setSchoolYearToDelete(null);
    setIsDeleteModalOpen(false);
  };

  const handleConfirmDelete = async () => {
    if (!schoolYearToDelete) return;

    try {
      const response = await fetch(`http://localhost:3000/school-year/${schoolYearToDelete}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });
      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }
      setSchoolYears(prev => prev.filter(cls => cls.id !== schoolYearToDelete));
    } catch (err) {
      setError(err.message);
    } finally {
      closeDeleteModal();
    }
  };

  return (
    <main className="flex-1 mt-12 lg:mt-0 lg:ml-64 pt-3 pb-8 px-6 sm:px-8">
      <PageTitle text="School Years"/>
      <div className='flex flex-col md:flex-row gap-4 flex-wrap mb-6 justify-between'>
        <div className="flex flex-col tn:flex-row items-center gap-4">
          <div className="flex h-9 w-full md:w-64 items-center px-3 py-2 bg-white rounded border border-solid border-textBg-200 text-textBg-600">
            <Search size={20} className='mr-2 text-textBg-600' />
            <input
              type='text'
              placeholder='Search by name'
              value={searchTerm}
              onChange={handleSearch}
              className="w-full focus:outline-none lg:text-base placeholder:text-textBg-600"
            />
          </div>

          <select
            value={sortOption}
            onChange={handleSortChange}
            className="h-9 w-full md:w-56 px-3 bg-white rounded border border-solid border-textBg-200 text-textBg-600 focus:outline-none"
          >
            <option value="" disabled hidden>Sort By</option>
            <option value="startDate-asc">Start Date (Asc)</option>
            <option value="startDate-desc">Start Date (Desc)</option>
          </select>
        </div>
        <div className='w-full md:w-auto'>
          <Button
            size="m"
            icon={<Plus size={16} />}
            text="Create School Year"
            className='w-full md:w-auto'
            type="primary"
            onClick={openCreateModal}
          />
        </div>
      </div>

      {loading ? (
        <p className="text-textBg-900 text-lg">Loading...</p>
      ) : error ? (
        <p className="text-red-500">{error}</p>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filteredAndSortedSchoolYears.length > 0 ? (
            filteredAndSortedSchoolYears.map(sy => (
              <SchoolYearAndSemesterCard
                key={sy.id}
                id={sy.id}
                name={sy.name}
                startDate={sy.start_date}
                endDate={sy.end_date}
                onEdit={openEditModal}
                onDelete={openDeleteModal}
                link={`/school-years/${sy.id}`}
              />
            ))
          ) : (
            <p className="text-textBg-900 text-lg">No school years found.</p>
          )}
        </div>
      )}

      <CreateSchoolYearForm
        isOpen={isCreateModalOpen}
        onSuccess={() => {
          fetchSchoolYears();
          closeCreateModal();
        }}
        onClose={closeCreateModal}
      />

      {editingSchoolYear && (
        <EditSchoolYearForm
          isOpen={isEditModalOpen}
          onClose={closeEditModal}
          id={editingSchoolYear.id}
          currentName={editingSchoolYear.name}
          currentStartDate={editingSchoolYear.startDate}
          currentEndDate={editingSchoolYear.endDate}
          onSuccess={() => {
            fetchSchoolYears();
            closeEditModal();
          }}
        />
      )}

      <ConfirmForm
        isOpen={isDeleteModalOpen}
        onClose={closeDeleteModal}
        onConfirm={handleConfirmDelete}
        title="Confirm Deletion"
        description="Are you sure you want to delete this school year? This action is irreversible."
      />
    </main>
  );
}

export default SchoolYears;
