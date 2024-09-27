/* eslint-disable react/prop-types */
const ExamCard = ({icon,className, title, date, time}) => {
   
    const sufix = " | ";

    return (
        <div className="flex items-center w-fit gap-4">
            <div className={`w-14 h-14 rounded-lg flex items-center justify-center ${className}`}>
                {icon}
            </div>
            <div className="flex flex-col gap-1">
                <p className="text-textBg-700 text-lg font-bold">{title}</p>
                <div className="flex lg:flex-col xl:flex-row">
                    <p className="text-textBg-700 text-sm">{date}</p>
                    <span className="mx-1 text-textBg-700 text-sm lg:hidden xl:block">|</span>
                    <p className="text-textBg-700 xl:text-textBg-700 lg:text-textBg-500 text-sm lg:text-xs xl:text-sm">{time}</p>
                </div>
            </div>
        </div> 
  );
};

export default ExamCard;