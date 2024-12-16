import React from 'react';
import Button from './Button'
import { Calendar, Pen, Trash } from 'lucide-react';
import { Link } from 'react-router-dom';

function SchoolYearAndSemesterCard({ id, name, startDate, endDate, onEdit, onDelete, link  }) {
  const handleEditClick = (e) => {
    e.stopPropagation();
    onEdit(id, name, startDate, endDate);
  };

  const handleDeleteClick = (e) => {
    e.stopPropagation();
    onDelete(id);
  };

  return (
    <div className="border p-4 rounded flex justify-between items-center">
      <Link to={link} >
        <div>
          <p className="text-base font-semibold text-textBg-900 mb-2">{name}</p>
          <div className='flex items-center gap-2 text-textBg-600'>
            <Calendar size={16} />
            <p className="text-sm">
              {new Date(startDate).toLocaleDateString()} - {new Date(endDate).toLocaleDateString()}
            </p>
          </div>
        </div>
      </Link>
      <div className='flex items-center gap-2 z-10'>
        <Button
          icon={<Pen size={16} color='#1A99EE' />}
          type="link"
          onClick={handleEditClick}
          aria-label={`Edytuj ${name}`}
          className="z-10"
        />
        <Button
          icon={<Trash size={16} color='#FF4D4F' />}
          type="link"
          onClick={handleDeleteClick}
          aria-label={`Usuń ${name}`}
          className="z-10"
        />
      </div>
    </div>
  );
}

export default SchoolYearAndSemesterCard;
