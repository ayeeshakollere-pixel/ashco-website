// ============================================================================
//  Team page — manage who is a Customer / Admin / Owner.
//    - Owners can change anyone's role (via the dropdown).
//    - Admins can VIEW the team, but the dropdowns are locked.
//    - The database itself blocks removing the last owner (no lockouts),
//      and we surface that as a friendly message if it happens.
//  People are shown by name + phone (their email lives in a secure table
//  the app isn't allowed to read directly — name + phone identifies them).
// ============================================================================
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase, supabaseReady } from '@/lib/supabase';
import { useAuth, type Role } from '@/lib/auth';

interface TeamMember {
  id: string;
  full_name: string | null;
  phone: string | null;
  role: Role;
  order_count: number;
}

const ROLE_LABEL: Record<Role, string> = {
  customer: 'Customer',
  admin: 'Admin',
  owner: 'Owner',
};

const ROLE_STYLE: Record<Role, string> = {
  customer: 'bg-gray-100 text-gray-700',
  admin: 'bg-ashco-yellow/20 text-ashco-black',
  owner: 'bg-ashco-green/15 text-ashco-green',
};

export default function Team() {
  const { ready, isAdmin, isOwner, userId } = useAuth();
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function loadMembers() {
    if (!supabaseReady) return;
    setLoading(true);
    const { data, error } = await supabase
      .from('profiles')
      .select('id, full_name, phone, role, order_count')
      .order('role', { ascending: true })
      .order('full_name', { ascending: true });
    if (error) {
      setError('Could not load the team list. Please refresh.');
    } else {
      setMembers((data as TeamMember[]) ?? []);
      setError(null);
    }
    setLoading(false);
  }

  useEffect(() => {
    if (ready && isAdmin) loadMembers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready, isAdmin]);

  async function changeRole(member: TeamMember, newRole: Role) {
    if (newRole === member.role) return;
    setSavingId(member.id);
    setMessage(null);
    setError(null);

    const { error } = await supabase
      .from('profiles')
      .update({ role: newRole })
      .eq('id', member.id);

    if (error) {
      // The database blocks removing the last owner — show that plainly.
      if (error.message?.toLowerCase().includes('last owner')) {
        setError('You can’t remove the last owner. Promote another owner first.');
      } else {
        setError('That change didn’t save. Please try again.');
      }
    } else {
      setMessage(`${member.full_name || 'User'} is now ${ROLE_LABEL[newRole]}.`);
      await loadMembers();
    }
    setSavingId(null);
  }

  // ---- Access states ---------------------------------------------------------
  if (!ready) {
    return <div className="p-8 text-center text-gray-500">Loading…</div>;
  }

  if (!isAdmin) {
    return (
      <div className="max-w-md mx-auto p-8 text-center">
        <h1 className="text-2xl font-bold text-ashco-black mb-2">Team</h1>
        <p className="text-gray-600 mb-6">You don’t have permission to view this page.</p>
        <Link to="/" className="text-ashco-green font-semibold underline">Back to home</Link>
      </div>
    );
  }

  // ---- Main page -------------------------------------------------------------
  return (
    <div className="max-w-3xl mx-auto p-4 sm:p-8">
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-ashco-black">Team</h1>
        <p className="text-gray-600 mt-1">
          {isOwner
            ? 'Set each person to Customer, Admin, or Owner.'
            : 'You can view the team. Only an Owner can change roles.'}
        </p>
      </div>

      {message && (
        <div className="mb-4 rounded-lg bg-ashco-green/10 text-ashco-green px-4 py-3 text-sm">
          {message}
        </div>
      )}
      {error && (
        <div className="mb-4 rounded-lg bg-red-50 text-red-700 px-4 py-3 text-sm">
          {error}
        </div>
      )}

      {loading ? (
        <div className="p-8 text-center text-gray-500">Loading team…</div>
      ) : members.length === 0 ? (
        <div className="p-8 text-center text-gray-500">No users yet.</div>
      ) : (
        <div className="space-y-3">
          {members.map((m) => {
            const isSelf = m.id === userId;
            return (
              <div
                key={m.id}
                className="flex items-center justify-between gap-4 rounded-xl border border-gray-200 bg-white px-4 py-3"
              >
                <div className="min-w-0">
                  <div className="font-semibold text-ashco-black truncate">
                    {m.full_name || 'Unnamed user'}
                    {isSelf && <span className="ml-2 text-xs text-gray-400">(you)</span>}
                  </div>
                  <div className="text-sm text-gray-500 truncate">
                    {m.phone || 'No phone'} · {m.order_count} order{m.order_count === 1 ? '' : 's'}
                  </div>
                </div>

                {isOwner ? (
                  <select
                    value={m.role}
                    disabled={savingId === m.id}
                    onChange={(e) => changeRole(m, e.target.value as Role)}
                    className="shrink-0 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-ashco-black focus:outline-none focus:ring-2 focus:ring-ashco-green disabled:opacity-50"
                  >
                    <option value="customer">Customer</option>
                    <option value="admin">Admin</option>
                    <option value="owner">Owner</option>
                  </select>
                ) : (
                  <span className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold ${ROLE_STYLE[m.role]}`}>
                    {ROLE_LABEL[m.role]}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
