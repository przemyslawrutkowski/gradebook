import React, { useState, useEffect } from "react";
import PageTitle from '../components/PageTitle';
import { Search, Plus } from 'lucide-react';
import Button from "../components/Button";
import SchoolYearCard from "../components/SchoolYearCard";
import CreateSchoolYearForm from "../components/forms/CreateSchoolYearForm";
import { getToken } from "../utils/UserRoleUtils";
import { validate as validateUUID } from 'uuid'; 
import ConfirmDeletionForm from "../components/forms/ConfirmDeletionForm";
import EditSchoolYearForm from "../components/forms/EditSchoolYearForm";

export function SchoolYears() {
  const [searchTerm, setSearchTerm] = useState("");
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

  const filteredSchoolYears = Array.isArray(schoolYears) ? schoolYears.filter(sy => 
    sy.name.toLowerCase().includes(searchTerm.toLowerCase())
  ) : [];

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
      <div className='flex flex-wrap justify-between mb-8'>
        <div className='w-full md:w-auto mb-4 md:mb-0'>
          <div className='flex gap-4 flex-wrap'>
            <div className="flex h-9 w-full sm:w-[calc(50%-8px)] md:w-56 items-center px-3 py-3 bg-white rounded border border-solid border-textBg-200 text-textBg-600">
              <Search size={20} className='mr-2 text-textBg-600' />
              <input
                type='text'
                placeholder='Search School Years'
                value={searchTerm}
                onChange={handleSearch}
                className="w-full focus:outline-none text-sm lg:text-base"
              />
            </div>
          </div>
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
          {filteredSchoolYears.length > 0 ? (
            filteredSchoolYears.map(sy => (
              <SchoolYearCard
                key={sy.id}
                id={sy.id}
                name={sy.name}
                startDate={sy.start_date}
                endDate={sy.end_date}
                onEdit={openEditModal}
                onDelete={openDeleteModal}
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

      <ConfirmDeletionForm
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
