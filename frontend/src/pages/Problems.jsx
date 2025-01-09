import React, { useState, useEffect } from "react";
import Button from "../components/Button"; 
import PageTitle from "../components/PageTitle";
import CreateProblemTypeModal from "../components/forms/problemtype/CreateProblemTypeForm";
import CreateStatusModal from "../components/forms/statuses/CreateStatusForm";
import EditProblemTypeForm from "../components/forms/problemtype/EditProblemTypeForm";
import EditStatusForm from "../components/forms/statuses/EditStatusForm";
import ConfirmForm from "../components/forms/ConfirmForm"; 
import { getToken, getUserId, getUserRole } from "../utils/UserRoleUtils";
import { toast } from "react-toastify";
import UserRoles from '../data/userRoles';
import { Pen, Plus, Trash } from 'lucide-react';
import { formatDate } from "../utils/dateTimeUtils";
import UpdateProblemStatusForm from "../components/forms/problems/UpdateProblemStatusForm";

export function Problems() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isCreateTypeModalOpen, setIsCreateTypeModalOpen] = useState(false);
  const [isCreateStatusModalOpen, setIsCreateStatusModalOpen] = useState(false);
  const [isEditTypeModalOpen, setIsEditTypeModalOpen] = useState(false);
  const [isDeleteTypeConfirmOpen, setIsDeleteTypeConfirmOpen] = useState(false);
  const [isEditStatusModalOpen, setIsEditStatusModalOpen] = useState(false);
  const [isDeleteStatusConfirmOpen, setIsDeleteStatusConfirmOpen] = useState(false);
  const [problems, setProblems] = useState([]);
  const [problemTypes, setProblemTypes] = useState([]);
  
  const [description, setDescription] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [reportLoading, setReportLoading] = useState(false);
  const [reportError, setReportError] = useState(null);
  const [activeTab, setActiveTab] = useState('problems');
  const [userTypes, setUserTypes] = useState([]);
  const [userTypeId, setUserTypeId] = useState(null);
  const [statuses, setStatuses] = useState([]);

  const [currentEditType, setCurrentEditType] = useState(null);
  const [currentDeleteType, setCurrentDeleteType] = useState(null);
  const [currentEditStatus, setCurrentEditStatus] = useState(null);
  const [currentDeleteStatus, setCurrentDeleteStatus] = useState(null);
  const [isDeleteProblemConfirmOpen, setIsDeleteProblemConfirmOpen] = useState(false);
  const [currentDeleteProblem, setCurrentDeleteProblem] = useState(null);
  const [isUpdateStatusModalOpen, setIsUpdateStatusModalOpen] = useState(false);
  const [currentUpdateProblem, setCurrentUpdateProblem] = useState(null);

  const token = getToken();
  const userRole = getUserRole();

  const fetchUserTypes = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:3000/user-type', { 
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`, 
        },
      });
      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }
      const result = await response.json();
      setUserTypes(result.data);
      
      const currentUserType = result.data.find(type => type.name === userRole);
      if (currentUserType) {
        setUserTypeId(currentUserType.id);
      }
    } catch (err) {
      toast.error(err.message || 'An unexpected error occurred.');
      setError(err.message || 'An unexpected error occurred.');
    } finally {
      setLoading(false); 
    }
  };

  const fetchStatuses = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:3000/status', { 
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`, 
        },
      });
      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }
      const result = await response.json();
      setStatuses(result.data);
    } catch (err) {
      toast.error(err.message || 'An unexpected error occurred.');
      setError(err.message || 'An unexpected error occurred.');
    } finally {
      setLoading(false); 
    }
  };

  const fetchProblems = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:3000/problem', { 
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`, 
        },
      });
      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }
      const result = await response.json();
      console.log(result.data);
      setProblems(result.data);
    } catch (err) {
      toast.error(err.message || 'An unexpected error occurred.');
      setError(err.message || 'An unexpected error occurred.');
    } finally {
      setLoading(false); 
    }
  };

  const fetchProblemTypes = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:3000/problem-type', { 
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`, 
        },
      });
      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }
      const result = await response.json();
      setProblemTypes(result.data);
    } catch (err) {
      toast.error(err.message || 'An unexpected error occurred.');
      setError(err.message || 'An unexpected error occurred.');
    } finally {
      setLoading(false); 
    }
  };

  useEffect(() => {
    if (userRole === UserRoles.Administrator) {
      fetchProblems();
      fetchProblemTypes();
      fetchStatuses();
    } else {
      fetchProblemTypes(); 
      fetchUserTypes();
    }
  }, []);

  const handleOpenCreateTypeModal = () => {
    setIsCreateTypeModalOpen(true);
  };

  const handleCloseCreateTypeModal = () => {
    setIsCreateTypeModalOpen(false);
  };

  const handleOpenCreateStatusModal = () => {
    setIsCreateStatusModalOpen(true);
  };

  const handleCloseCreateStatusModal = () => {
    setIsCreateStatusModalOpen(false);
  };

  const handleSuccessCreateType = () => {
    fetchProblemTypes();
  };

  const handleSuccessCreateStatus = () => {
    fetchStatuses();
  };

  const handleReportSubmit = async (e) => {
    e.preventDefault();
    setReportLoading(true);
    setReportError(null);

    if (!selectedType) {
        setError('Please select a problem type.');
        setReportLoading(false);
        toast.error('Please select a problem type');
        return;
    }

    try {
        const response = await fetch('http://localhost:3000/problem', { 
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`, 
            },
            body: JSON.stringify({
                description,
                problemTypeId: selectedType,
                reporterId: getUserId(), 
                userTypeId: userTypeId
            }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || `Error: ${response.status}`);
        }
        const data = await response.json();

        setDescription('');
        setSelectedType('');
        toast.success(data.message || 'Problem reported successfully');
    } catch (err) {
        setError(err.message || 'An unexpected error occurred.');
        toast.error(err.message || 'An unexpected error occurred');
    } finally {
        setReportLoading(false);
    }
};

  const handleOpenEditTypeModal = (type) => {
    setCurrentEditType(type);
    setIsEditTypeModalOpen(true);
  };

  const handleCloseEditTypeModal = () => {
    setIsEditTypeModalOpen(false);
    setCurrentEditType(null);
  };

  const handleSuccessEditType = () => {
    fetchProblemTypes();
    handleCloseEditTypeModal();
  };

  const handleOpenDeleteTypeConfirm = (type) => {
    setCurrentDeleteType(type);
    setIsDeleteTypeConfirmOpen(true);
  };

  const handleCloseDeleteTypeConfirm = () => {
    setIsDeleteTypeConfirmOpen(false);
    setCurrentDeleteType(null);
  };

  
  const handleOpenUpdateStatusModal = (problem) => {
    setCurrentUpdateProblem(problem);
    setIsUpdateStatusModalOpen(true);
  };
  
  const handleCloseUpdateStatusModal = () => {
    setIsUpdateStatusModalOpen(false);
    setCurrentUpdateProblem(null);
  };
  
  const handleSuccessUpdateStatus = () => {
    fetchProblems();
    handleCloseUpdateStatusModal();
  };

  const handleCloseEditStatusModal = () => {
    setIsEditStatusModalOpen(false);
    setCurrentEditStatus(null);
  };

  const handleSuccessEditStatus = () => {
    fetchStatuses();
    handleCloseEditStatusModal();
  };

  const handleOpenDeleteStatusConfirm = (status) => {
    setCurrentDeleteStatus(status);
    setIsDeleteStatusConfirmOpen(true);
  };

  const handleCloseDeleteStatusConfirm = () => {
    setIsDeleteStatusConfirmOpen(false);
    setCurrentDeleteStatus(null);
  };

  const handleConfirmTypeDelete = async () => {
    if (!currentDeleteType) return;

    setLoading(true);
    try {
      const response = await fetch(`http://localhost:3000/problem-type/${currentDeleteType.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Error: ${response.status}`);
      }

      toast.success('Problem type deleted successfully.');
      fetchProblemTypes();
    } catch (err) {
      toast.error(err.message || 'An unexpected error occurred.');
    } finally {
      setLoading(false);
      handleCloseDeleteTypeConfirm();
    }
  };

  const handleConfirmStatusDelete = async () => {
    if (!currentDeleteStatus) return;

    setLoading(true);
    try {
      const response = await fetch(`http://localhost:3000/status/${currentDeleteStatus.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Error: ${response.status}`);
      }

      toast.success('Status deleted successfully.');
      fetchStatuses();
    } catch (err) {
      toast.error(err.message || 'An unexpected error occurred.');
    } finally {
      setLoading(false);
      handleCloseDeleteStatusConfirm();
    }
  };

  const handleOpenDeleteProblemConfirm = (problem) => {
    setCurrentDeleteProblem(problem);
    setIsDeleteProblemConfirmOpen(true);
  };
  
  const handleCloseDeleteProblemConfirm = () => {
    setIsDeleteProblemConfirmOpen(false);
    setCurrentDeleteProblem(null);
  };
  
  const handleConfirmProblemDelete = async () => {
    if (!currentDeleteProblem) return;
  
    setLoading(true);
    try {
      const response = await fetch(`http://localhost:3000/problem/${currentDeleteProblem.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Error: ${response.status}`);
      }
  
      toast.success('Problem deleted successfully.');
      fetchProblems();
    } catch (err) {
      toast.error(err.message || 'An unexpected error occurred.');
    } finally {
      setLoading(false);
      handleCloseDeleteProblemConfirm();
    }
  };

  return (
    <main className="flex-1 mt-12 lg:mt-0 lg:ml-64 pt-3 pb-8 px-6 sm:px-8">
      <div className="flex items-center justify-between">
        <PageTitle text="Problems"/>
        {userRole === UserRoles.Administrator && (
          <div className="mb-4">
          <nav className="flex gap-4">
            <Button 
              text="Reported Problems"
              type={activeTab === 'problems' ? 'primary' : 'link'}
              onClick={() => setActiveTab('problems')}
            />
            <Button 
              text="Problem Types"
              type={activeTab === 'types' ? 'primary' : 'link'}
              onClick={() => setActiveTab('types')}
            />
            <Button 
              text="Statuses"
              type={activeTab === 'statuses' ? 'primary' : 'link'}
              onClick={() => setActiveTab('statuses')}
            />
          </nav>
        </div>      
        )}
      </div>
      
      {userRole !== UserRoles.Administrator && (
        <div className='mb-8'>
          <h2 className="text-xl font-semibold mb-4">Report a Problem</h2>
          <form className="flex flex-col gap-4" onSubmit={handleReportSubmit}>
            <div className="flex flex-col gap-2">
              <label className="text-base text-textBg-700" htmlFor="problemDescription">Description</label>
              <textarea
                id="problemDescription"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
                rows="4"
                className="w-full text-textBg-900 px-3 py-2 border border-textBg-200 rounded text-base focus:outline-none focus:border-textBg-500"
                placeholder="Please provide a detailed description of the problem..."
              ></textarea>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-base text-textBg-700" htmlFor="problemType">Problem Type</label>
              <select
                id="problemType"
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                required
                className="w-full text-textBg-900 px-3 py-2 border border-textBg-200 rounded text-base focus:outline-none focus:border-textBg-500"
              >
                <option value="" hidden disabled>Select a type</option>
                {problemTypes.map((type) => (
                  <option key={type.id} value={type.id}>
                    {type.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex justify-end gap-4">
              <Button
                text="Cancel"
                type="secondary"
                onClick={() => {
                  setDescription('');
                  setSelectedType('');
                  setReportError(null);
                }}
                className="px-4 py-2"
              />
              <Button
                text={reportLoading ? "Submitting..." : "Submit"}
                type="primary"
                disabled={reportLoading}
                className="px-4 py-2"
              />
            </div>
          </form>
        </div>
      )}

      {userRole === UserRoles.Administrator && (
        <div>
          {activeTab === 'problems' && (
            <div>
              <h2 className="text-xl font-semibold mb-4">Reported Problems</h2>
              {loading ? (
                <p>Loading...</p>
              ) : (
                <div className="flex flex-col gap-2">
                  {problems.length === 0 ? (
                    <p>No problems reported yet.</p>
                  ) : (
                    problems.map((problem) => (
                      <div key={problem.id} className="border px-4 py-2 rounded flex justify-between items-center">
                        <div className="flex flex-col gap-2 sm:flex-row sm:gap-8">
                          <div className="flex flex-col mb-2 gap-1">
                            <p className="text-textBg-600 text-[11px] -mb-1">{formatDate(problem.reported_time)}</p>
                            <p className="text-textBg-900 text-lg">{problem.reporter?.first_name} {problem.reporter?.last_name}</p>
                            <span className="text-gray-600 text-xs">{problem.reporter?.email}</span>
                          </div>
                          <div>
                            <p className="text-textBg-900 text-base">{problem.description || "Unknown"}</p>
                          </div>
                        </div>
                        <div className="flex gap-4 items-center">
                          <p className="text-textBg-600 text-sm">{problem.problem_types?.name || "Unknown"}</p>
                          <div className={`w-24 text-center py-1 rounded-md ${problem.statuses?.name === 'Completed' ? 'bg-[#eefdf3]' : problem.statuses?.name === 'Pending' ? 'bg-[#fef9ed]' : problem.statuses?.name === 'Closed' ? 'bg-primary-100' : 'bg-[#e0f2fe]'}`}>
                            <p className={`text-base font-medium ${problem.statuses?.name === 'Completed' ? 'text-[#17a948]' : problem.statuses?.name === 'Pending' ? 'text-[#d29211]' : problem.statuses?.name === 'Closed' ? 'text-primary-600' : 'text-blue-600'}`}>{problem.statuses?.name || "Pending"}</p>
                          </div>
                          <Button 
                            icon={<Pen size={16} color='#1A99EE'/>} 
                            type="link" 
                            onClick={() => handleOpenUpdateStatusModal(problem)}
                          />
                          <Button 
                            icon={<Trash size={16} color='#FF4D4F'/>} 
                            type="link" 
                            onClick={() => handleOpenDeleteProblemConfirm(problem)}
                          />
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          )}

          {activeTab === 'types' && (
            <div>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Problem Types</h2>
                <Button 
                  icon={<Plus size={16}/>}
                  onClick={handleOpenCreateTypeModal} 
                  type="secondary"
                  className="min-w-0 w-9 h-9"
                />
              </div>
              {loading ? (
                <p>Loading...</p>
              ) : (
                <div className="flex flex-col gap-2">
                  {problemTypes.map((type) => (
                    <div key={type.id} className="border px-4 py-2 rounded flex justify-between items-center">
                      <p className='font-medium'>{type.name}</p>
                      <div className="flex space-x-2">
                        <Button 
                          icon={<Pen size={16} color='#1A99EE'/>} 
                          type="link" 
                          onClick={() => handleOpenEditTypeModal(type)}
                          aria-label={`Edit ${type.name}`}
                        />
                        <Button 
                          icon={<Trash size={16} color='#FF4D4F'/>} 
                          type="link" 
                          onClick={() => handleOpenDeleteTypeConfirm(type)}
                          aria-label={`Delete ${type.name}`}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'statuses' && (
            <div>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Statuses</h2>
                <Button 
                  icon={<Plus size={16}/>}
                  onClick={handleOpenCreateStatusModal} 
                  type="secondary"
                  className="min-w-0 w-9 h-9"
                />
              </div>
              {loading ? (
                <p>Loading...</p>
              ) : (
                <div className="flex flex-col gap-2">
                  {statuses.map((status) => (
                    <div key={status.id} className="border px-4 py-2 rounded flex justify-between items-center">
                      <p className='font-medium'>{status.name}</p>
                      <div className="flex space-x-2">
                        {/* <Button 
                          icon={<Pen size={16} color='#1A99EE'/>} 
                          type="link" 
                          onClick={() => handleOpenEditStatusModal(status)}
                        /> */}
                        <Button 
                          icon={<Trash size={16} color='#FF4D4F'/>} 
                          type="link" 
                          onClick={() => handleOpenDeleteStatusConfirm(status)}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      <CreateProblemTypeModal
        isOpen={isCreateTypeModalOpen}
        onClose={handleCloseCreateTypeModal}
        onSuccess={handleSuccessCreateType}
      />

      <CreateStatusModal
        isOpen={isCreateStatusModalOpen}
        onClose={handleCloseCreateStatusModal} 
        onSuccess={handleSuccessCreateStatus}
      />

      {currentEditType && (
        <EditProblemTypeForm
          id={currentEditType.id}
          currentName={currentEditType.name}
          isOpen={isEditTypeModalOpen}
          onSuccess={handleSuccessEditType}
          onClose={handleCloseEditTypeModal}
        />
      )}

      {currentEditStatus && (
        <EditStatusForm
          id={currentEditStatus.id}
          currentName={currentEditStatus.name}
          isOpen={isEditStatusModalOpen}
          onSuccess={handleSuccessEditStatus}
          onClose={handleCloseEditStatusModal}
        />
      )}

      {currentDeleteType && (
        <ConfirmForm
          isOpen={isDeleteTypeConfirmOpen}
          onClose={handleCloseDeleteTypeConfirm}
          onConfirm={handleConfirmTypeDelete}
        />
      )}

      {currentDeleteStatus && (
        <ConfirmForm
          isOpen={isDeleteStatusConfirmOpen}
          onClose={handleCloseDeleteStatusConfirm}
          onConfirm={handleConfirmStatusDelete}
        />
      )}

      {currentUpdateProblem && (
        <UpdateProblemStatusForm
          isOpen={isUpdateStatusModalOpen}
          onClose={handleCloseUpdateStatusModal}
          problem={currentUpdateProblem}
          statuses={statuses}
          onSuccess={handleSuccessUpdateStatus}
        />
      )}

      {currentDeleteProblem && (
        <ConfirmForm
          isOpen={isDeleteProblemConfirmOpen}
          onClose={handleCloseDeleteProblemConfirm}
          onConfirm={handleConfirmProblemDelete}
          title="Delete Problem"
          message={`Are you sure you want to delete the problem reported by ${currentDeleteProblem.reporter?.first_name} ${currentDeleteProblem.reporter?.last_name}?`}
        />
      )}

    </main>
  );
}

export default Problems;
