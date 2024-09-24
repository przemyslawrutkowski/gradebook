/* eslint-disable react/prop-types */
const Avatar= ({avatar, name, className}) => {
   
    return (
        <div className="flex items-center w-fit min-w-fit gap-4">
            {avatar && (
                <img className={`bg-amber-500 rounded-full w-8 h-8 ${className}`}></img>
            )}
            {name && (
                <p className="text-textBg-700">{name}</p>
            )} 
        </div> 
  );
};

export default Avatar;