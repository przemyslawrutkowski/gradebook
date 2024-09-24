/* eslint-disable react/prop-types */
import {CircleAlert, SquareSigma} from 'lucide-react'

const HomeworkCard = () => {
   
    return (
    <div className="flex items-center justify-between gap-3">
      <div className="flex items-center gap-3">
        <SquareSigma size={48} color="#1A99EE" strokeWidth={1.25}/>
        <div>
          <p className="text-base text-textBg-700 font-bold mb-1">MATHEMATICS</p>
          <p className="text-textBg-500 text-sm">Algorithms</p>
        </div>
      </div>   
      <div className="flex items-center gap-4">
          <CircleAlert size={20} color="#EB4C60"/>
          <div className="bg-primary-200 rounded px-3 py-1">
            <p className="text-primary-600 font-bold text-base">12 JAN 2024</p>
          </div>
      </div>
    </div>
  );
};

export default HomeworkCard;