/* eslint-disable react/prop-types */
export default function PageTitle({text}){
    return (
        <p className={`text-textBg-700 text-3xl font-bold mb-8 mt-4 lg:mt-1 hidden sm:block`}>{text}</p>
    );
}