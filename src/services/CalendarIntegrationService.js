import useStore from '../store/useStore';
import { CalendarSyncEngine } from './CalendarSyncEngine';

/**
 * CalendarIntegrationService
 * High-level API for triggering calendar syncs
 * Now delegates to the professional CalendarSyncEngine
 */
export const CalendarIntegrationService = {
  /**
   * Trigger sync for a specific provider
   */
  sync: async (provider) => {
    console.log(`[CalendarIntegrationService] Initiating sync for ${provider}...`);

    try {
      // Delegate to the SyncEngine
      await CalendarSyncEngine.syncProvider(provider);

      // Show success notification
      import('../store/useUIStore').then(m =>
        m.useUIStore.getState().addNotification(
          `${provider.charAt(0).toUpperCase() + provider.slice(1)} Calendar Synced`,
          'success'
        )
      );
    } catch (error) {
      console.error(`[CalendarIntegrationService] Sync failed for ${provider}:`, error);

      // Show error notification
      import('../store/useUIStore').then(m =>
        m.useUIStore.getState().addNotification(
          `Failed to sync ${provider} calendar`,
          'error'
        )
      );
    }
  },

  /**
   * Sync all enabled providers
   */
  syncAll: async () => {
    console.log('[CalendarIntegrationService] Syncing all enabled calendars...');
    await CalendarSyncEngine.syncAll();
  },

  /**
   * Start periodic background sync
   */
  startAutoSync: (intervalMinutes = 15) => {
    if (CalendarSyncEngine.syncInterval) {
      console.warn('[CalendarIntegrationService] Auto-sync already running');
      return;
    }

    console.log(`[CalendarIntegrationService] Starting auto-sync every ${intervalMinutes} minutes`);
    CalendarSyncEngine.syncInterval = setInterval(() => {
      CalendarSyncEngine.syncAll();
    }, intervalMinutes * 60 * 1000);
  },

  /**
   * Stop periodic background sync
   */
  stopAutoSync: () => {
    if (CalendarSyncEngine.syncInterval) {
      clearInterval(CalendarSyncEngine.syncInterval);
      CalendarSyncEngine.syncInterval = null;
      console.log('[CalendarIntegrationService] Auto-sync stopped');
    }
  }
};
