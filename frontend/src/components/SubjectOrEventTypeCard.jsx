import React from 'react';
import { Edit, Pen, Trash } from 'lucide-react';
import Button from './Button';

const SubjectOrEventTypeCard = ({ id, name, onEdit, onDelete }) => {
  return (
    <div className="border px-4 py-2 rounded flex justify-between items-center">
      <p className='font-medium'>{name}</p>
      <div className="flex">
        <Button icon={<Pen size={16} color='#1A99EE'/>} type="link" onClick={() => onEdit(id, name)}/>
        <Button icon={<Trash size={16}/>} type="link" onClick={() => onDelete(id)}/>
      </div>
    </div>
  );
};

export default SubjectOrEventTypeCard;
