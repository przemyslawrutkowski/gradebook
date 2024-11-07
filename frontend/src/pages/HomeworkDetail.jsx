import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import PageTitle from '../components/PageTitle';
import homeworkData from '../data/homeworkData';
import { useDropzone } from 'react-dropzone';
import Button from "../components/Button";
import axios from 'axios'; // Import axios
import { ToastContainer, toast } from 'react-toastify'; 
import 'react-toastify/dist/ReactToastify.css';
import { BookA, Calendar, CloudUpload, File, FileUp, Presentation, X } from 'lucide-react';
import Tag from '../components/Tag';

const HomeworkDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [uploadProgress, setUploadProgress] = useState({});

  const homework = homeworkData.find(hw => hw.id === parseInt(id));

  const onDrop = (acceptedFiles) => {
    acceptedFiles.forEach(file => {
      setUploadedFiles(prevFiles => [...prevFiles, file]);

      setUploadProgress(prevProgress => ({
        ...prevProgress,
        [file.name]: 0
      }));

      const formData = new FormData();
      formData.append('file', file);

      axios.post('/api/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setUploadProgress(prevProgress => ({
            ...prevProgress,
            [file.name]: percentCompleted
          }));
        }
      })
      .then(response => {
        // console.log(`File ${file.name} uploaded successfully.`);

      })
      .catch(error => {
        toast.error("Error uploading file");
      });
    });
  };

  const onDropRejected = (rejectedFiles) => {
    rejectedFiles.forEach(file => {
      const { file: rejectedFile, errors } = file;
      errors.forEach(err => {
        toast.error(`${rejectedFile.name} - ${err.message}`);
      });
    });
  };

  const { getRootProps, getInputProps, isDragActive, open } = useDropzone({
    onDrop,
    onDropRejected, 
    multiple: true,
    noClick: true, 
    maxSize: 10485760,
  });

  const removeFile = (fileName) => {
    setUploadedFiles(prevFiles => prevFiles.filter(file => file.name !== fileName));
    setUploadProgress(prevProgress => {
      const newProgress = { ...prevProgress };
      delete newProgress[fileName];
      return newProgress;
    });
  };

  if (!homework) {
    return (
      <main className="flex-1 mt-12 lg:mt-0 lg:ml-64 pt-3 pb-8 px-6 sm:px-8">
        <PageTitle text="Homework Details"/>
        <div className="flex flex-col justify-between sm:border sm:border-solid sm:rounded sm:border-textBg-200 sm:p-8 gap-8 2xl:gap-16">
          <p className="text-primary-500">Homework not found!</p>
          <button
            onClick={() => navigate(-1)}
            className="mt-4 px-4 py-2 bg-primary-500 text-white rounded hover:bg-primary-600 transition"
          >
            Go Back
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="flex-1 mt-12 lg:mt-0 lg:ml-64 pt-3 pb-8 px-6 sm:px-8">
      <ToastContainer 
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        draggable
      />
      <PageTitle text="Homework Details"/>
      <div className="flex flex-col justify-between sm:border sm:border-solid sm:rounded sm:border-textBg-200 sm:p-8 gap-8">
        <div>
          <p className="text-2xl text-textBg-700 font-semibold mb-4">{homework.title}</p>
          <p className='text-base text-textBg-700 mb-6'>{homework.description}</p>
          <div className='flex gap-4'>
            <Tag text={homework.subject} icon={<BookA size={16}/>}/>
            <Tag text={new Date(homework.dueDate).toLocaleDateString()} icon={<Calendar size={16} />}/>
          </div>
        </div>

        <div className="mb-6">
          <h3 className="text-xl text-textBg-700 font-semibold mb-4">Upload Files</h3>
          <div
            {...getRootProps()}
            className={`flex flex-col items-center justify-center border-2 border-dashed rounded-md p-6 cursor-pointer transition ${
              isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
            }`}
          >
            <input {...getInputProps()} />
            <CloudUpload color='#dee1e6' size={48} strokeWidth={1}/>
            {isDragActive ? (
              <p className="text-textBg-900 mt-2">Drop the files here...</p>
            ) : (
              <p className='text-textBg-900 mt-2'>Drag and drop files here</p>
            )}
            <button
              type="button"
              onClick={open}
              className="bg-textBg-200 rounded-md text-textBg-900 px-6 py-2 mt-4"
            >
              Choose File
            </button>
            <p className="text-sm text-textBg-600 mt-3">Maximum size: 10MB</p>
          </div>

          {uploadedFiles.length > 0 && (
            <div className="mt-4">
                {uploadedFiles.map((file, index) => (
                  <div key={index} className='p-4 bg-textBg-150 rounded-lg mb-4'>
                    <div className='flex justify-between'>
                      <div className='flex gap-4'>
                        <File color='#565d6d' size={48} strokeWidth={1}/>
                        <div className='flex flex-col justify-center gap-1'>
                          <span className="font-medium text-base text-textBg-900">{file.name}</span>
                          <p className='text-textBg-500 text-sm'>{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                        </div>
                      </div>
                      <div>
                      <button
                        onClick={() => removeFile(file.name)}
                        className="text-textBg-600 hover:text-textBg-700 font-semibold"
                     >
                        <X/>
                     </button>
                      </div>
                    </div>
                    <div className='mt-4'>
                    {uploadProgress[file.name] !== undefined && (
                     <div className="w-full bg-gray-200 rounded-full h-2.5 mt-4">
                         <div
                          className="bg-blue-600 h-2.5 rounded-full"
                           style={{ width: `${uploadProgress[file.name]}%` }}
                         ></div>
                       </div>
                     )}
                    </div>
                  </div>
                ))}
            </div>
          )}

          <div className='mt-4'>
            <Button
              onClick={() => {
                toast.success("Files have been uploaded!");
                setUploadedFiles([]);
                setUploadProgress({});
              }}
              size="m"
              text="Upload"
              className={`w-full ${
                uploadedFiles.length === 0 ? 'opacity-50 cursor-not-allowed' : ''
              } transition`}
              disabled={uploadedFiles.length === 0}
            />
          </div>
        </div>
      </div>
    </main>
  );
};

export default HomeworkDetail;
