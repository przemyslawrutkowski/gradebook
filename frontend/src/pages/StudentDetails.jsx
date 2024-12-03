import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import PageTitle from '../components/PageTitle';
import Button from "../components/Button";
import AssignParentForm from "../components/forms/AssignParentForm";
import ConfirmDeletionForm from "../components/forms/ConfirmDeletionForm";
import { 
  Fingerprint, 
  GraduationCap, 
  Link, 
  Mail, 
  Phone, 
  UserMinus 
} from "lucide-react";
import { getToken } from "../utils/UserRoleUtils";

function StudentDetails() {
  const { id } = useParams();
  const token = getToken();

  const [studentInfo, setStudentInfo] = useState(null);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchStudentInfo = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`http://localhost:3000/student/${id}`, {
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
      setStudentInfo(result.data);
    } catch (err) {
      setError(err.message || 'An error occurred while fetching student data.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudentInfo();
  }, [id]);

  const openAssignModal = () => setIsAssignModalOpen(true);
  const closeAssignModal = () => setIsAssignModalOpen(false);

  const openConfirmModal = () => setIsConfirmModalOpen(true);
  const closeConfirmModal = () => setIsConfirmModalOpen(false);

  const handleUnassignParent = async () => {
    setLoading(true);
    setError(null);
    try {
      const parentId = studentInfo.parents[0].id;
      const response = await fetch(`http://localhost:3000/student-parent/${id}/${parentId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });
      if (!response.ok) {
        throw new Error(`Error: ${response.status} ${response.statusText}`);
      }
      closeConfirmModal();
      fetchStudentInfo();
    } catch (err) {
      setError(err.message || 'An error occurred while unassigning the parent.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex-1 mt-12 lg:mt-0 lg:ml-64 pt-3 pb-8 px-6 sm:px-8">
      {loading && <p>Loading...</p>}
      {error && <p className="text-red-500">Error: {error}</p>}
      {studentInfo ? (
        <>
          <PageTitle text={`Details: ${studentInfo.first_name} ${studentInfo.last_name}`} />
          <div className="flex flex-col sm:border sm:border-solid sm:rounded sm:border-textBg-200 sm:p-8">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-8">
              <h2 className="text-lg sm:text-2xl font-semibold text-textBg-700 mb-2">
                {studentInfo.first_name} {studentInfo.last_name}
              </h2>
              {studentInfo.parents.length === 0 ? (
                <Button 
                  text="Assign Parent" 
                  icon={<Link size={16} />} 
                  size="m"
                  onClick={openAssignModal}
                />
              ) : (
                <div className="flex items-center justify-between">
                  <div className="text-textBg-700">
                    <p>{studentInfo.parents[0].first_name} {studentInfo.parents[0].last_name}</p>
                  </div>
                  <Button 
                    icon={<UserMinus size={20} />} 
                    size="m"
                    type="link"
                    onClick={openConfirmModal}
                  />
                </div>
              )}
            </div>
            <div className="flex flex-col 2xl:flex-row gap-16">
              <div className="flex flex-col gap-2 w-full 2xl:w-[30%]">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Mail size={20} color="#F37986"/>
                    <p className="text-textBg-550">Email</p>
                  </div>
                  <p>{studentInfo.email}</p>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Phone size={20} color="#F37986"/>
                    <p className="text-textBg-550">Phone</p>
                  </div>
                  <p>{studentInfo.phone_number}</p>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Fingerprint size={20} color="#F37986"/>
                    <p className="text-textBg-550">PESEL</p>
                  </div>
                  <p>{studentInfo.pesel}</p>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <GraduationCap size={20} color="#F37986"/>
                    <p className="text-textBg-550">Class</p>
                  </div>
                  <p>{studentInfo.className}</p>
                </div>
              </div>
            </div>  
          </div>
        </>
      ) : (
        !loading && <p>No student data available.</p>
      )}

      <AssignParentForm 
        isOpen={isAssignModalOpen}
        onSuccess={fetchStudentInfo}
        closeModal={closeAssignModal}
        studentId={id}
        studentName={`${studentInfo?.first_name || ''} ${studentInfo?.last_name || ''}`}
      />

      <ConfirmDeletionForm
        isOpen={isConfirmModalOpen}
        onClose={closeConfirmModal}
        onConfirm={handleUnassignParent}
        title="Confirm Deletion"
        description="Are you sure you want to unassign the parent? This action is irreversible."
      />
    </main>
  );
}

export default StudentDetails;
