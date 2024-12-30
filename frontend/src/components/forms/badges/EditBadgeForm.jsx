import React, { useState, useEffect } from 'react';
import Button from "../../Button";
import { X } from 'lucide-react';
import Modal from '../../Modal';
import { getToken } from '../../../utils/UserRoleUtils';
import { validate as validateUUID } from 'uuid';

function EditBadgeForm({ id, currentName, currentDescription, currentCategoryId, isOpen, onSuccess, onClose }) {
  const [name, setName] = useState(currentName);
  const [description, setDescription] = useState(currentDescription);
  const [categoryId, setCategoryId] = useState(currentCategoryId);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const token = getToken();

  const fetchCategories = async () => {
    try {
      const response = await fetch('http://localhost:3000/badge-categories', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Error fetching categories: ${response.status}`);
      }

      const result = await response.json();
      setCategories(result.data);
    } catch (err) {
      console.error(err);
      setError('Failed to load badge categories.');
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchCategories();
      setName(currentName);
      setDescription(currentDescription);
      setCategoryId(currentCategoryId);
    }
  }, [isOpen, currentName, currentDescription, currentCategoryId]);

  const handleUpdate = async (e) => {
    e.preventDefault();

    if (!validateUUID(id)) {
      setError('Invalid UUID identifier.');
      return;
    }

    if (!categoryId) {
      setError('Please select a badge category.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`http://localhost:3000/badges/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ name, description, categoryId }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Error: ${response.status}`);
      }

      const updatedBadge = await response.json();
      onSuccess(updatedBadge);
      onClose();
    } catch (err) {
      setError(err.message || 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} widthHeightClassname="max-w-lg">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-textBg-700">Edit Badge</h2>
        <X size={24} className="hover:cursor-pointer" onClick={onClose} />
      </div>
      <form className="flex flex-col gap-6" onSubmit={handleUpdate}>
        {error && <p className="text-red-500">{error}</p>}

        <div className="flex flex-col gap-2">
          <label className="text-base text-textBg-700" htmlFor="badgeName">Badge Name</label>
          <input
            id="badgeName"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="w-full text-textBg-900 px-3 py-2 border border-textBg-200 rounded text-base focus:outline-none focus:border-textBg-500"
            placeholder="e.g., Excellence in Math"
          />
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-base text-textBg-700" htmlFor="badgeDescription">Description</label>
          <input
            id="badgeDescription"
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
            className="w-full text-textBg-900 px-3 py-2 border border-textBg-200 rounded text-base focus:outline-none focus:border-textBg-500"
            placeholder="e.g., Awarded for outstanding performance in mathematics."
          />
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-base text-textBg-700" htmlFor="badgeCategory">Category</label>
          <select
            id="badgeCategory"
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            required
            className="w-full text-textBg-900 px-3 py-2 border border-textBg-200 rounded text-base focus:outline-none focus:border-textBg-500"
          >
            <option value="" disabled hidden>Select category</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>

        <div className="flex justify-end gap-4">
          <Button
            text="Cancel"
            type="secondary"
            onClick={onClose}
            className="px-4 py-2"
          />
          <Button
            text={loading ? "Updating..." : "Update"}
            type="primary"
            disabled={loading}
            className="px-4 py-2"
            btnType="submit"
          />
        </div>
      </form>
    </Modal>
  );
}

export default EditBadgeForm;
