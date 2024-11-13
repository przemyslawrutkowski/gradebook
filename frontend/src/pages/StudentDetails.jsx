import React, { useState } from "react";
import { useParams } from "react-router-dom";
import studentsData from '../data/studentsData';
import classesData from '../data/classesData';
import parentsData from "../utils/parentsData";
import PageTitle from '../components/PageTitle';
import Button from "../components/Button";
import Modal from '../components/Modal';
import Select from 'react-select'; 
import { 
  Fingerprint, 
  GraduationCap, 
  Link, 
  Mail, 
  Phone, 
  User, 
  X 
} from "lucide-react";

function StudentDetails() {
  const { id } = useParams();
  const studentId = parseInt(id, 10);
  const student = studentsData.find(s => s.id === studentId);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedParent, setSelectedParent] = useState(null);

  if (!student) {
    return <div>Student not found.</div>;
  }

  const studentClass = classesData.find(cls => cls.id === student.classId);
  const currentParent = parentsData.find(parent => parent.id === student.parentId);

  const availableParents = parentsData.filter(parent => 
    !studentsData.some(s => s.parentId === parent.id && s.id !== studentId)
  );

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => {
    setSelectedParent(null);
    setIsModalOpen(false);
  };

  const handleAssignParent = () => {
    if (selectedParent) {
      student.parentId = selectedParent.value.id;
      closeModal();
    }
  };

  return (
    <main className="flex-1 mt-12 lg:mt-0 lg:ml-64 pt-3 pb-8 px-6 sm:px-8">
      <PageTitle text={`Details of ${student.name}`} />
      <div className="flex flex-col sm:border sm:border-solid sm:rounded sm:border-textBg-200 sm:p-8">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-semibold text-textBg-700">{student.name}</h2>
          <Button 
            text="Assign Parent" 
            icon={<Link size={16} />} 
            size="m"
            onClick={openModal}
          />
        </div>
        <div className="flex flex-col 2xl:flex-row gap-16">
          <div className="flex flex-col gap-2 w-full 2xl:w-[30%]">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Mail size={20} color="#F37986"/>
                <p className="text-textBg-550">Email</p>
              </div>
              <p>{student.email}</p>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Phone size={20} color="#F37986"/>
                <p className="text-textBg-550">Phone</p>
              </div>
              <p>{student.phoneNumber}</p>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Fingerprint size={20} color="#F37986"/>
                <p className="text-textBg-550">Pesel</p>
              </div>
              <p>{student.pesel}</p>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <GraduationCap size={20} color="#F37986"/>
                <p className="text-textBg-550">Class</p>
              </div>
              <p>{studentClass ? studentClass.name : 'N/A'}</p>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <User size={20} color="#F37986"/>
                <p className="text-textBg-550">Parent</p>
              </div>
              <p>{currentParent ? currentParent.name : 'N/A'}</p>
            </div>
          </div>
        </div>  
      </div>

      <Modal isOpen={isModalOpen} onClose={closeModal} widthHeightClassname="max-w-md max-h-md">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-textBg-700">Assign Parent to {student.name}</h2>
          <X size={24} className="hover:cursor-pointer" onClick={closeModal}/>
        </div>
        <div>
          <Select
            options={availableParents.map(parent => ({ value: parent, label: parent.name }))}
            onChange={setSelectedParent}
            placeholder="Select a parent to assign"
            className="w-full mb-4"
          />
          
          <div className="mt-6 flex justify-end gap-4">
            <Button text="Cancel" type="secondary" onClick={closeModal} />
            <Button 
              text="Assign" 
              type="primary" 
              onClick={handleAssignParent} 
              disabled={!selectedParent}
            />
          </div>
        </div>
      </Modal>
    </main>
  );
}

export default StudentDetails;
