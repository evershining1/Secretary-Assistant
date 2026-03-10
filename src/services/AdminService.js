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
     * List all user profiles with administrative metadata
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
     * Update user role and granular permissions
     */
    static async updateAdminPermissions(userId, permissions) {
        const { data, error } = await supabase
            .from('user_profiles')
            .update({
                admin_permissions: permissions,
                is_admin: Object.values(permissions).some(v => v === true)
            })
            .eq('id', userId)
            .select()
            .single();

        if (error) throw error;
        return data;
    }

    /**
     * Send Global Broadcast to all users
     */
    static async sendBroadcast(broadcast) {
        const { data, error } = await supabase
            .from('system_broadcasts')
            .insert({
                title: broadcast.title,
                content: broadcast.content,
                type: broadcast.type || 'info', // 'info', 'warning', 'promo'
                target_tier: broadcast.target_tier || 'all',
                expires_at: broadcast.expires_at || null,
                created_by: (await supabase.auth.getUser()).data.user?.id
            })
            .select()
            .single();

        if (error) throw error;
        return data;
    }

    /**
     * Get AI Reasoning Audit Logs
     */
    static async getAIAuditLogs(limit = 50) {
        const { data, error } = await supabase
            .from('ai_audit_logs')
            .select('*, user_profiles(name, email)')
            .order('created_at', { ascending: false })
            .limit(limit);

        if (error) {
            console.warn('[AdminService] ai_audit_logs table might not exist yet.');
            return [];
        }
        return data;
    }

    /**
     * Toggle Global Sync Kill Switch
     */
    static async toggleGlobalSync(enabled) {
        return this.updateSystemSetting('global_sync_active', enabled);
    }

    /**
     * Update Application Layout/Content Configuration
     * Allows admin to change "placement of everything"
     */
    static async updateLayoutConfig(config) {
        return this.updateSystemSetting('ui_layout_config', config);
    }

    /**
     * Get Detailed Revenue Analytics
     */
    static async getRevenueAnalytics() {
        const { data: users, error } = await supabase
            .from('user_profiles')
            .select('tier, created_at');

        if (error) throw error;

        // Basic calculation for MRR and Churn
        const premiumUsers = users.filter(u => u.tier === 'premium').length;
        const mrr = premiumUsers * 5.00; // Hardcoded $5 for now

        return {
            mrr,
            total_premium: premiumUsers,
            growth_rate: 12.5, // Mocked for now
            churn_risk: 5.2 // Mocked for now
        };
    }

    /**
     * Support Ghost Mode (User Impersonation Tooling)
     * Generates a sync event to let the frontend know to "View As"
     */
    static async initiateImpersonation(userId) {
        console.log(`[Admin] Initiating ghost mode for user: ${userId}`);
        // This is primarily handled in the store, but we log it here
        const { error } = await supabase
            .from('admin_audit_logs')
            .insert({
                action: 'impersonation_start',
                target_user_id: userId,
                admin_id: (await supabase.auth.getUser()).data.user?.id
            });

        return { success: !error };
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
     * Update a specific system setting
     */
    static async updateSystemSetting(key, value) {
        // First check if it exists to decide on insert vs update
        const { data: existing } = await supabase
            .from('system_settings')
            .select('*')
            .eq('key', key)
            .single();

        let result;
        if (existing) {
            result = await supabase
                .from('system_settings')
                .update({ value, updated_at: new Date().toISOString() })
                .eq('key', key)
                .select()
                .single();
        } else {
            result = await supabase
                .from('system_settings')
                .insert({ key, value, updated_at: new Date().toISOString() })
                .select()
                .single();
        }

        if (result.error) throw result.error;
        return result.data;
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
