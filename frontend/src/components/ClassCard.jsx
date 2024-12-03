import { GraduationCap } from "lucide-react";
import React from "react";
import { useNavigate } from "react-router-dom";

function ClassCard({ id, name, studentCount, schoolYear }) {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/classes/${id}`);
  };

  return (
    <div
      onClick={handleClick}
      className="flex justify-between border border-textBg-200 hover:cursor-pointer rounded-lg p-3 w-full"
    >
        <div className="flex">
            <div className="w-14 h-14 bg-blueAccent-100 text-blueAccent-500 grid place-items-center rounded mr-4">
                <GraduationCap size={36}/>
            </div>
            <div className="flex flex-col gap-2 justify-center">
                <p className="text-base font-semibold text-textBg-700">{name}</p>
                <p className="text-sm text-textBg-500">{studentCount} students</p>
            </div>
        </div>
        <div className="flex items-center text-sm text-textBg-700">
            <p>{schoolYear}</p>
        </div>
    </div>
  );
}

export default ClassCard;
