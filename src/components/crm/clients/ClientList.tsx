import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { supabase } from '../../../services/supabase';
import { Client, ClientFilters, ClientSortOptions } from '../../../types/crm';

interface ClientListProps {
  onSelectClient?: (client: Client) => void;
  showActions?: boolean;
}

export const ClientList: React.FC<ClientListProps> = ({
  onSelectClient,
  showActions = true
}) => {
  const { userProfile } = useAuth();
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<ClientFilters>({});
  const [sortBy, setSortBy] = useState<ClientSortOptions>('name');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (userProfile?.company_id) {
      loadClients();
    }
  }, [userProfile, filters, sortBy, searchTerm]);

  const loadClients = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('clients')
        .select(`
          *,
          client_contacts(*),
          jobs(count)
        `)
        .eq('company_id', userProfile.company_id);

      // Apply filters
      if (filters.status) {
        query = query.eq('status', filters.status);
      }
      if (filters.type) {
        query = query.eq('client_type', filters.type);
      }
      if (searchTerm) {
        query = query.or(`name.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%`);
      }

      // Apply sorting
      const sortColumn = sortBy === 'recent' ? 'updated_at' : sortBy;
      query = query.order(sortColumn, { ascending: sortBy !== 'recent' });

      const { data, error } = await query;

      if (error) throw error;
      setClients(data || []);
    } catch (error) {
      console.error('Error loading clients:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClient = async (clientId: string) => {
    if (!confirm('Are you sure you want to delete this client?')) return;

    try {
      const { error } = await supabase
        .from('clients')
        .delete()
        .eq('id', clientId);

      if (error) throw error;
      await loadClients();
    } catch (error) {
      console.error('Error deleting client:', error);
    }
  };

  return (
    <div className="client-list">
      {/* Search and filter controls */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Search clients..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="flex gap-2">
          <select
            value={filters.status || ''}
            onChange={(e) => setFilters(prev => ({
              ...prev,
              status: e.target.value || undefined
            }))}
            className="px-3 py-2 border rounded-lg"
          >
            <option value="">All Statuses</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="prospect">Prospect</option>
          </select>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as ClientSortOptions)}
            className="px-3 py-2 border rounded-lg"
          >
            <option value="name">Name</option>
            <option value="recent">Recently Updated</option>
            <option value="created_at">Date Created</option>
          </select>
        </div>
      </div>

      {/* Client cards/table */}
      {loading ? (
        <div className="text-center py-8">Loading clients...</div>
      ) : clients.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          No clients found. <button className="text-blue-600">Create your first client</button>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {clients.map(client => (
            <ClientCard
              key={client.id}
              client={client}
              onSelect={() => onSelectClient?.(client)}
              onDelete={() => handleDeleteClient(client.id)}
              showActions={showActions}
            />
          ))}
        </div>
      )}
    </div>
  );
};
