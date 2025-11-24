import React from "react";
// ... (puedes pegar aquí el HTML/JSX que enviaste antes, adaptado a TSX si es necesario)

import {
  Users,
  Edit,
  Trash2,
  UserPlus,
  Eye,
  EyeOff,
  Shield,
  MapPin,
  Calendar,
  Star,
  LogOut,
} from "lucide-react";
import { useState } from "react";
import { ChartAreaInteractive } from "./chart-area-interactive";

import { useEffect } from "react";
import AdminBitacora from "./admin-bitacora";
import {
  listUsers,
  assignRole,
  editUser as editUserApi,
  disableUser,
  reactivateUser,
  listRoles,
  getUserById,
} from "@/api/auth";
import {
  listarBackups,
  crearBackup,
  restaurarBackup,
  descargarBackup,
  eliminarBackup,
} from "@/api/backups_restore";
import { useToast } from "@/hooks/use-toast";
import useAuth from "@/hooks/useAuth";

// Mapeo de IDs de roles a slugs (según contrato del backend)
// Backend: 1=Administrador, 2=Cliente, 3=Proveedor, 4=Soporte
const ROLE_MAP: Record<number, string> = {
  1: "administrador",
  2: "cliente",
  3: "proveedor",
  4: "soporte",
};
// Inverse map: slug -> id
const SLUG_TO_ID: Record<string, number> = Object.entries(ROLE_MAP).reduce(
  (acc, [id, slug]) => {
    acc[String(slug)] = Number(id);
    return acc;
  },
  {} as Record<string, number>
);

// Normalize a raw user object from backend into the local `User` shape
const normalizeApiUser = (raw: any): User => {
  // dev-only logging to help diagnose missing 'estado' values
  try {
    if (
      typeof window !== "undefined" &&
      process.env.NODE_ENV !== "production"
    ) {
      // Avoid noisy logs in production; provide compact display
      // eslint-disable-next-line no-console
      console.debug(
        "[normalizeApiUser] raw keys:",
        Object.keys(raw || {})
          .sort()
          .join(", ")
      );
    }
  } catch {}
  const id = String(raw.id ?? raw.pk ?? raw.user_id ?? raw.uuid ?? "");
  const email = raw.email || raw.username || raw.usuario || "";
  const nombres =
    raw.nombres || raw.first_name || raw.nombre || raw.full_name || "";
  const apellidos = raw.apellidos || raw.last_name || raw.apellidos || "";
  const name =
    `${(nombres || raw.name || raw.full_name || "").trim()} ${(
      apellidos || ""
    ).trim()}`.trim() ||
    raw.name ||
    raw.full_name ||
    raw.username ||
    "";

  // roles may come as [1,2] or [{id:1,slug:'admin'}] or ['administrador']
  let roles: number[] = [];
  let rolesSlugs: string[] = [];
  const extractRole = (r: any) => {
    if (typeof r === "number") return { id: r, slug: ROLE_MAP[r] };
    if (typeof r === "string") return { id: SLUG_TO_ID[r] ?? null, slug: r };
    if (r && typeof r === "object") {
      if (typeof r.id === "number")
        return { id: r.id, slug: r.slug ?? ROLE_MAP[r.id] };
      if (typeof r.slug === "string")
        return { id: SLUG_TO_ID[r.slug] ?? null, slug: r.slug };
    }
    return { id: null, slug: null };
  };

  if (Array.isArray(raw.roles)) {
    for (const r of raw.roles) {
      const ex = extractRole(r);
      if (ex.id) roles.push(ex.id);
      if (ex.slug) rolesSlugs.push(ex.slug);
    }
  } else if (Array.isArray(raw.role) && raw.role.length > 0) {
    for (const r of raw.role) {
      const ex = extractRole(r);
      if (ex.id) roles.push(ex.id);
      if (ex.slug) rolesSlugs.push(ex.slug);
    }
  } else if (typeof raw.rol === "object" && raw.rol?.id) {
    roles = [Number(raw.rol.id)];
    if (raw.rol?.slug) rolesSlugs = [raw.rol.slug];
  } else if (typeof raw.rol === "number") {
    roles = [raw.rol];
  } else if (typeof raw.roles === "string") {
    // single slug string
    const ex = extractRole(raw.roles);
    if (ex.id) roles.push(ex.id);
    if (ex.slug) rolesSlugs.push(ex.slug);
  }

  // Estado normalization: accept multiple possible field names and formats
  // Try direct known fields first
  let estado: any =
    raw.estado ??
    raw.status ??
    (raw.is_active !== undefined ? raw.is_active : undefined) ??
    raw.active ??
    raw.enabled ??
    raw.habilitado ??
    "";
  // If not found, scan one level deep for common keys (some APIs nest user data)
  if (
    (estado === "" || estado === undefined || estado === null) &&
    raw &&
    typeof raw === "object"
  ) {
    const commonKeys = [
      "is_active",
      "isActive",
      "active",
      "estado",
      "status",
      "enabled",
      "habilitado",
    ];
    for (const k of commonKeys) {
      if (raw[k] !== undefined && raw[k] !== null) {
        estado = raw[k];
        break;
      }
    }
    // Look into one level nested objects (e.g. raw.user, raw.usuario, raw.data)
    if (estado === "" || estado === undefined || estado === null) {
      const nestedCandidates = [
        "user",
        "usuario",
        "data",
        "profile",
        "attributes",
      ];
      for (const nc of nestedCandidates) {
        const nested = raw[nc];
        if (nested && typeof nested === "object") {
          for (const k of commonKeys) {
            if (nested[k] !== undefined && nested[k] !== null) {
              estado = nested[k];
              break;
            }
          }
          if (estado !== "" && estado !== undefined && estado !== null) break;
        }
      }
    }
  }
  // Normalize boolean-like values
  if (estado === true || estado === 1) estado = "activo";
  else if (estado === false || estado === 0) estado = "inactivo";
  else {
    const s = String(estado || "").toLowerCase();
    if (
      s === "true" ||
      s === "activo" ||
      s === "active" ||
      s === "enabled" ||
      s === "1"
    )
      estado = "activo";
    else if (
      s === "false" ||
      s === "inactivo" ||
      s === "inactive" ||
      s === "disabled" ||
      s === "0"
    )
      estado = "inactivo";
    else estado = "";
  }

  // Capture an explicit boolean when available so UI can make correct decisions
  // rawActiveVal can be boolean or numeric flag from different API shapes
  const rawActiveVal =
    raw.is_active ?? raw.active ?? raw.enabled ?? raw.habilitado;
  let isActiveMaybe: boolean | null = null;
  if (rawActiveVal === true || rawActiveVal === 1) isActiveMaybe = true;
  else if (rawActiveVal === false || rawActiveVal === 0) isActiveMaybe = false;

  const roleStrFromSlug =
    rolesSlugs && rolesSlugs.length > 0
      ? String(rolesSlugs[0]).toLowerCase()
      : undefined;
  const roleStrFromId =
    roles.length > 0
      ? String(ROLE_MAP[roles[0]] || roles[0]).toLowerCase()
      : undefined;
  const finalRoleStr =
    roleStrFromSlug ||
    roleStrFromId ||
    String(raw.role || raw.rol || "").toLowerCase();

  return {
    id,
    name,
    nombres,
    apellidos,
    email,
    role: finalRoleStr,
    roles,
    rolesSlugs,
    estado: String(estado || "").toLowerCase(),
    // dev-only: show normalized resultado in console for debugging
    // eslint-disable-next-line no-console
    ...(typeof window !== "undefined" && process.env.NODE_ENV !== "production"
      ? {
          __normalized_debug: {
            estado: String(estado || "").toLowerCase(),
            isActiveMaybe,
          },
        }
      : {}),
    // explicit boolean hint (true/false) when backend provides it, otherwise null
    isActiveMaybe,
    location: raw.location || raw.ciudad || raw.city || undefined,
    registrationDate:
      raw.created_at || raw.date_joined || raw.registered_at || undefined,
    telefono: raw.telefono || raw.phone || undefined,
    fecha_nacimiento: raw.fecha_nacimiento || raw.birth_date || null,
    genero: raw.genero || raw.gender || undefined,
    documento_identidad: raw.documento_identidad || raw.document_number || null,
    pais: raw.pais || raw.country || undefined,
  } as User;
};

