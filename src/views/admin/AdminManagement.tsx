import React, { useState } from 'react';
import { db } from '../../services/db';
import { useAuth } from '../../context/AuthContext';
import { User, RoleType } from '../../types';
import { ShieldCheck, Plus, KeyRound, UserX, UserCheck, X } from 'lucide-react';

export const AdminManagement: React.FC = () => {
  const { currentUser, isSuperAdmin } = useAuth();
  const [users, setUsers] = useState<User[]>(db.getUsers());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [resetModalUser, setResetModalUser] = useState<User | null>(null);
  const [newPass, setNewPass] = useState('');
  const [msgSuccess, setMsgSuccess] = useState('');

  const [formData, setFormData] = useState({
    username: '',
    fullName: '',
    email: '',
    role: 'ADMINISTRATOR' as RoleType,
    password: '',
  });

  const reload = () => setUsers(db.getUsers());

  const adminUsers = users.filter((u) => u.role === 'ADMINISTRATOR' || u.role === 'SUPER_ADMIN');

  const handleCreateAdmin = (e: React.FormEvent) => {
    e.preventDefault();
    const adminName = currentUser?.fullName || 'Super Administrator';

    try {
      db.createUser(
        {
          username: formData.username.trim(),
          fullName: formData.fullName.trim(),
          email: formData.email.trim(),
          role: formData.role,
          passwordHash: formData.password,
          accountStatus: 'ACTIVE',
        },
        adminName
      );

      reload();
      setIsModalOpen(false);
      setMsgSuccess(`Administrator account @${formData.username} successfully created.`);
    } catch (err: any) {
      alert(err.message || 'Error creating administrator account');
    }
  };

  const handleToggleStatus = (targetUser: User) => {
    if (targetUser.id === currentUser?.id) {
      alert('You cannot deactivate your own active session account.');
      return;
    }
    const adminName = currentUser?.fullName || 'Super Administrator';
    const nextStatus = targetUser.accountStatus === 'ACTIVE' ? 'DISABLED' : 'ACTIVE';
    db.updateUser(targetUser.id, { accountStatus: nextStatus }, adminName);
    reload();
    setMsgSuccess(`User @${targetUser.username} status set to ${nextStatus}.`);
  };

  const handleResetPassword = () => {
    if (!resetModalUser || !newPass.trim()) return;
    const adminName = currentUser?.fullName || 'Super Administrator';
    db.resetUserPassword(resetModalUser.id, newPass.trim(), adminName, false);
    reload();
    setResetModalUser(null);
    setNewPass('');
    setMsgSuccess(`Password updated for @${resetModalUser.username}.`);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-red-700 bg-red-50 border border-red-200 px-2 py-0.5 rounded">
              Super-Admin Console
            </span>
            <span className="text-xs text-slate-500">· RBAC Authorization</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight font-serif mt-1">
            ADMINISTRATOR ACCOUNT MANAGEMENT
          </h1>
          <p className="text-xs sm:text-sm text-slate-600">
            Provision staff administrative accounts, configure access privileges, and manage security credentials
          </p>
        </div>

        <button
          onClick={() => {
            setFormData({
              username: '',
              fullName: '',
              email: '',
              role: 'ADMINISTRATOR',
              password: `Admin@${Math.floor(1000 + Math.random() * 9000)}`,
            });
            setIsModalOpen(true);
          }}
          className="px-4 py-2 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-lg flex items-center gap-1.5 transition-colors shadow-xs"
        >
          <Plus className="w-4 h-4" />
          Create Administrator Account
        </button>
      </div>

      {msgSuccess && (
        <div className="p-3 bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs font-semibold rounded-lg flex items-center justify-between">
          <span>✓ {msgSuccess}</span>
          <button onClick={() => setMsgSuccess('')}>
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Admins Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <table className="w-full text-left text-xs border-collapse">
          <thead className="bg-slate-100 border-b border-slate-200 text-slate-700 uppercase font-bold text-[11px]">
            <tr>
              <th className="py-3 px-4">Full Name</th>
              <th className="py-3 px-4">Username</th>
              <th className="py-3 px-4">Role Tier</th>
              <th className="py-3 px-4">Email</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4">Last Login</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {adminUsers.map((u) => (
              <tr key={u.id} className="hover:bg-slate-50">
                <td className="py-3 px-4 font-bold text-slate-900">{u.fullName}</td>
                <td className="py-3 px-4 font-mono font-semibold text-slate-700">
                  {u.username.startsWith('@') ? u.username : `@${u.username}`}
                </td>
                <td className="py-3 px-4 font-mono">
                  <span
                    className={`px-2 py-0.5 text-[10px] font-bold rounded ${
                      u.role === 'SUPER_ADMIN'
                        ? 'bg-red-100 text-red-900 border border-red-300'
                        : 'bg-blue-100 text-blue-900 border border-blue-300'
                    }`}
                  >
                    {u.role}
                  </span>
                </td>
                <td className="py-3 px-4 text-slate-600 font-mono text-[11px]">{u.email}</td>
                <td className="py-3 px-4">
                  <span
                    className={`px-2 py-0.5 text-[10px] font-bold rounded ${
                      u.accountStatus === 'ACTIVE'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {u.accountStatus}
                  </span>
                </td>
                <td className="py-3 px-4 font-mono text-[11px] text-slate-500">
                  {u.lastLoginAt ? new Date(u.lastLoginAt).toLocaleDateString() : 'Never'}
                </td>
                <td className="py-3 px-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() => {
                        setResetModalUser(u);
                        setNewPass(`Admin@${Math.floor(1000 + Math.random() * 9000)}`);
                      }}
                      className="p-1 text-slate-600 hover:text-amber-600"
                      title="Reset Password"
                    >
                      <KeyRound className="w-4 h-4" />
                    </button>
                    {u.role !== 'SUPER_ADMIN' && (
                      <button
                        onClick={() => handleToggleStatus(u)}
                        className={`p-1 ${
                          u.accountStatus === 'ACTIVE'
                            ? 'text-red-600 hover:text-red-800'
                            : 'text-emerald-600 hover:text-emerald-800'
                        }`}
                        title={u.accountStatus === 'ACTIVE' ? 'Disable Account' : 'Enable Account'}
                      >
                        {u.accountStatus === 'ACTIVE' ? (
                          <UserX className="w-4 h-4" />
                        ) : (
                          <UserCheck className="w-4 h-4" />
                        )}
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Create Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-300">
            <div className="bg-slate-900 text-white p-4 border-b border-red-700 flex items-center justify-between">
              <h3 className="font-bold text-sm text-white">PROVISION ADMINISTRATOR</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleCreateAdmin} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block text-slate-600 font-semibold mb-1">Full Official Name</label>
                <input
                  type="text"
                  required
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  placeholder="e.g. Captain Juan Dela Cruz"
                  className="w-full p-2 border border-slate-300 rounded font-semibold"
                />
              </div>

              <div>
                <label className="block text-slate-600 font-semibold mb-1">Username</label>
                <input
                  type="text"
                  required
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  placeholder="e.g. admin_jdelacruz"
                  className="w-full p-2 border border-slate-300 rounded font-mono font-bold"
                />
              </div>

              <div>
                <label className="block text-slate-600 font-semibold mb-1">Official Email</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full p-2 border border-slate-300 rounded font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-600 font-semibold mb-1">Administrative Role</label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value as any })}
                  className="w-full p-2 border border-slate-300 rounded bg-white font-semibold"
                >
                  <option value="ADMINISTRATOR">Administrator (Full operational access)</option>
                  <option value="SUPER_ADMIN">Super Administrator (Security, users, & audit)</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-600 font-semibold mb-1">Temporary Initial Password</label>
                <input
                  type="text"
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full p-2 border border-slate-300 rounded font-mono font-bold text-red-900"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-red-700 hover:bg-red-800 text-white rounded font-bold"
                >
                  Create Admin
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Password Reset Modal */}
      {resetModalUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-xs">
          <div className="w-full max-w-sm bg-white rounded-2xl shadow-2xl p-5 border border-slate-300 space-y-4 text-xs">
            <h3 className="font-bold text-sm text-slate-900">
              Reset Password for {resetModalUser.username.startsWith('@') ? resetModalUser.username : `@${resetModalUser.username}`}
            </h3>
            <div>
              <label className="block text-slate-600 font-semibold mb-1">New Password</label>
              <input
                type="text"
                value={newPass}
                onChange={(e) => setNewPass(e.target.value)}
                className="w-full p-2 border border-slate-300 rounded font-mono font-bold text-red-900"
              />
            </div>
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200">
              <button
                onClick={() => setResetModalUser(null)}
                className="px-3 py-1.5 bg-slate-100 rounded font-bold"
              >
                Cancel
              </button>
              <button
                onClick={handleResetPassword}
                className="px-4 py-1.5 bg-red-700 text-white rounded font-bold"
              >
                Update Password
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
