import { supabase } from '../lib/supabase';

/**
 * Admin Service
 * Handles administrative operations for Managing the Secretary App
 */
export class AdminService {
    /**
     * Get global system statistics
     */
    static async getSystemStats() {
        const { data, error } = await supabase
            .from('system_stats')
            .select('*')
            .order('last_updated', { ascending: false })
            .limit(1)
            .single();

        if (error) {
            console.error('[AdminService] Failed to fetch stats:', error);
            // Return defaults if table empty
            return { total_users: 0, active_syncs: 0, premium_conversions: 0 };
        }
        return data;
    }

    /**
     * List all user profiles (Admin only RLS required)
     */
    static async listUsers(page = 0, limit = 20) {
        const { data, error } = await supabase
            .from('user_profiles')
            .select('*')
            .range(page * limit, (page + 1) * limit - 1)
            .order('created_at', { ascending: false });

        if (error) throw error;
        return data;
    }

    /**
     * Update user tier
     */
    static async updateUserTier(userId, tier) {
        const { data, error } = await supabase
            .from('user_profiles')
            .update({ tier })
            .eq('id', userId)
            .select()
            .single();

        if (error) throw error;
        return data;
    }

    /**
     * Toggle admin status for a user
     */
    static async toggleAdmin(userId, isAdmin) {
        const { data, error } = await supabase
            .from('user_profiles')
            .update({ is_admin: isAdmin })
            .eq('id', userId)
            .select()
            .single();

        if (error) throw error;
        return data;
    }

    /**
     * Monitor Global Sync Health
     * (Simulated query, in prod this would check logs/events)
     */
    static async getSyncHealth() {
        const { data, error } = await supabase
            .from('user_profiles')
            .select('last_sync_status');

        if (error) return { total: 0, healthy: 0 };

        const stats = data.reduce((acc, profile) => {
            acc.total++;
            if (profile.last_sync_status?.healthy) acc.healthy++;
            return acc;
        }, { total: 0, healthy: 0 });

        return stats;
    }

    /**
     * Get all global system settings
     */
    static async getSystemSettings() {
        const { data, error } = await supabase
            .from('system_settings')
            .select('*');

        if (error) throw error;
        return data;
    }

    /**
     * Update a specific system setting
     */
    static async updateSystemSetting(key, value) {
        const { data, error } = await supabase
            .from('system_settings')
            .update({ value, updated_at: new Date().toISOString() })
            .eq('key', key)
            .select()
            .single();

        if (error) throw error;
        return data;
    }

    /**
     * Inspect Security Policies (RLS)
     */
    static async getSecurityPolicies() {
        const { data, error } = await supabase
            .from('admin_security_policies')
            .select('*');

        if (error) {
            console.error('[AdminService] Policy fetch failed:', error);
            return [];
        }
        return data;
    }

    /**
     * Update User Profile (Full access for Admin)
     */
    static async fullUpdateUser(userId, updates) {
        const { data, error } = await supabase
            .from('user_profiles')
            .update(updates)
            .eq('id', userId)
            .select()
            .single();

        if (error) throw error;
        return data;
    }
}

export default AdminService;
