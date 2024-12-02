import React from 'react';
import Button from '../components/Button'
import {Pen, Trash} from 'lucide-react';

function SchoolYearCard({ id, name, startDate, endDate, onEdit, onDelete }) {
  return (
    <div className="border p-4 rounded flex justify-between items-center">
      <div>
        <p className="text-base font-semibold text-textBg-900">{name}</p>
        <p className="text-sm text-textBg-600">
          {new Date(startDate).toLocaleDateString()} - {new Date(endDate).toLocaleDateString()}
        </p>
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

export default SchoolYearCard;