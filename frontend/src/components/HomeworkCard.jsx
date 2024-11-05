/* eslint-disable react/prop-types */
import React from 'react';
import { CircleAlert, SquareSigma } from 'lucide-react';

const HomeworkCard = ({ subject, title, dueDate, status }) => {
  return (
    <div className="flex items-center justify-between gap-3 p-4 bg-white rounded">
      <div className="flex items-center gap-3">
        <SquareSigma size={48} color="#1A99EE" strokeWidth={1.25} />
        <div>
          <p className="text-base text-textBg-700 font-bold uppercase mb-1">{subject}</p>
          <p className="text-textBg-500 text-sm">{title}</p>
        </div>
      </div>
      <div className="flex items-center gap-4">
        {status === 'overdue' && (
          <CircleAlert size={20} color="#EB4C60" className="hidden sm:block" />
        )}
        <div
          className={`rounded px-3 py-1 text-sm font-bold text-center ${
            status === 'completed'
              ? 'bg-green-200 text-green-600'
              : status === 'pending'
              ? 'bg-yellow-200 text-yellow-600'
              : 'bg-red-200 text-red-600'
          }`}
        >
          <p>{dueDate}</p>
        </div>
      </div>
    </div>
  );
};

export default HomeworkCard;
