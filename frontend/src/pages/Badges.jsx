import React, { useState, useEffect } from "react";
import PageTitle from '../components/PageTitle';
import { Search, Plus } from 'lucide-react';
import Button from "../components/Button";
import CreateBadgeForm from "../components/forms/badges/CreateBadgeForm";
import EditBadgeForm from "../components/forms/badges/EditBadgeForm";
import DeleteBadgeButton from "../components/buttons/badges/DeleteBadgeButton";
import { getToken } from "../utils/UserRoleUtils";

export function Badges() {
  const token = getToken();
  const [badges, setBadges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editBadge, setEditBadge] = useState(null); 

  const fetchBadges = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('http://localhost:3000/badges', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Error fetching badges: ${response.status}`);
      }

      const result = await response.json();
      setBadges(result.data);
    } catch (err) {
      setError(err.message || 'Failed to load badges.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBadges();
  }, []);

  const handleCreateSuccess = () => {
    fetchBadges();
  };

  const handleEditSuccess = () => {
    fetchBadges();
  };

  const handleDeleteSuccess = () => {
    fetchBadges();
  };

  return (
    <main className="flex-1 mt-12 lg:mt-0 lg:ml-64 pt-3 pb-8 px-6 sm:px-8">
      <PageTitle text="Badges" />
      <div className='flex justify-between mb-8'>
        <Button
          text="Create Badge"
          type="primary"
          onClick={() => setIsCreateOpen(true)}
          icon={<Plus size={16} />}
        />
      </div>

      {loading && <p>Loading badges...</p>}
      {error && <p className="text-red-500">{error}</p>}

      {!loading && !error && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {badges.map((badge) => (
            <div key={badge.id} className="p-4 border rounded shadow">
              <h3 className="text-lg font-semibold">{badge.name}</h3>
              <p className="text-gray-600">{badge.description}</p>
              <p className="text-sm text-gray-500">Category: {badge.badges_categories.name}</p>
              <div className="mt-4 flex space-x-2">
                <Button
                  text="Edit"
                  type="secondary"
                  onClick={() => setEditBadge(badge)}
                  className="px-3 py-1"
                />
                <DeleteBadgeButton
                  id={badge.id}
                  badgeName={badge.name}
                  onSuccess={handleDeleteSuccess}
                />
              </div>
            </div>
          ))}
        </div>
      )}

      <CreateBadgeForm
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onSuccess={handleCreateSuccess}
      />


      {editBadge && (
        <EditBadgeForm
          id={editBadge.id}
          currentName={editBadge.name}
          currentDescription={editBadge.description}
          currentCategoryId={editBadge.category_id}
          isOpen={!!editBadge}
          onClose={() => setEditBadge(null)}
          onSuccess={handleEditSuccess}
        />
      )}
    </main>
  );
}

export default Badges;
