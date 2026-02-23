import React, { useEffect, useMemo, useState } from 'react';
import { supabase } from '@/lib/customSupabaseClient';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { getAdminUserState, logAdminAction, saveAdminUserState } from '@/lib/adminConfig';
import { Ban, Pencil, Search, ShieldAlert, ShieldCheck, UserX } from 'lucide-react';

const ROLES = ['Admin', 'Editor', 'Moderador', 'Usuario'];

const isNewUser = (createdAt) => {
  if (!createdAt) return false;
  return Date.now() - new Date(createdAt).getTime() <= 7 * 24 * 60 * 60 * 1000;
};

const UserManagementModule = () => {
  const { toast } = useToast();
  const [users, setUsers] = useState([]);
  const [userState, setUserState] = useState(getAdminUserState());
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [editing, setEditing] = useState(null);
  const [editName, setEditName] = useState('');
  const [editBio, setEditBio] = useState('');

  const loadUsers = async () => {
    const { data, error } = await supabase.from('user_profiles').select('*').order('created_at', { ascending: false }).limit(1000);
    if (error) {
      toast({ title: 'No se pudo cargar usuarios', description: error.message, variant: 'destructive' });
      return;
    }
    setUsers(data || []);
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const updateUserState = (userId, patch) => {
    const next = { ...userState, [userId]: { ...(userState[userId] || {}), ...patch } };
    setUserState(next);
    saveAdminUserState(next);
  };

  const applyRole = (userId, role) => {
    updateUserState(userId, { role });
    logAdminAction('Rol de usuario actualizado', { user_id: userId, role });
    toast({ title: `Rol actualizado a ${role}` });
  };

  const suspendUser = (userId) => {
    updateUserState(userId, { status: 'suspended' });
    logAdminAction('Usuario suspendido', { user_id: userId });
  };

  const expelUser = (userId) => {
    updateUserState(userId, { status: 'expelled' });
    logAdminAction('Usuario expulsado', { user_id: userId });
  };

  const activateUser = (userId) => {
    updateUserState(userId, { status: 'active', blockedFromComments: false });
    logAdminAction('Usuario reactivado', { user_id: userId });
    toast({ title: 'Usuario activado' });
  };

  const blockUserComments = (userId) => {
    updateUserState(userId, { blockedFromComments: true, status: 'suspended' });
    logAdminAction('Usuario bloqueado (comentarios deshabilitados)', { user_id: userId });
    toast({ title: 'Usuario bloqueado', description: 'No podrá comentar ni participar en la comunidad.' });
  };

  const saveProfileEdit = async () => {
    if (!editing) return;
    const { error } = await supabase.from('user_profiles').update({ name: editName, bio: editBio }).eq('user_id', editing);
    if (error) {
      toast({ title: 'No se pudo guardar perfil', description: error.message, variant: 'destructive' });
      return;
    }
    setUsers((prev) => prev.map((u) => (u.user_id === editing ? { ...u, name: editName, bio: editBio } : u)));
    logAdminAction('Perfil de usuario editado', { user_id: editing });
    setEditing(null);
    toast({ title: 'Perfil actualizado' });
  };

  const enriched = users.map((u) => ({
    ...u,
    adminStatus: userState[u.user_id]?.status || 'active',
    adminRole: userState[u.user_id]?.role || 'Usuario',
  }));

  const filtered = useMemo(() => {
    return enriched.filter((u) => {
      const text = `${u.name || ''} ${u.bio || ''}`.toLowerCase();
      const bySearch = text.includes(search.toLowerCase());
      const byFilter =
        filter === 'all'
          ? true
          : filter === 'new'
            ? isNewUser(u.created_at)
            : u.adminStatus === filter;
      return bySearch && byFilter;
    });
  }, [enriched, filter, search]);

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-3xl font-bold text-slate-100">Gestión de usuarios</h2>
        <p className="text-sm text-slate-400">Perfiles, roles, estado y control de acceso.</p>
      </div>

      <Card className="border-slate-700/70 bg-slate-900/70">
        <CardHeader className="space-y-3">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <Input value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" placeholder="Buscar usuario..." />
          </div>
          <div className="flex flex-wrap gap-2">
            {['all', 'active', 'suspended', 'expelled', 'new'].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3 py-1.5 rounded-full text-xs border ${
                  filter === f ? 'bg-emerald-500/20 border-emerald-400 text-emerald-200' : 'bg-slate-800 border-slate-700 text-slate-300'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </CardHeader>
        <CardContent className="space-y-3 max-h-[72vh] overflow-y-auto">
          {filtered.length === 0 ? <p className="text-sm text-slate-400">Sin resultados.</p> : null}

          {filtered.map((u) => (
            <div key={u.user_id} className="rounded-xl border border-slate-700 bg-slate-950/60 p-4 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="text-sm font-semibold text-slate-100">{u.name || 'Usuario'}</p>
                  <p className="text-xs text-slate-400">Miembro desde {new Date(u.created_at).toLocaleDateString()}</p>
                </div>
                <div className="flex gap-2 items-center">
                  <span className="text-xs px-2 py-1 rounded-full bg-slate-800 text-slate-300">{u.adminStatus}</span>
                  <select
                    value={u.adminRole}
                    onChange={(e) => applyRole(u.user_id, e.target.value)}
                    className="rounded-md border border-slate-600 bg-slate-700/50 px-2 py-1 text-xs text-slate-100"
                  >
                    {ROLES.map((role) => (
                      <option key={role} value={role}>{role}</option>
                    ))}
                  </select>
                </div>
              </div>

              <p className="text-sm text-slate-300 line-clamp-3">{u.bio || 'Sin bio'}</p>

              {editing === u.user_id ? (
                <div className="space-y-2">
                  <Input value={editName} onChange={(e) => setEditName(e.target.value)} placeholder="Nombre" />
                  <textarea
                    rows={3}
                    value={editBio}
                    onChange={(e) => setEditBio(e.target.value)}
                    className="w-full rounded-lg border border-slate-600 bg-slate-700/50 px-3 py-2 text-sm text-slate-100"
                  />
                  <div className="flex gap-2">
                    <Button size="sm" onClick={saveProfileEdit}>Guardar</Button>
                    <Button size="sm" variant="outline" onClick={() => setEditing(null)}>Cancelar</Button>
                  </div>
                </div>
              ) : null}

              <div className="flex flex-wrap gap-1">
                <Button
                  size="icon"
                  variant="ghost"
                  title="Editar perfil"
                  onClick={() => {
                    setEditing(u.user_id);
                    setEditName(u.name || '');
                    setEditBio(u.bio || '');
                  }}
                >
                  <Pencil className="w-4 h-4 text-sky-400" />
                </Button>
                <Button size="icon" variant="ghost" title="Suspender" onClick={() => suspendUser(u.user_id)}>
                  <Ban className="w-4 h-4 text-amber-400" />
                </Button>
                <Button size="icon" variant="ghost" title="Bloquear (sin comentarios)" onClick={() => blockUserComments(u.user_id)}>
                  <ShieldAlert className="w-4 h-4 text-orange-400" />
                </Button>
                <Button size="icon" variant="ghost" title="Expulsar" onClick={() => expelUser(u.user_id)}>
                  <UserX className="w-4 h-4 text-rose-400" />
                </Button>
                <Button size="icon" variant="ghost" title="Activar" onClick={() => activateUser(u.user_id)}>
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                </Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
};

export default UserManagementModule;
