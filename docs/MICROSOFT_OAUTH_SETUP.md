# 🌐 Microsoft Outlook OAuth Setup Guide

To enable Outlook integration, you need to register "Secretary" in the Microsoft Entra ID (formerly Azure AD) portal.

### 1. Create a Microsoft App
1.  Go to the **[Microsoft Entra ID App Registrations](https://entra.microsoft.com/#view/Microsoft_AAD_RegisteredApps/ApplicationsListAsync)**.
2.  Click **New registration**.
3.  Name it: `Secretary`.
4.  **Supported account types**: "Accounts in any organizational directory (Any Microsoft Entra ID tenant - Multitenant) and personal Microsoft accounts".
5.  **Redirect URI**: select "Web" and enter: `http://localhost:5173/auth/outlook/callback`
6.  Click **Register**.

### 2. Configure API Permissions
1.  Go to **API permissions** in the sidebar.
2.  Click **Add a permission** -> **Microsoft Graph** -> **Delegated permissions**.
3.  Search for and check:
    *   `Calendars.Read` (to sync events)
    *   `offline_access` (for background refresh tokens)
4.  Click **Add permissions**.

### 3. Get Your Keys
1.  Go to **Overview** and copy the **Application (client) ID**.
2.  Go to **Certificates & secrets** -> **New client secret**.
3.  Copy the **Secret Value** immediately.

### 4. Enable in Supabase
1.  Open your **[Supabase Dashboard](https://supabase.com)**.
2.  Navigate to **Authentication > Providers > Microsoft**.
3.  Enable the provider and enter your Client ID and Client Secret.

---
*Follow these steps to unlock professional Outlook syncing!*
