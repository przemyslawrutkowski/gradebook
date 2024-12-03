import React from 'react';
import Modal from '../Modal';
import Button from '../Button';
import Select from 'react-select'; 
import { X } from 'lucide-react';

function AssignParentForm({ onSuccess, isOpen, closeModal, studentName}) {
  return (
    <Modal isOpen={isOpen} onClose={closeModal} widthHeightClassname="max-w-md max-h-md">
        <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-textBg-700">Assign Parent to {studentName}</h2>
            <X size={24} className="hover:cursor-pointer" onClick={closeModal}/>
        </div>
        <div>
            <Select
            // options={availableParents.map(parent => ({ value: parent, label: parent.name }))}
            // onChange={setSelectedParent}
            placeholder="Select a parent to assign"
            className="w-full mb-4"
            />
            
            <div className="mt-6 flex justify-end gap-4">
            <Button text="Cancel" type="secondary" onClick={closeModal} />
            <Button 
                text="Assign" 
                type="primary" 
                // onClick={handleAssignParent} 
                // disabled={!selectedParent}
            />
            </div>
        </div>
    </Modal> 
  );
}

export default AssignParentForm;


