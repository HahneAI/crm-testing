import { supabase } from "../../services/supabase";
import { Client, Job } from "../../types/crm";

export class CRMSynchronizer {
  private static instance: CRMSynchronizer;
  private subscriptions: Map<string, any> = new Map();

  static getInstance(): CRMSynchronizer {
    if (!CRMSynchronizer.instance) {
      CRMSynchronizer.instance = new CRMSynchronizer();
    }
    return CRMSynchronizer.instance;
  }

  // Subscribe to client changes
  subscribeToClients(companyId: string, callback: (clients: Client[]) => void) {
    const subscription = supabase
      .channel(`clients_${companyId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'clients',
          filter: `company_id=eq.${companyId}`
        },
        () => {
          this.fetchClientsAndNotify(companyId, callback);
        }
      )
      .subscribe();

    this.subscriptions.set(`clients_${companyId}`, subscription);
  }

  // Subscribe to job changes
  subscribeToJobs(companyId: string, callback: (jobs: Job[]) => void) {
    const subscription = supabase
      .channel(`jobs_${companyId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'jobs',
          filter: `company_id=eq.${companyId}`
        },
        () => {
          this.fetchJobsAndNotify(companyId, callback);
        }
      )
      .subscribe();

    this.subscriptions.set(`jobs_${companyId}`, subscription);
  }

  private async fetchClientsAndNotify(companyId: string, callback: (clients: Client[]) => void) {
    try {
      const { data } = await supabase
        .from('clients')
        .select('*')
        .eq('company_id', companyId);

      if (data) callback(data);
    } catch (error) {
      console.error('Error fetching clients:', error);
    }
  }

  private async fetchJobsAndNotify(companyId: string, callback: (jobs: Job[]) => void) {
    try {
      const { data } = await supabase
        .from('jobs')
        .select(`
          *,
          clients(*),
          job_materials(*),
          labor_entries(*)
        `)
        .eq('company_id', companyId);

      if (data) callback(data);
    } catch (error) {
      console.error('Error fetching jobs:', error);
    }
  }

  unsubscribe(key: string) {
    const subscription = this.subscriptions.get(key);
    if (subscription) {
      supabase.removeChannel(subscription);
      this.subscriptions.delete(key);
    }
  }

  unsubscribeAll() {
    this.subscriptions.forEach((subscription, key) => {
      supabase.removeChannel(subscription);
    });
    this.subscriptions.clear();
  }
}
