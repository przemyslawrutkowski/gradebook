/* eslint-disable react/prop-types */
const ExamCard = ({icon,className, title, date}) => {
   
    return (
        <div className="flex items-center w-fit gap-4">
            <div className={`w-14 h-14 rounded-lg flex items-center justify-center ${className}`}>
                {icon}
            </div>
            <div className="flex flex-col gap-1">
                <p className="text-textBg-700 text-lg font-bold">{title}</p>
                <p className="text-textBg-700 text-sm">{date}</p>
            </div>
        </div> 
  );
};

export default ExamCard;