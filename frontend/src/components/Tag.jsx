const Tag = ({icon, text}) => {
    return (
        <div className='flex items-center justify-center h-9 gap-2 px-4 text-sm bg-textBg-200 text-textBg-700 rounded-full'>
            {icon}
            {text}
        </div>
    );
}

export default Tag;