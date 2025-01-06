import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import PageTitle from '../components/PageTitle';
import Button from "../components/Button";
import { Calendar, Plus } from "lucide-react";
import { getToken } from "../utils/UserRoleUtils";
import SchoolYearAndSemesterCard from "../components/SchoolYearAndSemesterCard";
import { validate as validateUUID } from 'uuid';
import CreateSemesterForm from "../components/forms/semesters/CreateSemesterForm";
import EditSemesterForm from "../components/forms/semesters/EditSemester"; 
import ConfirmForm from '../components/forms/ConfirmForm';
import { toast } from 'react-toastify'

function SchoolYearDetails() {
  const [schoolYearInfo, setSchoolYearInfo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [editingSemester, setEditingSemester] = useState(null);
  const [semesterToDelete, setSemesterToDelete] = useState(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const { id } = useParams();
  const token = getToken();

  const fetchSchoolYearInfo = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`http://localhost:3000/school-year/${id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        }
      });
      if (!response.ok) {
        throw new Error(`Error: ${response.status} ${response.statusText}`);
      }
      const result = await response.json();
      setSchoolYearInfo(result.data);
    } catch (err) {
      toast.error(err.message || 'An unexpected error occurred.');
      setError(err.message || 'An error occurred while fetching school year data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSchoolYearInfo();
  }, [id]);

  const openCreateModal = () => setIsCreateModalOpen(true);
  const closeCreateModal = () => setIsCreateModalOpen(false);

  const openEditModal = (semester) => {
    if(!validateUUID(semester.id)){
      return;
    }
    setEditingSemester(semester);
    setIsEditModalOpen(true);
  };

  const closeEditModal = () => {
    setEditingSemester(null);
    setIsEditModalOpen(false);
  };

  const openDeleteModal = (id) => {
    if(!validateUUID(id)){
      return;
    }
    setSemesterToDelete(id);
    setIsDeleteModalOpen(true);
  }

  const closeDeleteModal = () => {
    setSemesterToDelete(null);
    setIsDeleteModalOpen(false);
  };

  const handleConfirmDelete = async () => {
    if (!semesterToDelete) return;

    try {
      const response = await fetch(`http://localhost:3000/semester/${semesterToDelete}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });
      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }
      const data = await response.json();

      fetchSchoolYearInfo();
      toast.success(data.message || 'Semester deleted successfully.');
    } catch (err) {
      setError(err.message || 'An error occurred while deleting the semester.');
      toast.error(err.message || 'An unexpected error occurred.');
    } finally {
      closeDeleteModal();
    }
  };

  return (
    <main className="flex-1 mt-12 lg:mt-0 lg:ml-64 pt-3 pb-8 px-6 sm:px-8">
      {loading && <p>Loading...</p>}
      {schoolYearInfo ? (
        <>
          <PageTitle text={`School Year Details`} />
          <div className="flex flex-col sm:border sm:border-solid sm:rounded sm:border-textBg-200 sm:p-8">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-8">
              <div className="flex flex-col gap-2">
                  <p className="text-lg sm:text-2xl font-semibold text-textBg-700">
                      {schoolYearInfo.name}
                  </p> 
                  <div className="flex text-textBg-600 items-center gap-2">
                      <Calendar size={16} />
                      <p className="text-sm">
                          {new Date(schoolYearInfo.start_date).toLocaleDateString()} - {new Date(schoolYearInfo.end_date).toLocaleDateString()}
                      </p>
                  </div>
              </div>
              <Button icon={<Plus size={16}/>} text="Create Semester" onClick={openCreateModal} className="mt-4"/>
            </div>
            <div className="flex flex-col gap-4">
                {schoolYearInfo.semesters && schoolYearInfo.semesters.length > 0 ? (
                  schoolYearInfo.semesters.map((semester) => (
                    <SchoolYearAndSemesterCard 
                      key={semester.id}
                      id={semester.id}
                      name={semester.semester}
                      startDate={semester.start_date}
                      endDate={semester.end_date}
                      onEdit={() => openEditModal(semester)}
                      onDelete={() => openDeleteModal(semester.id)}
                    />
                  ))
                ) : (
                  <p>No semesters available for this school year.</p>
                )}
            </div>
          </div>
        </>
      ) : (
        !loading && <p>No school year data available.</p>
      )}

      <CreateSemesterForm 
        isOpen={isCreateModalOpen}
        onSuccess={() =>{
            fetchSchoolYearInfo();
            closeCreateModal();
        }}
        onClose={closeCreateModal}
        schoolYearId={id}
      />

      {editingSemester && (
        <EditSemesterForm 
            isOpen={isEditModalOpen}
            onClose={closeEditModal}
            id={editingSemester.id}
            currentSemester={editingSemester.semester}
            currentStartDate={editingSemester.start_date}
            currentEndDate={editingSemester.end_date}
            onSuccess={() =>{
                fetchSchoolYearInfo();
                closeEditModal();
            }}
        />
      )}

      <ConfirmForm
          isOpen={isDeleteModalOpen}
          onClose={closeDeleteModal}
          onConfirm={handleConfirmDelete}
          title="Confirm Deletion"
          description="Are you sure you want to delete this semester? This action is irreversible."
      />
    </main>
  );
}

export default SchoolYearDetails;
