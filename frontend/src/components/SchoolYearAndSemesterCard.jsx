import React from 'react';
import Button from './Button'
import {Calendar, Pen, Trash} from 'lucide-react';

function SchoolYearAndSemesterCard({ id, name, startDate, endDate, onEdit, onDelete }) {
  return (
    <div className="border p-4 rounded flex justify-between items-center">
      <div>
        <p className="text-base font-semibold text-textBg-900 mb-2">{name}</p>
        <div className='flex items-center gap-2 text-textBg-600'>
          <Calendar size={16} />
          <p className="text-sm">
            {new Date(startDate).toLocaleDateString()} - {new Date(endDate).toLocaleDateString()}
          </p>
        </div>
      </div>
      <div className='flex items-center gap-2'>
        <Button
          icon={<Pen size={16} color='#1A99EE' />}
          type="link"
          onClick={() => onEdit(id, name, startDate, endDate)}
          aria-label={`Edit ${name}`}
        />
        <Button
          icon={<Trash size={16} color='#FF4D4F' />}
          type="link"
          onClick={() => onDelete(id, name)}
          aria-label={`Delete ${name}`}
        />
      </div>
    </div>
  );
}

export default SchoolYearAndSemesterCard;