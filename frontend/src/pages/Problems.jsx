import React, { useState, useEffect } from "react";
import ReportProblemModal from "../components/forms/problems/ReportProblemForm";
import Button from "../components/Button"; 
import PageTitle from "../components/PageTitle";
import CreateProblemTypeModal from "../components/forms/problemtype/CreateProblemTypeForm";

export function Problems() {
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [isCreateTypeModalOpen, setIsCreateTypeModalOpen] = useState(false);
  const [problems, setProblems] = useState([]);
  const [problemTypes, setProblemTypes] = useState([]);

  const fetchProblems = async () => {
  };

  const fetchProblemTypes = async () => {
    try {
      const response = await fetch('/api/problem-types');
      if (response.ok) {
        const data = await response.json();
        setProblemTypes(data);
      } else {
        console.error('Nie udało się pobrać typów zgłoszeń');
      }
    } catch (error) {
      console.error('Błąd:', error);
    }
  };

  useEffect(() => {
    fetchProblems();
    fetchProblemTypes();
  }, []);

  const handleOpenReportModal = () => {
    setIsReportModalOpen(true);
  };

  const handleCloseReportModal = () => {
    setIsReportModalOpen(false);
  };

  const handleSuccessReport = () => {
    fetchProblems();
  };

  const handleOpenCreateTypeModal = () => {
    setIsCreateTypeModalOpen(true);
  };

  const handleCloseCreateTypeModal = () => {
    setIsCreateTypeModalOpen(false);
  };

  const handleSuccessCreateType = () => {
    fetchProblemTypes();
  };

  return (
    <main className="flex-1 mt-12 lg:mt-0 lg:ml-64 pt-3 pb-8 px-6 sm:px-8">
      <PageTitle text="Problems"/>
      <div className='flex flex-wrap justify-between mb-8'>
        <Button text="Report a Problem" onClick={handleOpenReportModal} />
        <Button text="Add Problem Type" onClick={handleOpenCreateTypeModal} />
      </div>


      <ReportProblemModal
        isOpen={isReportModalOpen}
        onClose={handleCloseReportModal}
        onSuccess={handleSuccessReport}
        problemTypes={problemTypes}
      />

      <CreateProblemTypeModal
        isOpen={isCreateTypeModalOpen}
        onClose={handleCloseCreateTypeModal}
        onSuccess={handleSuccessCreateType}
      />
    </main>
  );
}

export default Problems;
