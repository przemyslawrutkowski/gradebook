import React, { useState, useEffect } from "react";
import Button from "../components/Button"; 
import PageTitle from "../components/PageTitle";
import CreateProblemTypeModal from "../components/forms/problemtype/CreateProblemTypeForm";
import EditProblemTypeForm from "../components/forms/problemtype/EditProblemTypeForm";
import ConfirmForm from "../components/forms/ConfirmForm"; 
import { getToken, getUserRole } from "../utils/UserRoleUtils";
import { toast } from "react-toastify";
import UserRoles from '../data/userRoles';
import { Pen, Plus, Trash } from 'lucide-react';

export function Problems() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isCreateTypeModalOpen, setIsCreateTypeModalOpen] = useState(false);
  const [isEditTypeModalOpen, setIsEditTypeModalOpen] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [problems, setProblems] = useState([]);
  const [problemTypes, setProblemTypes] = useState([]);
  
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [reportLoading, setReportLoading] = useState(false);
  const [reportError, setReportError] = useState(null);
  const [activeTab, setActiveTab] = useState('problems');

  const [currentEditType, setCurrentEditType] = useState(null);
  const [currentDeleteType, setCurrentDeleteType] = useState(null); // For deletion

  const token = getToken();
  const userRole = getUserRole();

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
      const response = await fetch('http://localhost:3000/problem-types', { 
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
    } else {
      fetchProblemTypes(); 
    }
  }, []);

  const handleOpenCreateTypeModal = () => {
    setIsCreateTypeModalOpen(true);
  };

  const handleCloseCreateTypeModal = () => {
    setIsCreateTypeModalOpen(false);
  };

  const handleSuccessCreateType = () => {
    fetchProblemTypes();
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
      const response = await fetch('http://localhost:3000/api/problems', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`, 
        },
        body: JSON.stringify({ title, description, problem_type_id: selectedType }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Error: ${response.status}`);
      }
      const data = await response.json();

      setTitle('');
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

  const handleOpenDeleteConfirm = (type) => {
    setCurrentDeleteType(type);
    setIsDeleteConfirmOpen(true);
  };

  const handleCloseDeleteConfirm = () => {
    setIsDeleteConfirmOpen(false);
    setCurrentDeleteType(null);
  };

  const handleConfirmDelete = async () => {
    if (!currentDeleteType) return;

    setLoading(true);
    try {
      const response = await fetch(`http://localhost:3000/problem-types/${currentDeleteType.id}`, {
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
      handleCloseDeleteConfirm();
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
          </nav>
        </div>      
        )}
      </div>
      
      {userRole !== UserRoles.Administrator && (
        <div className='mb-8'>
          <h2 className="text-xl font-semibold mb-4">Report a Problem</h2>
          <form className="flex flex-col gap-4" onSubmit={handleReportSubmit}>
            <div className="flex flex-col gap-2">
              <label className="text-base text-textBg-700" htmlFor="problemTitle">Title</label>
              <input
                id="problemTitle"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                className="w-full text-textBg-900 px-3 py-2 border border-textBg-200 rounded text-base focus:outline-none focus:border-textBg-500"
                placeholder="e.g., Unable to load student data"
              />
            </div>

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
                <option value="">Select a type</option>
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
                  setTitle('');
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
                <div className="overflow-x-auto">
                  <table className="min-w-full bg-white border">
                    <thead>
                      <tr>
                        <th className="py-2 px-4 border-b">ID</th>
                        <th className="py-2 px-4 border-b">Title</th>
                        <th className="py-2 px-4 border-b">Description</th>
                        <th className="py-2 px-4 border-b">Type</th>
                        <th className="py-2 px-4 border-b">Reported By</th>
                        <th className="py-2 px-4 border-b">Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {problems.length === 0 ? (
                        <tr>
                          <td colSpan="6" className="text-center py-4">No reported problems.</td>
                        </tr>
                      ) : (
                        problems.map((problem) => (
                          <tr key={problem.id}>
                            <td className="py-2 px-4 border-b">{problem.id}</td>
                            <td className="py-2 px-4 border-b">{problem.title}</td>
                            <td className="py-2 px-4 border-b">{problem.description}</td>
                            <td className="py-2 px-4 border-b">{problem.problemType.name}</td>
                            <td className="py-2 px-4 border-b">{problem.reportedBy}</td>
                            <td className="py-2 px-4 border-b">{new Date(problem.createdAt).toLocaleString()}</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
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
                          onClick={() => handleOpenDeleteConfirm(type)}
                          aria-label={`Delete ${type.name}`}
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

      {currentEditType && (
        <EditProblemTypeForm
          id={currentEditType.id}
          currentName={currentEditType.name}
          isOpen={isEditTypeModalOpen}
          onSuccess={handleSuccessEditType}
          onClose={handleCloseEditTypeModal}
        />
      )}

      {currentDeleteType && (
        <ConfirmForm
          isOpen={isDeleteConfirmOpen}
          onClose={handleCloseDeleteConfirm}
          onConfirm={handleConfirmDelete}
        />
      )}
    </main>
  );
}

export default Problems;
