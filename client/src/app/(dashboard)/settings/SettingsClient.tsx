'use client';

import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';

export default function SettingsClient() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');

  // Dummy state for inputs
  const [name, setName] = useState(user?.name || 'Jane Doe');
  const [email, setEmail] = useState(user?.email || 'jane.doe@example.com');

  const tabs = [
    { id: 'profile', label: 'Profile', icon: 'person' },
    { id: 'domains', label: 'Custom Domains', icon: 'dns' },
    { id: 'api', label: 'API Keys', icon: 'key' },
    { id: 'security', label: 'Security', icon: 'security' },
    { id: 'notifications', label: 'Notifications', icon: 'notifications_active' },
  ];

  return (
    <div className="flex-1 overflow-y-auto w-full max-w-container-max mx-auto pb-24">
      <div className="mb-8">
        <h2 className="font-headline-lg text-headline-lg text-on-surface mb-2">Settings</h2>
        <p className="font-body-md text-body-md text-on-surface-variant">Manage your account, workspace preferences, and API access.</p>
      </div>
      
      <div className="flex flex-col lg:flex-row gap-10">
        {/* Settings Vertical Nav */}
        <aside className="w-full lg:w-56 shrink-0">
          <nav className="flex flex-row lg:flex-col gap-1 overflow-x-auto lg:overflow-visible pb-4 lg:pb-0">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2.5 rounded font-label-md text-label-md whitespace-nowrap flex items-center gap-2 transition-colors ${
                  activeTab === tab.id
                    ? 'text-primary bg-surface-container-low'
                    : 'text-on-surface-variant hover:bg-surface-container-low hover:text-primary'
                }`}
              >
                <span className="material-symbols-outlined text-sm">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </nav>
        </aside>

        {/* Settings Content Canvas */}
        <div className="flex-1 space-y-8">
          
          {/* Profile Card */}
          <section className="bg-surface-container-lowest rounded-xl shadow-sm border border-border-light p-6 md:p-8">
            <h3 className="font-headline-md text-headline-md text-on-surface mb-6 border-b border-border-light pb-4">Profile Information</h3>
            <div className="flex flex-col md:flex-row gap-8 items-start mb-8">
              <div className="relative group cursor-pointer shrink-0">
                <img alt="Profile Avatar" className="w-24 h-24 rounded-full border-2 border-border-light object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCbwm9t_Hj1SjOabMVoKcEE_xQ6giMIRdSeWpr60a-Ws8Xl79a9uXYtMP43FdsRxehtmH8nQ9JTo-SAekq7hPRXqMlt6_765fzX7YuOy7uBvXv_bZJ77WQBWk9GLbR-gaFnrQkXjAf_YZfMHnyLFP9HW9q2ALO2E2lSZnfyESExqUfNEdT__MQF-JAQG6S8UYgi8oVsvq3ksXJXOAqW_-idTFiHOVNHvDsN5rA9MaZKCb4HYZYdoAqQRaY_paIAl09Cm6v3SQqsiw"/>
                <div className="absolute inset-0 bg-on-background/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <span className="material-symbols-outlined text-surface-container-lowest">photo_camera</span>
                </div>
              </div>
              <div className="flex-1 space-y-4 w-full">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-label-sm text-label-sm text-on-surface-variant mb-1.5 uppercase tracking-wider">Full Name</label>
                    <input 
                      className="w-full bg-background-subtle border border-border-light rounded px-3 py-2 focus:bg-surface-container-lowest focus:ring-2 focus:ring-secondary focus:border-transparent outline-none font-body-md text-body-md transition-all" 
                      type="text" 
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block font-label-sm text-label-sm text-on-surface-variant mb-1.5 uppercase tracking-wider">Email Address</label>
                    <input 
                      className="w-full bg-background-subtle border border-border-light rounded px-3 py-2 focus:bg-surface-container-lowest focus:ring-2 focus:ring-secondary focus:border-transparent outline-none font-body-md text-body-md transition-all" 
                      type="email" 
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                </div>
                <div className="pt-2">
                  <button className="px-4 py-2 bg-surface-container-lowest border border-secondary text-secondary rounded font-label-md text-label-md hover:bg-background-subtle transition-colors">
                    Save Changes
                  </button>
                </div>
              </div>
            </div>
          </section>

          {/* Custom Domains Card */}
          <section className="bg-surface-container-lowest rounded-xl shadow-sm border border-border-light p-6 md:p-8">
            <div className="flex justify-between items-center border-b border-border-light pb-4 mb-6">
              <h3 className="font-headline-md text-headline-md text-on-surface">Custom Domains</h3>
              <button suppressHydrationWarning className="px-4 py-2 bg-primary text-on-primary rounded font-label-md text-label-md hover:bg-surface-tint transition-colors flex items-center gap-2">
                <span className="material-symbols-outlined text-sm">add</span>
                Add Domain
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded border border-border-light bg-background-subtle hover:shadow-md transition-shadow flex justify-between items-center">
                <div>
                  <p className="font-mono-code text-mono-code font-medium text-on-surface mb-1">link.mycompany.com</p>
                  <div className="flex items-center gap-1.5 text-success-green font-label-sm text-label-sm">
                    <span className="w-2 h-2 rounded-full bg-success-green"></span>
                    Active
                  </div>
                </div>
                <button suppressHydrationWarning className="text-on-surface-variant hover:text-primary p-2">
                  <span className="material-symbols-outlined">more_vert</span>
                </button>
              </div>
              <div className="p-4 rounded border border-border-light bg-background-subtle hover:shadow-md transition-shadow flex justify-between items-center">
                <div>
                  <p className="font-mono-code text-mono-code font-medium text-on-surface mb-1">go.startup.io</p>
                  <div className="flex items-center gap-1.5 text-secondary font-label-sm text-label-sm">
                    <span className="w-2 h-2 rounded-full bg-secondary"></span>
                    Pending Verification
                  </div>
                </div>
                <button suppressHydrationWarning className="text-on-surface-variant hover:text-primary p-2">
                  <span className="material-symbols-outlined">more_vert</span>
                </button>
              </div>
            </div>
          </section>

          {/* API Keys Card */}
          <section className="bg-surface-container-lowest rounded-xl shadow-sm border border-border-light p-6 md:p-8">
            <div className="flex justify-between items-center border-b border-border-light pb-4 mb-6">
              <div>
                <h3 className="font-headline-md text-headline-md text-on-surface mb-1">API Keys</h3>
                <a className="font-body-sm text-body-sm text-tertiary-container hover:underline flex items-center gap-1" href="#">
                  View API Documentation
                  <span className="material-symbols-outlined text-xs">open_in_new</span>
                </a>
              </div>
              <button suppressHydrationWarning className="px-4 py-2 bg-surface-container-lowest border border-secondary text-secondary rounded font-label-md text-label-md hover:bg-background-subtle transition-colors flex items-center gap-2">
                <span className="material-symbols-outlined text-sm">vpn_key</span>
                Generate Key
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-border-light bg-background-subtle">
                    <th className="py-3 px-4 font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">Name</th>
                    <th className="py-3 px-4 font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">Prefix</th>
                    <th className="py-3 px-4 font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">Created</th>
                    <th className="py-3 px-4 font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="font-body-sm text-body-sm divide-y divide-border-light">
                  <tr className="hover:bg-background-subtle transition-colors">
                    <td className="py-3 px-4 text-on-surface font-medium">Production App</td>
                    <td className="py-3 px-4 font-mono-code text-on-surface-variant">vltz_prod_...</td>
                    <td className="py-3 px-4 text-on-surface-variant">Oct 24, 2023</td>
                    <td className="py-3 px-4 text-right">
                      <button suppressHydrationWarning className="text-error hover:text-on-primary-fixed-variant font-label-sm text-label-sm transition-colors">Revoke</button>
                    </td>
                  </tr>
                  <tr className="hover:bg-background-subtle transition-colors">
                    <td className="py-3 px-4 text-on-surface font-medium">Zapier Integration</td>
                    <td className="py-3 px-4 font-mono-code text-on-surface-variant">vltz_zap_...</td>
                    <td className="py-3 px-4 text-on-surface-variant">Nov 02, 2023</td>
                    <td className="py-3 px-4 text-right">
                      <button suppressHydrationWarning className="text-error hover:text-on-primary-fixed-variant font-label-sm text-label-sm transition-colors">Revoke</button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

        </div>
      </div>
    </div>
  );
}
