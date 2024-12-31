/* eslint-disable react/prop-types */
import React from 'react';
import { Link } from 'react-router-dom';
import { CircleAlert, SquareSigma } from 'lucide-react';

const HomeworkCard = ({ id, subject, title, dueDate, status }) => {
  let statusStyles = '';
  let showAlert = false;
  
  const today = new Date();
  const providedDate = new Date(dueDate);
  
  today.setHours(0, 0, 0, 0);
  providedDate.setHours(0, 0, 0, 0);

  const timeDifference = providedDate - today;
  const dayDifference = Math.round(timeDifference / (1000 * 60 * 60 * 24));

  if(dayDifference > 0 && dayDifference <= 7){
    showAlert = true;
    statusStyles = 'bg-primary-100 text-primary-600';
  } else if (dayDifference > 7 || status === 'pending'){
    statusStyles = 'bg-[#fef9ed] text-[#d29211]';
  }
  
  if (status === 'completed'){
    statusStyles = 'bg-[#eefdf3] text-[#17a948]';
  } 
  
  if(status === 'overdue'){
    statusStyles = 'bg-primary-100 text-primary-600';
  }

  return (
    <Link to={`/homework/${id}`}>
      <div className="flex items-center justify-between gap-3 py-1 sm:p-2 bg-white rounded hover:bg-[#fcfcfa] transition">
        <div className="flex items-center gap-2 sm:gap-3">
          <div>
            <SquareSigma size={48} color="#1A99EE" strokeWidth={1.25} />
          </div>
          <div className="flex flex-col">
            <p className="text-base text-textBg-700 font-bold uppercase mb-1 webkit-box webkit-line-clamp-1 webkit-box-orient-vertical overflow-hidden">{subject}</p>
            <p className="text-textBg-500 text-sm webkit-box webkit-line-clamp-1 webkit-box-orient-vertical overflow-hidden">{title}</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          {showAlert && (
            <CircleAlert size={20} color="#EB4C60" className="hidden sm:block" />
          )}
          <div
            className={`rounded w-24 py-1 text-sm font-bold text-center ${statusStyles}`}
          >
            <p>{new Date(dueDate).toLocaleDateString()}</p>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default HomeworkCard;
