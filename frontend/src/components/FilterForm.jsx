import { Search } from 'lucide-react';

export default function FilterForm() {
  return (
    <div className='flex gap-4 flex-wrap'>
      <div className="flex h-9 w-full sm:w-[calc(50%-8px)] md:w-56 items-center px-3 py-3  bg-white rounded border border-solid border-textBg-400 text-textBg-700">
        <Search size={20} className='mr-2 text-textBg-700' />
        <input type='text' placeholder='Search' className="w-full focus:outline-none  text-sm lg:text-base" />
      </div>
      <select className="h-9 w-full sm:w-[calc(50%-8px)] md:w-56 px-3 bg-white rounded border border-solid border-textBg-400 text-textBg-700 focus:outline-none lg:text-base">
        <option>Abcd</option>
        <option>Abcd</option>
      </select>
    </div>
  );
}