interface User {
  id: string;
  name: string;
  nombres?: string;
  apellidos?: string;
  email: string;
  role?: string; // principal (opcional)
  roles?: number[]; // array de ids de roles
  rolesSlugs?: string[]; // array de slugs cuando backend devuelve slugs
  estado: string;
  // explicit boolean hint when backend provides is_active/active/etc
  isActiveMaybe?: boolean | null;
  // dev-only debug payload attached during normalization (not present in production)
  __normalized_debug?: { estado?: string; isActiveMaybe?: boolean | null };
  location?: string;
  registrationDate?: string;
  telefono?: string;
  fecha_nacimiento?: string | null;
  genero?: string;
  documento_identidad?: string | null;
  pais?: string;
}

// Fallback static roles (used only if the backend roles endpoint is unavailable)
const FALLBACK_ROLES = ["administrador", "cliente", "proveedor", "soporte"];

const AdminDashboard = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const { logout, user: currentUser } = useAuth();
  const [filterRole, setFilterRole] = useState("todos");
  const [filterStatus, setFilterStatus] = useState("todos");
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("usuarios"); // Por defecto mostrar gestión de usuarios
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  // Estado para modal de edición
  const [showEditModal, setShowEditModal] = useState(false);
  const [editUser, setEditUser] = useState<User | null>(null);
  const [editForm, setEditForm] = useState({
    nombres: "",
    apellidos: "",
    telefono: "",
    fecha_nacimiento: "",
    genero: "",
    documento_identidad: "",
    pais: "",
    email: "",
  });

  // Available roles pulled from backend (slug/name/id). If empty, fall back to FALLBACK_ROLES
  const [availableRoles, setAvailableRoles] = useState<
    Array<{ id?: number; slug: string; name?: string }>
  >([]);
  // Loading state per-user for actions like disable/reactivate to show spinners and avoid duplicate clicks
  const [userActionLoading, setUserActionLoading] = useState<
    Record<string, boolean>
  >({});

  // Determinar el tipo de panel según el rol del usuario
  const getPanelTitle = () => {
    const roleStr = String(currentUser?.role || "").toLowerCase();
    if (currentUser?.roles?.includes(1) || roleStr === "administrador") {
      return "Panel Administrativo - Turismo Bolivia";
    } else if (currentUser?.roles?.includes(4) || roleStr === "soporte") {
      return "Panel de Soporte - Turismo Bolivia";
    }
    return "Panel de Gestión - Turismo Bolivia";
  };

  const getPanelDescription = () => {
    const roleStr = String(currentUser?.role || "").toLowerCase();
    if (currentUser?.roles?.includes(1) || roleStr === "administrador") {
      return "Gestiona usuarios, roles y permisos de tu plataforma turística";
    } else if (currentUser?.roles?.includes(4) || roleStr === "soporte") {
      return "Proporciona soporte y gestiona usuarios de la plataforma turística";
    }
    return "Gestiona tu plataforma turística";
  };

  useEffect(() => {
    setLoading(true);
    (async () => {
      try {
        // Only attempt to load users if currentUser appears to have admin/change_user privileges
        const roleStr = String(currentUser?.role || "").toLowerCase();
        const isAdmin = !!(
          currentUser?.roles?.includes(1) || roleStr === "administrador"
        );
        if (!currentUser || !isAdmin) {
          setError("No tienes permisos para ver la gestión de usuarios.");
          setUsers([]);
          setLoading(false);
          return;
        }

        const res = await listUsers();
        // listUsers returns { data: [...], meta?: {count,...} } or { data: results }
        const arr = res?.data || [];
        // dev-only logging to inspect server response and normalized users
        if (
          typeof window !== "undefined" &&
          process.env.NODE_ENV !== "production"
        ) {
          try {
            // eslint-disable-next-line no-console
            console.debug(
              "[AdminDashboard] listUsers response sample:",
              Array.isArray(arr) ? arr.slice(0, 3) : arr
            );
          } catch {}
        }
        const mapped = Array.isArray(arr)
          ? arr.map((a) => {
              const nu = normalizeApiUser(a);
              if (
                typeof window !== "undefined" &&
                process.env.NODE_ENV !== "production"
              ) {
                try {
                  // eslint-disable-next-line no-console
                  console.debug("[AdminDashboard] normalized user]", {
                    id: nu.id,
                    estado: nu.estado,
                    isActiveMaybe: nu.isActiveMaybe,
                    rawSampleKeys: Object.keys(a || {}).slice(0, 5),
                  });
                } catch {}
              }
              return nu;
            })
          : [];
        setUsers(mapped);
      } catch (e) {
        setError("No se pudieron cargar los usuarios");
      } finally {
        setLoading(false);
      }
    })();
  }, [currentUser]);

  // Fetch roles from backend if user is admin (non-blocking)
  useEffect(() => {
    (async () => {
      try {
        const roleRes = await listRoles();
        const data = roleRes?.data;
        // Normalize expected shapes: array of roles, or { results: [...] }
        let list: any[] = [];
        if (Array.isArray(data)) list = data;
        else if (data && Array.isArray(data.results)) list = data.results;
        else if (data && typeof data === "object") {
          // Some backends return objects indexed by id
          list = Object.values(data);
        }
        const normalized = list.map((r) => ({
          id: r.id,
          slug: String(
            r.slug || r.name || r.nombre || r.label || r.id
          ).toLowerCase(),
          name: r.name || r.nombre || r.label,
        }));
        if (normalized.length > 0) setAvailableRoles(normalized);
      } catch (err) {
        // ignore - we'll use fallback static roles
      }
    })();
  }, [currentUser]);

  const filteredUsers = users.filter((user) => {
    const nombres = user.nombres || "";
    const apellidos = user.apellidos || "";
    const nombreCompleto = `${nombres} ${apellidos}`.trim();

    // Filtro de búsqueda por nombre o email
    const matchesSearch =
      nombreCompleto.toLowerCase().includes(searchTerm.toLowerCase()) ||
      String(user.email || "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase());

    // Filtro por rol - corregido para trabajar con nombres de roles
    let matchesRole = true;
    if (filterRole !== "todos") {
      // Consider both role IDs and role slugs when filtering
      const userRoleNamesFromIds = (user.roles || [])
        .map((roleId) => ROLE_MAP[roleId])
        .filter(Boolean);
      const userRoleSlugs = user.rolesSlugs || [];
      const userAllRoleStrings = [
        ...userRoleNamesFromIds.map((s) => String(s)),
        ...userRoleSlugs.map((s) => String(s)),
        ...(user.role ? [user.role] : []),
      ].map((s) => s.toLowerCase());
      matchesRole = userAllRoleStrings.includes(
        String(filterRole).toLowerCase()
      );
    }

    // Filtro por estado
    const matchesStatus =
      filterStatus === "todos" || user.estado?.toLowerCase() === filterStatus;

    return matchesSearch && matchesRole && matchesStatus;
  });

  // Helper to determine if a user is active. Accepts multiple possible fields/formats.
  const isUserActive = (u: any) => {
    if (!u) return false;
    // If the normalized user contains an explicit boolean hint, prefer that
    if (typeof u.isActiveMaybe === "boolean") return !!u.isActiveMaybe;
    const raw =
      u.estado ?? u.is_active ?? u.active ?? u.enabled ?? u.habilitado ?? "";
    const s = String(raw || "").toLowerCase();
    // If estado is not provided, assume active by default to allow disabling from UI
    if (!s) return true;
    return (
      s === "activo" ||
      s === "true" ||
      s === "1" ||
      s === "active" ||
      s === "enabled"
    );
  };

  const isUserInactive = (u: any) => {
    if (!u) return false;
    if (typeof u.isActiveMaybe === "boolean") return !u.isActiveMaybe;
    const raw =
      u.estado ?? u.is_active ?? u.active ?? u.enabled ?? u.habilitado ?? "";
    const s = String(raw || "").toLowerCase();
    return (
      s === "inactivo" ||
      s === "inactive" ||
      s === "disabled" ||
      s === "false" ||
      s === "0"
    );
  };

  // Deshabilitar usuario
  const handleDisableUser = async (userId: string) => {
    // optimistic UI: set user to inactive immediately and show spinner for that user
    setUserActionLoading((prev) => ({ ...prev, [userId]: true }));
    const prevUsers = users;
    setUsers((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, estado: "inactivo" } : u))
    );
    try {
      await disableUser(userId);
      // don't overwrite optimistic change with a server list that may omit the field;
      // update only the affected user to keep UI consistent
      setUsers((prev) =>
        prev.map((u) =>
          u.id === userId
            ? { ...u, estado: "inactivo", isActiveMaybe: false }
            : u
        )
      );
      toast({
        title: "Usuario deshabilitado",
        description: "El usuario ha sido deshabilitado correctamente.",
        duration: 3500,
      });
    } catch (err) {
      // revert optimistic update
      setUsers(prevUsers);
      toast({
        title: "Error al deshabilitar usuario",
        description: "No se pudo deshabilitar el usuario. Intenta nuevamente.",
        variant: "destructive",
        duration: 3500,
      });
    } finally {
      setUserActionLoading((prev) => ({ ...prev, [userId]: false }));
    }
  };

  // Reactivar usuario
  const handleReactivateUser = async (userId: string) => {
    setUserActionLoading((prev) => ({ ...prev, [userId]: true }));
    const prevUsers = users;
    setUsers((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, estado: "activo" } : u))
    );
    try {
      await reactivateUser(userId);
      setUsers((prev) =>
        prev.map((u) =>
          u.id === userId ? { ...u, estado: "activo", isActiveMaybe: true } : u
        )
      );
      toast({
        title: "Usuario reactivado",
        description: "El usuario ha sido reactivado correctamente.",
        duration: 3500,
      });
    } catch (err) {
      setUsers(prevUsers);
      toast({
        title: "Error al reactivar usuario",
        description: "No se pudo reactivar el usuario. Intenta nuevamente.",
        variant: "destructive",
        duration: 3500,
      });
    } finally {
      setUserActionLoading((prev) => ({ ...prev, [userId]: false }));
    }
  };

  // Asignar rol a usuario
  const handleAssignRole = async (roleSlugOrId: string | number) => {
    if (!selectedUser) return;
    try {
      // Determine slug to send to backend (prefer slug when present)
      let roleSlug: string | undefined;
      if (typeof roleSlugOrId === "number") {
        roleSlug = ROLE_MAP[roleSlugOrId];
      } else {
        roleSlug = String(roleSlugOrId).toLowerCase();
      }
      if (!roleSlug) throw new Error("Rol no válido");
      await assignRole(selectedUser.id, roleSlug);
      setSelectedUser(null);
      setShowRoleModal(false);
      // Actualizar lista de usuarios
      const res = await listUsers();
      const arr = res?.data || [];
      setUsers(Array.isArray(arr) ? arr.map(normalizeApiUser) : []);
      toast({
        title: "Rol asignado",
        description: `El rol ${roleSlugOrId} ha sido asignado a ${
          selectedUser.nombres || selectedUser.name || "el usuario"
        }.`,
        duration: 3500,
      });
    } catch {
      setError("No se pudo asignar el rol");
      toast({
        title: "❌ Error al asignar rol",
        description:
          "Ocurrió un problema al asignar el rol. Intenta nuevamente.",
        variant: "destructive",
        duration: 3500,
      });
    }
  };

  // Abrir modal de asignación de rol
  const handleOpenRoleModal = (user: User) => {
    setSelectedUser(user);
    setShowRoleModal(true);
  };

  // Cerrar modal de asignación de rol
  const handleCloseRoleModal = () => {
    setSelectedUser(null);
    setShowRoleModal(false);
  };

  // Abrir modal de edición y setear datos (fetch detail to ensure full profile fields are available)
  const handleOpenEditModal = async (user: User) => {
    try {
      // attempt to fetch detailed user from server to populate all fields reliably
      const res = await getUserById(String(user.id));
      const data = res?.data || res;
      // normalise shape using existing helper; if server returns nested object, normalizeApiUser handles it
      const detailed = normalizeApiUser(data);
      setEditUser(detailed);
      setEditForm({
        nombres: detailed.nombres || detailed.name || "",
        apellidos: detailed.apellidos || "",
        telefono: detailed.telefono || "",
        fecha_nacimiento: detailed.fecha_nacimiento
          ? String(detailed.fecha_nacimiento).substring(0, 10)
          : "",
        genero: detailed.genero || "",
        documento_identidad: detailed.documento_identidad || "",
        pais: detailed.pais || "",
        email: detailed.email || "",
      });
      setShowEditModal(true);
    } catch (err) {
      // fallback to using the passed user if detail fetch fails
      setEditUser(user);
      setEditForm({
        nombres: user.nombres || user.name || "",
        apellidos: user.apellidos || "",
        telefono: user.telefono || "",
        fecha_nacimiento: user.fecha_nacimiento
          ? user.fecha_nacimiento.substring(0, 10)
          : "",
        genero: user.genero || "",
        documento_identidad: user.documento_identidad || "",
        pais: user.pais || "",
        email: user.email || "",
      });
      setShowEditModal(true);
    }
  };
  // Cerrar modal de edición
  const handleCloseEditModal = () => {
    setShowEditModal(false);
    setEditUser(null);
    setEditForm({
      nombres: "",
      apellidos: "",
      telefono: "",
      fecha_nacimiento: "",
      genero: "",
      documento_identidad: "",
      pais: "",
      email: "",
    });
  };
  // Manejar cambios en el formulario de edición
  const handleEditFormChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    if (e.target.name === "email") return; // No permitir editar email
    setEditForm({ ...editForm, [e.target.name]: e.target.value });
  };
  // Guardar cambios de edición
  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editUser) return;
    try {
      // Build payload: nested `user` object for auth fields and top-level profile fields
      const payload: any = {
        user: {
          first_name: editForm.nombres || undefined,
          last_name: editForm.apellidos || undefined,
        },
        telefono: editForm.telefono || undefined,
        fecha_nacimiento: editForm.fecha_nacimiento || null,
        genero: editForm.genero || undefined,
        documento_identidad: editForm.documento_identidad || null,
        pais: editForm.pais || undefined,
      };

      const response = await editUserApi(editUser.id, payload);
      // axios response expected; use response.data when available
      const updatedRaw = response?.data || response;
      const updated = normalizeApiUser(updatedRaw);

      // Update single user row in state for a snappy UX
      setUsers((prev) => prev.map((u) => (u.id === updated.id ? updated : u)));

      setShowEditModal(false);
      setEditUser(null);
      setEditForm({
        nombres: "",
        apellidos: "",
        telefono: "",
        fecha_nacimiento: "",
        genero: "",
        documento_identidad: "",
        pais: "",
        email: "",
      });

      setError(null);
      toast({
        title: "✅ ¡Usuario modificado con éxito!",
        description:
          "Los datos del usuario han sido actualizados correctamente.",
        duration: 3500,
      });
    } catch (err: any) {
      // If server returned validation errors in err.response.data, show a toast and keep modal open for correction
      const serverData = err?.response?.data;
      if (serverData && typeof serverData === "object") {
        // show first validation message if available
        const firstKey = Object.keys(serverData)[0];
        const firstMsg = Array.isArray(serverData[firstKey])
          ? serverData[firstKey][0]
          : String(serverData[firstKey]);
        toast({
          title: "Error de validación",
          description: firstMsg || "Datos inválidos",
          variant: "destructive",
        });
      } else {
        toast({
          title: "❌ Error al modificar usuario",
          description:
            "Ocurrió un problema al guardar los cambios. Intenta nuevamente.",
          variant: "destructive",
          duration: 3500,
        });
      }
      setError("Error al editar usuario");
    }
  };

  // Backups state
  const [backups, setBackups] = useState<any[]>([]);
  const [backupsLoading, setBackupsLoading] = useState(false);
  const [creatingBackup, setCreatingBackup] = useState(false);
  // Restore modal state
  const [showRestoreModal, setShowRestoreModal] = useState(false);
  const [restoreTarget, setRestoreTarget] = useState<string | null>(null);
  const [restoreOption, setRestoreOption] = useState<
    "total" | "backend" | "db"
  >("total");

  const fetchBackups = async () => {
    try {
      setBackupsLoading(true);
      const res = await listarBackups();
      const list = Array.isArray(res.data) ? res.data : res.data?.backups || [];
      setBackups(list);
      toast({
        title: "Backups listados",
        description: `Encontrados ${list.length} backups.`,
      });
    } catch (err: any) {
      console.error(err);
      toast({
        title: "Error",
        description: "No se pudo listar backups",
        variant: "destructive",
      });
    } finally {
      setBackupsLoading(false);
    }
  };

  const handleCreateBackup = async () => {
    try {
      setCreatingBackup(true);
      await crearBackup();
      toast({
        title: "Backup creado",
        description: "Backup creado correctamente.",
      });
      await fetchBackups();
    } catch (err: any) {
      console.error(err);
      toast({
        title: "Error",
        description: "No se pudo crear backup",
        variant: "destructive",
      });
    } finally {
      setCreatingBackup(false);
    }
  };

    const handleDownload = async (filename: string) => {
    try {
      const res = await descargarBackup(filename);
      if (res?.download_url) {
        const a = document.createElement('a');
        a.href = res.download_url;
        // El nombre de archivo de la respuesta no está disponible, usamos el que ya tenemos
        const filenameToUse = filename;
        a.download = filenameToUse;
        document.body.appendChild(a);
        a.click();
        a.remove();
        // revoke after a while
        setTimeout(() => URL.revokeObjectURL(res.download_url), 10000);
        toast({ title: 'Descarga iniciada', description: `Descargando ${filenameToUse}` });
      } else {
        toast({ title: 'Error', description: 'No se pudo obtener archivo', variant: 'destructive' });
      }
    } catch (err: any) {
      console.error(err);
      toast({ title: 'Error', description: 'Error al descargar backup', variant: 'destructive' });
    }
  };

  // Abrir modal de restauración con opciones
  const handleRestore = (filename: string) => {
    setRestoreTarget(filename);
    setRestoreOption("total");
    setShowRestoreModal(true);
  };

  const confirmRestore = async () => {
    if (!restoreTarget) return;
    // Mapear opción a flags esperados por la API
    const options = {
      restore_code: restoreOption !== "db", // backend/code restored for 'total' and 'backend'
      restore_db: restoreOption !== "backend", // db restored for 'total' and 'db'
    } as { restore_code?: boolean; restore_db?: boolean };

    try {
      setShowRestoreModal(false);
      toast({
        title: "Iniciando restauración",
        description: `Restaurando ${restoreTarget} (${restoreOption})`,
      });
      await restaurarBackup(restoreTarget, options);
      toast({
        title: "Restauración solicitada",
        description: "La restauración fue enviada al servidor.",
      });
    } catch (err: any) {
      console.error(err);
      toast({
        title: "Error",
        description: "No se pudo restaurar backup",
        variant: "destructive",
      });
    } finally {
      setRestoreTarget(null);
      setRestoreOption("total");
    }
  };

  const cancelRestore = () => {
    setShowRestoreModal(false);
    setRestoreTarget(null);
    setRestoreOption("total");
  };

  const handleDelete = async (filename: string) => {
    const ok = confirm(
      `¿Eliminar backup ${filename}? Esta acción es irreversible.`
    );
    if (!ok) return;
    try {
      await eliminarBackup(filename);
      toast({
        title: "Backup eliminado",
        description: `${filename} eliminado correctamente.`,
      });
      await fetchBackups();
    } catch (err: any) {
      console.error(err);
      toast({
        title: "Error",
        description: "No se pudo eliminar backup",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <MapPin className="w-8 h-8 text-blue-600" />
          <h1 className="text-3xl font-bold text-gray-900">
            {getPanelTitle()}
          </h1>
        </div>
        <p className="text-gray-600">{getPanelDescription()}</p>
      </div>

      {/* Tabs para alternar vistas */}
      <div className="mb-6 flex gap-4">
        <button
          className={`px-4 py-2 rounded-lg font-semibold ${
            activeTab === "panel"
              ? "bg-blue-600 text-white"
              : "bg-white text-blue-600 border border-blue-600"
          }`}
          onClick={() => setActiveTab("panel")}
        >
          Panel General
        </button>
        <button
          className={`px-4 py-2 rounded-lg font-semibold ${
            activeTab === "usuarios"
              ? "bg-blue-600 text-white"
              : "bg-white text-blue-600 border border-blue-600"
          }`}
          onClick={() => setActiveTab("usuarios")}
        >
          Gestión de usuario
        </button>
        <button
          className={`px-4 py-2 rounded-lg font-semibold ${
            activeTab === "bitacora"
              ? "bg-blue-600 text-white"
              : "bg-white text-blue-600 border border-blue-600"
          }`}
          onClick={() => setActiveTab("bitacora")}
        >
          Bitácora
        </button>
        <button
          className={`px-4 py-2 rounded-lg font-semibold ${
            activeTab === "backups"
              ? "bg-blue-600 text-white"
              : "bg-white text-blue-600 border border-blue-600"
          }`}
          onClick={() => setActiveTab("backups")}
        >
          Backups
        </button>
      </div>

      {/* Vista Panel General */}
      {activeTab === "panel" && (
        <>
          {/* ...stats cards y gráfico... */}
          {/* Estadísticas principales */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl shadow-lg p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm font-medium">
                    Total Usuarios
                  </p>
                  <p className="text-3xl font-bold">{users.length}</p>
                </div>
                <Users className="w-10 h-10 text-blue-200" />
              </div>
            </div>

            <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-xl shadow-lg p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100 text-sm font-medium">
                    Usuarios Activos
                  </p>
                  <p className="text-3xl font-bold">
                    {
                      users.filter(
                        (u) => (u.estado || "").toLowerCase() === "activo"
                      ).length
                    }
                  </p>
                </div>
                <Shield className="w-10 h-10 text-green-200" />
              </div>
            </div>

            <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl shadow-lg p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100 text-sm font-medium">
                    Operadores
                  </p>
                  <p className="text-3xl font-bold">
                    {
                      users.filter(
                        (u) =>
                          (u.roles || []).includes(3) ||
                          (u.rolesSlugs || []).includes("proveedor")
                      ).length
                    }
                  </p>
                </div>
                <UserPlus className="w-10 h-10 text-purple-200" />
              </div>
            </div>

            <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-xl shadow-lg p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-yellow-100 text-sm font-medium">
                    Clientes
                  </p>
                  <p className="text-3xl font-bold">
                    {
                      users.filter(
                        (u) =>
                          (u.roles || []).includes(2) ||
                          (u.rolesSlugs || []).includes("cliente")
                      ).length
                    }
                  </p>
                </div>
                <Star className="w-10 h-10 text-yellow-200" />
              </div>
            </div>
          </div>

          {/* Estadísticas adicionales */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-red-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">
                    Administradores
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {users.filter((u) => u.roles?.includes(1)).length}
                  </p>
                </div>
                <div className="bg-red-100 p-3 rounded-full">
                  <Shield className="w-6 h-6 text-red-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-indigo-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">Soporte</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {users.filter((u) => u.roles?.includes(4)).length}
                  </p>
                </div>
                <div className="bg-indigo-100 p-3 rounded-full">
                  <Users className="w-6 h-6 text-indigo-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-gray-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">
                    Usuarios Inactivos
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {
                      users.filter(
                        (u) => (u.estado || "").toLowerCase() !== "activo"
                      ).length
                    }
                  </p>
                </div>
                <div className="bg-gray-100 p-3 rounded-full">
                  <EyeOff className="w-6 h-6 text-gray-600" />
                </div>
              </div>
            </div>
          </div>

          {/* Backups - (moved to its own tab) */}

          {/* Gráfico de actividad */}
          <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">
                Actividad de Usuarios
              </h3>
              <div className="text-sm text-gray-500">Últimos 3 meses</div>
            </div>
            <ChartAreaInteractive />
          </div>

          {/* Actividad reciente */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Resumen del Sistema
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium text-gray-700 mb-3">
                  Distribución de Roles
                </h4>
                <div className="space-y-3">
                  {Object.entries(ROLE_MAP).map(([id, name]) => {
                    // Count users that either have the role id or the role slug
                    const count = users.filter(
                      (u) =>
                        (u.roles || []).includes(Number(id)) ||
                        (u.rolesSlugs || []).includes(String(name))
                    ).length;
                    const percentage =
                      users.length > 0
                        ? ((count / users.length) * 100).toFixed(1)
                        : 0;
                    return (
                      <div
                        key={id}
                        className="flex items-center justify-between"
                      >
                        <div className="flex items-center">
                          <div
                            className={`w-3 h-3 rounded-full mr-3 ${
                              name === "administrador"
                                ? "bg-red-500"
                                : name === "proveedor"
                                ? "bg-purple-500"
                                : name === "cliente"
                                ? "bg-yellow-500"
                                : name === "soporte"
                                ? "bg-indigo-500"
                                : "bg-gray-500"
                            }`}
                          ></div>
                          <span className="text-sm text-gray-700">
                            {String(name).charAt(0).toUpperCase() +
                              String(name).slice(1)}
                          </span>
                        </div>
                        <div className="text-right">
                          <span className="text-sm font-medium text-gray-900">
                            {count}
                          </span>
                          <span className="text-xs text-gray-500 ml-1">
                            ({percentage}%)
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div>
                <h4 className="font-medium text-gray-700 mb-3">
                  Estado del Sistema
                </h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                    <div className="flex items-center">
                      <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
                      <span className="text-sm text-gray-700">
                        Sistema Operativo
                      </span>
                    </div>
                    <span className="text-sm font-medium text-green-700">
                      En línea
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                    <div className="flex items-center">
                      <div className="w-3 h-3 bg-blue-500 rounded-full mr-3"></div>
                      <span className="text-sm text-gray-700">
                        Base de Datos
                      </span>
                    </div>
                    <span className="text-sm font-medium text-blue-700">
                      Conectada
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                    <div className="flex items-center">
                      <div className="w-3 h-3 bg-yellow-500 rounded-full mr-3"></div>
                      <span className="text-sm text-gray-700">
                        Última actualización
                      </span>
                    </div>
                    <span className="text-sm font-medium text-yellow-700">
                      Hace 2 min
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Vista Gestión de usuario */}
      {activeTab === "usuarios" && (
        <>
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
              <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto">
                <input
                  type="text"
                  placeholder="Buscar por nombre o email..."
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <select
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  value={filterRole}
                  onChange={(e) => setFilterRole(e.target.value)}
                >
                  <option value="todos">Todos los roles</option>
                  {availableRoles && availableRoles.length > 0
                    ? availableRoles.map((r) => (
                        <option key={r.slug} value={r.slug}>
                          {r.name || r.slug}
                        </option>
                      ))
                    : FALLBACK_ROLES.map((role) => (
                        <option key={role} value={role}>
                          {role}
                        </option>
                      ))}
                </select>
                <select
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                >
                  <option value="todos">Todos los estados</option>
                  <option value="activo">Activos</option>
                  <option value="inactivo">Inactivos</option>
                </select>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow overflow-x-auto max-h-[60vh] md:max-h-[70vh]">
            <div className="overflow-x-auto overflow-y-auto max-h-[60vh] md:max-h-[70vh] scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
              <table className="min-w-[600px] md:min-w-full divide-y divide-gray-200 text-xs md:text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-2 md:px-4 py-2 text-left font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap min-w-[120px]">
                      Usuario
                    </th>
                    <th className="px-2 md:px-4 py-2 text-left font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap min-w-[90px]">
                      Nombre
                    </th>
                    <th className="px-2 md:px-4 py-2 text-left font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap min-w-[70px]">
                      Rol
                    </th>
                    <th className="px-2 md:px-4 py-2 text-left font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap min-w-[70px]">
                      Estado
                    </th>
                    <th className="px-2 md:px-4 py-2 text-left font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap min-w-[90px]">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50">
                      <td className="px-1 md:px-4 py-1 md:py-2 whitespace-normal break-all text-[11px] md:text-sm">
                        <div className="text-gray-500 break-all whitespace-normal leading-tight">
                          {user.email}
                        </div>
                      </td>
                      <td className="px-1 md:px-4 py-1 md:py-2 whitespace-normal break-words text-[11px] md:text-sm">
                        <div className="font-medium text-gray-900 break-words whitespace-normal leading-tight">
                          {`${user.nombres || ""} ${
                            user.apellidos || ""
                          }`.trim()}
                        </div>
                      </td>
                      <td className="px-1 md:px-4 py-1 md:py-2 whitespace-normal text-[11px] md:text-sm">
                        <div className="flex flex-wrap gap-1">
                          {/* Render role badges from ids or slugs */}
                          {(() => {
                            // Build a unique set of role label strings from ids and slugs
                            const labels = new Set<string>();
                            // From numeric ids
                            for (const rid of user.roles || []) {
                              const label = ROLE_MAP[rid] ?? String(rid);
                              if (label) labels.add(String(label));
                            }
                            // From slugs
                            for (const s of user.rolesSlugs || []) {
                              if (s) labels.add(String(s));
                            }
                            // Render each unique label once, capitalized and colored by role
                            return Array.from(labels).map((lbl) => {
                              const s = String(lbl || "").toLowerCase();
                              const label =
                                s.charAt(0).toUpperCase() + s.slice(1);
                              // color by slug
                              const colorClass =
                                s === "administrador"
                                  ? "bg-red-100 text-red-800"
                                  : s === "proveedor"
                                  ? "bg-purple-100 text-purple-800"
                                  : s === "cliente"
                                  ? "bg-yellow-100 text-yellow-800"
                                  : s === "soporte"
                                  ? "bg-indigo-100 text-indigo-800"
                                  : "bg-gray-200 text-gray-800";
                              return (
                                <span
                                  key={lbl}
                                  className={`px-2 py-0.5 ${colorClass} rounded text-[10px] md:text-xs font-semibold break-words whitespace-normal cursor-help leading-tight`}
                                  title={lbl}
                                >
                                  {label}
                                </span>
                              );
                            });
                          })()}
                        </div>
                      </td>
                      <td className="px-2 md:px-4 py-2 whitespace-normal">
                        {(() => {
                          const estado = (user.estado || "").toLowerCase();
                          let color = "bg-gray-100 text-gray-800";
                          if (estado === "activo")
                            color = "bg-green-100 text-green-800";
                          else if (estado === "inactivo")
                            color = "bg-yellow-100 text-yellow-800";
                          else if (estado === "bloqueado")
                            color = "bg-red-100 text-red-800";
                          return (
                            <span
                              className={`inline-flex px-2 py-1 text-[10px] md:text-xs font-semibold rounded-full ${color}`}
                            >
                              {estado
                                ? estado.charAt(0).toUpperCase() +
                                  estado.slice(1)
                                : "—"}
                            </span>
                          );
                        })()}
                      </td>
                      <td className="px-2 md:px-4 py-2 whitespace-nowrap text-xs md:text-sm font-medium">
                        <div className="flex gap-2 items-center flex-wrap justify-start">
                          <button
                            title="Editar usuario"
                            className="text-blue-600 hover:text-blue-900"
                            onClick={() => handleOpenEditModal(user)}
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          {/* Modal para editar usuario */}
                          {showEditModal && editUser && (
                            <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-60 z-50">
                              <div className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-lg border border-blue-100">
                                <h2 className="text-2xl font-extrabold text-blue-700 mb-6 text-center tracking-tight">
                                  Editar usuario
                                </h2>
                                <form
                                  onSubmit={handleEditSubmit}
                                  className="space-y-5 flex flex-col"
                                >
                                  <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1">
                                      Nombres
                                    </label>
                                    <input
                                      type="text"
                                      name="nombres"
                                      value={editForm.nombres}
                                      onChange={handleEditFormChange}
                                      placeholder="Nombres"
                                      className="w-full border border-blue-200 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition"
                                      required
                                    />
                                  </div>
                                  <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1">
                                      Apellidos
                                    </label>
                                    <input
                                      type="text"
                                      name="apellidos"
                                      value={editForm.apellidos}
                                      onChange={handleEditFormChange}
                                      placeholder="Apellidos"
                                      className="w-full border border-blue-200 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition"
                                      required
                                    />
                                  </div>
                                  <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1">
                                      Teléfono
                                    </label>
                                    <input
                                      type="text"
                                      name="telefono"
                                      value={editForm.telefono}
                                      onChange={handleEditFormChange}
                                      placeholder="Teléfono"
                                      className="w-full border border-blue-200 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition"
                                    />
                                  </div>
                                  <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1">
                                      Fecha de nacimiento
                                    </label>
                                    <input
                                      type="date"
                                      name="fecha_nacimiento"
                                      value={editForm.fecha_nacimiento}
                                      onChange={handleEditFormChange}
                                      className="w-full border border-blue-200 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition"
                                    />
                                  </div>
                                  <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1">
                                      Género
                                    </label>
                                    <select
                                      name="genero"
                                      value={editForm.genero}
                                      onChange={handleEditFormChange}
                                      className="w-full border border-blue-200 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition"
                                    >
                                      <option value="">
                                        Selecciona género
                                      </option>
                                      <option value="M">Masculino</option>
                                      <option value="F">Femenino</option>
                                      <option value="O">Otro</option>
                                    </select>
                                  </div>
                                  <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1">
                                      Documento de identidad
                                    </label>
                                    <input
                                      type="text"
                                      name="documento_identidad"
                                      value={editForm.documento_identidad}
                                      onChange={handleEditFormChange}
                                      placeholder="Documento de identidad"
                                      className="w-full border border-blue-200 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition"
                                    />
                                  </div>
                                  <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1">
                                      País
                                    </label>
                                    <input
                                      type="text"
                                      name="pais"
                                      value={editForm.pais}
                                      onChange={handleEditFormChange}
                                      placeholder="País"
                                      className="w-full border border-blue-200 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition"
                                    />
                                  </div>
                                  <div className="flex justify-end space-x-3 pt-2">
                                    <button
                                      type="button"
                                      onClick={handleCloseEditModal}
                                      className="px-5 py-2 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition"
                                    >
                                      Cancelar
                                    </button>
                                    <button
                                      type="submit"
                                      className="px-5 py-2 bg-gradient-to-r from-blue-500 to-blue-700 text-white rounded-lg font-bold shadow hover:from-blue-600 hover:to-blue-800 transition"
                                    >
                                      Guardar
                                    </button>
                                  </div>
                                </form>
                              </div>
                            </div>
                          )}
                          {/* Show only the action relevant to the user's current state */}
                          {isUserActive(user) && (
                            <button
                              title="Deshabilitar usuario"
                              onClick={() => handleDisableUser(user.id)}
                              disabled={!!userActionLoading[user.id]}
                              aria-label="Deshabilitar usuario"
                              className={`mx-1 p-1 rounded ${
                                !userActionLoading[user.id]
                                  ? "text-red-600 hover:text-red-900"
                                  : "text-gray-400 opacity-60 cursor-not-allowed"
                              }`}
                            >
                              {userActionLoading[user.id] ? (
                                <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                              ) : (
                                <Trash2 className="w-4 h-4" />
                              )}
                            </button>
                          )}

                          {isUserInactive(user) && (
                            <button
                              title="Reactivar usuario"
                              onClick={() => handleReactivateUser(user.id)}
                              disabled={!!userActionLoading[user.id]}
                              aria-label="Reactivar usuario"
                              className={`mx-1 p-1 rounded ${
                                !userActionLoading[user.id]
                                  ? "text-green-600 hover:text-green-900"
                                  : "text-gray-400 opacity-60 cursor-not-allowed"
                              }`}
                            >
                              {userActionLoading[user.id] ? (
                                <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                              ) : (
                                <UserPlus className="w-4 h-4" />
                              )}
                            </button>
                          )}
                          <button
                            title="Asignar rol"
                            className="text-green-600 hover:text-green-900"
                            onClick={() => handleOpenRoleModal(user)}
                          >
                            <Shield className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filteredUsers.length === 0 && (
                <div className="text-center py-12">
                  <Users className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">
                    No se encontraron usuarios
                  </h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Intenta cambiar los filtros de búsqueda
                  </p>
                </div>
              )}
            </div>
          </div>
          {error && <div className="text-red-600 mt-4">{error}</div>}
          {loading && (
            <div className="text-gray-600 mt-4">Cargando usuarios...</div>
          )}

          {/* Modal para asignar rol */}
          {showRoleModal && selectedUser && (
            <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg p-6 w-full max-w-xs mx-4">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Asignar rol a {selectedUser.name}
                </h3>
                <div className="flex flex-col gap-2 mb-4">
                  {availableRoles && availableRoles.length > 0
                    ? availableRoles.map((r) => (
                        <button
                          key={r.slug}
                          className="px-3 py-2 rounded-lg border border-blue-300 bg-gradient-to-r from-blue-50 to-blue-100 hover:from-blue-100 hover:to-blue-200 text-blue-900 font-bold shadow-sm transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2"
                          onClick={() => handleAssignRole(r.slug)}
                        >
                          <span className="inline-block align-middle mr-2">
                            <Shield className="w-4 h-4 inline text-blue-500" />
                          </span>
                          {r.name || r.slug}
                        </button>
                      ))
                    : Object.entries(ROLE_MAP).map(([id, name]) => (
                        <button
                          key={id}
                          className="px-3 py-2 rounded-lg border border-blue-300 bg-gradient-to-r from-blue-50 to-blue-100 hover:from-blue-100 hover:to-blue-200 text-blue-900 font-bold shadow-sm transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2"
                          onClick={() => handleAssignRole(Number(id))}
                        >
                          <span className="inline-block align-middle mr-2">
                            <Shield className="w-4 h-4 inline text-blue-500" />
                          </span>
                          {name}
                        </button>
                      ))}
                </div>
                <button
                  className="w-full px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300"
                  onClick={handleCloseRoleModal}
                >
                  Cancelar
                </button>
              </div>
            </div>
          )}
        </>
      )}
      {/* Vista Bitácora */}
      {activeTab === "bitacora" && (
        <div className="mt-6">
          {/* Carga perezosa simple del componente de bitácora */}
          <React.Suspense fallback={<div>Cargando bitácora...</div>}>
            {/* eslint-disable-next-line @next/next/no-before-interactive */}
            <div className="w-full">
              <div className="max-w-full px-4">
                <div className="bg-transparent">
                  <AdminBitacora />
                </div>
              </div>
            </div>
          </React.Suspense>
        </div>
      )}
      {/* Vista Backups */}
      {/* Vista Backups */}
      {activeTab === "backups" && (
        <div className="mt-6">
          <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Backups del sistema
              </h3>
              <div className="flex items-center gap-2">
                <button
                  className="px-3 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-md font-semibold hover:from-green-600"
                  onClick={handleCreateBackup}
                  disabled={creatingBackup}
                >
                  {creatingBackup ? "Creando..." : "Crear Backup"}
                </button>
                <button
                  className="px-3 py-2 bg-white border border-gray-200 rounded-md text-gray-700 font-medium"
                  onClick={fetchBackups}
                  disabled={backupsLoading}
                >
                  {backupsLoading ? "Listando..." : "Listar Backups"}
                </button>
              </div>
            </div>

            <div>
              {backupsLoading && (
                <div className="text-sm text-gray-500">Cargando backups...</div>
              )}
              {!backupsLoading && backups.length === 0 && (
                <div className="text-sm text-gray-500">
                  No se encontraron backups. Pulsa "Listar Backups".
                </div>
              )}
              {!backupsLoading && backups.length > 0 && (
                <div className="space-y-3">
                  {backups.map((b: any) => {
                    // ✅ CORREGIDO: Usar la estructura EXACTA del backend
                    const filename = b.name; // ← "name" del backend
                    const date = b.modified; // ← "modified" del backend
                    const size = b.size_kb; // ← "size_kb" del backend

                    return (
                      <div
                        key={filename}
                        className="flex items-center justify-between p-4 border border-gray-200 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
                      >
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-gray-900 truncate">
                            {filename}
                          </div>
                          <div className="text-xs text-gray-600 mt-1">
                            {date} • {size} KB
                          </div>
                        </div>
                        <div className="flex items-center gap-2 ml-4 flex-shrink-0">
                          <button
                            className="px-3 py-1.5 bg-blue-50 text-blue-700 rounded-md text-sm font-medium hover:bg-blue-100 transition-colors"
                            onClick={() => handleDownload(filename)}
                          >
                            Descargar
                          </button>
                          <button
                            className="px-3 py-1.5 bg-yellow-50 text-yellow-700 rounded-md text-sm font-medium hover:bg-yellow-100 transition-colors"
                            onClick={() => handleRestore(filename)}
                          >
                            Restaurar
                          </button>
                          <button
                            className="px-3 py-1.5 bg-red-50 text-red-700 rounded-md text-sm font-medium hover:bg-red-100 transition-colors"
                            onClick={() => handleDelete(filename)}
                          >
                            Eliminar
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal de restauración (renderizado globalmente para que funcione desde la pestaña Backups) */}
      {showRestoreModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-60 z-50">
          <div className="bg-white p-6 rounded-2xl shadow-2xl w-full max-w-md border border-blue-100">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              Restaurar backup
            </h2>
            <p className="text-sm text-gray-600 mb-4">
              Seleccione qué tipo de restauración desea ejecutar para{" "}
              <strong>{restoreTarget}</strong>:
            </p>
            <div className="space-y-3 mb-6">
              <label className="flex items-center gap-3">
                <input
                  type="radio"
                  name="restoreOption"
                  value="total"
                  checked={restoreOption === "total"}
                  onChange={() => setRestoreOption("total")}
                />
                <div>
                  <div className="font-medium">
                    Restauración completa (total)
                  </div>
                  <div className="text-xs text-gray-500">
                    Restaurará código/backend y base de datos.
                  </div>
                </div>
              </label>
              <label className="flex items-center gap-3">
                <input
                  type="radio"
                  name="restoreOption"
                  value="backend"
                  checked={restoreOption === "backend"}
                  onChange={() => setRestoreOption("backend")}
                />
                <div>
                  <div className="font-medium">
                    Restaurar solo backend/código
                  </div>
                  <div className="text-xs text-gray-500">
                    Solo restaurará los archivos/código del backend, sin tocar
                    la base de datos.
                  </div>
                </div>
              </label>
              <label className="flex items-center gap-3">
                <input
                  type="radio"
                  name="restoreOption"
                  value="db"
                  checked={restoreOption === "db"}
                  onChange={() => setRestoreOption("db")}
                />
                <div>
                  <div className="font-medium">
                    Restaurar solo base de datos
                  </div>
                  <div className="text-xs text-gray-500">
                    Solo restaurará la base de datos desde el backup.
                  </div>
                </div>
              </label>
            </div>
            <div className="flex justify-end gap-3">
              <button
                onClick={cancelRestore}
                className="px-4 py-2 bg-gray-200 rounded-lg"
              >
                Cancelar
              </button>
              <button
                onClick={confirmRestore}
                className="px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg"
              >
                Confirmar restauración
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
