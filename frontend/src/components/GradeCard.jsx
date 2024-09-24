/* eslint-disable react/prop-types */
const GradeCard = ({title, subtitle, grade, textColor, bgColor}) => {
   
    return (
        <div className={`flex flex-1 items-center justify-between ${bgColor} rounded-xl p-4`}>
            <div className="flex flex-col gap-2">
                <p className={`text-lg font-bold ${textColor}`}>{title}</p>
                <p className="text-textBg-700 text-sm font-medium">{subtitle}</p>
            </div>
            <div className={`${textColor} font-bold text-3xl`}>
                {grade}
            </div>
        </div> 
  );
};

export default GradeCard;