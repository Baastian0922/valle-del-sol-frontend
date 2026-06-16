// ══════════════════════════════════════════════════════════════════════════════
// firebase-admin-service.js
// Servicio de Administración de Usuarios con Firebase
// ──────────────────────────────────────────────────────────────────────────────
// Este servicio utiliza una SEGUNDA instancia de Firebase App para que el
// administrador pueda crear cuentas de usuario sin cerrar su propia sesión.
// Todas las operaciones de lectura/escritura se hacen contra Firestore.
// ══════════════════════════════════════════════════════════════════════════════

import { initializeApp, getApps } from "firebase/app";
import { getAuth, createUserWithEmailAndPassword, signOut as secondarySignOut } from "firebase/auth";
import {
  doc, setDoc, getDocs, updateDoc, deleteDoc,
  collection, onSnapshot, query
} from "firebase/firestore";
import { db } from "./firebase-config";

// ── Configuración (misma del proyecto, reutilizada) ──────────────────────────
const firebaseConfig = {
  apiKey: "AIzaSyAzsETw8IjVNjgXiSp3oFIETi6goTANctI",
  authDomain: "valledelsol.firebaseapp.com",
  projectId: "valledelsol",
  storageBucket: "valledelsol.firebasestorage.app",
  messagingSenderId: "304787708950",
  appId: "1:304787708950:web:9850321e66453134b86937",
};

// ── Instancia Secundaria (no afecta la sesión del admin logueado) ────────────
let secondaryApp;
const existingApps = getApps();
const found = existingApps.find(app => app.name === "AdminUserCreator");
if (found) {
  secondaryApp = found;
} else {
  secondaryApp = initializeApp(firebaseConfig, "AdminUserCreator");
}
const secondaryAuth = getAuth(secondaryApp);

// ── Diccionarios de Mapeo de Roles ───────────────────────────────────────────
// Convierte el rol del sistema (usado en el frontend) al rol almacenado en Firestore
const ROLE_TO_FIRESTORE = {
  'ADMIN': 'admin',
  'USER': 'vecino',
  'EMERGENCY_ENTITY': 'bombero',
  'STAFF': 'staff'
};

// Convierte el rol de Firestore al rol del sistema (usado en el frontend)
const FIRESTORE_TO_ROLE = {
  'admin': 'ADMIN',
  'vecino': 'USER',
  'comunidad': 'USER',
  'bombero': 'EMERGENCY_ENTITY',
  'carabinero': 'EMERGENCY_ENTITY',
  'ambulancia': 'EMERGENCY_ENTITY',
  'municipalidad': 'EMERGENCY_ENTITY',
  'entidad': 'EMERGENCY_ENTITY',
  'emergencia': 'EMERGENCY_ENTITY',
  'staff': 'STAFF'
};

// ── Función auxiliar: Normalizar documento de Firestore ──────────────────────
function normalizarUsuario(docSnap) {
  const data = docSnap.data();
  const rawRole = data.rol || data.role || 'vecino';
  return {
    id: docSnap.id,  // uid de Firebase Auth
    username: data.username || data.email?.split('@')[0] || 'usuario',
    fullName: data.nombre || 'Sin Nombre',
    email: data.email || '',
    role: FIRESTORE_TO_ROLE[rawRole.toLowerCase()] || rawRole.toUpperCase(),
    active: data.activo !== false, // por defecto es true
    institucion: data.institucion || 'general',
    rutCodigo: data.rutCodigo || '',
    sectorComuna: data.sectorComuna || '',
    fechaCreacion: data.fechaCreacion || ''
  };
}

// ══════════════════════════════════════════════════════════════════════════════
// OPERACIONES CRUD
// ══════════════════════════════════════════════════════════════════════════════

/**
 * Crea un usuario nuevo en Firebase Auth Y en Firestore.
 * Usa la instancia secundaria para no desloguear al admin.
 */
export async function crearUsuarioFirebase(email, password, datosUsuario) {
  try {
    // 1. Crear la cuenta en Firebase Auth (instancia secundaria)
    const credencial = await createUserWithEmailAndPassword(secondaryAuth, email, password);
    const uid = credencial.user.uid;

    // 2. Cerrar sesión en la instancia secundaria (no afecta al admin)
    await secondarySignOut(secondaryAuth);

    // 3. Crear el documento del perfil en Firestore
    await setDoc(doc(db, 'usuarios', uid), {
      nombre: datosUsuario.fullName,
      username: datosUsuario.username,
      email: email.toLowerCase(),
      rol: ROLE_TO_FIRESTORE[datosUsuario.role] || 'vecino',
      institucion: datosUsuario.institucion || 'general',
      activo: true,
      fechaCreacion: new Date().toISOString()
    });

    return { uid, ...datosUsuario };
  } catch (error) {
    // Limpiar la sesión secundaria en caso de error parcial
    try { await secondarySignOut(secondaryAuth); } catch (_) { /* ignorar */ }
    throw error;
  }
}

/**
 * Obtiene la lista completa de usuarios desde Firestore (lectura única).
 */
export async function obtenerUsuariosFirebase() {
  const q = query(collection(db, 'usuarios'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(normalizarUsuario);
}

/**
 * Suscribe un listener en tiempo real a la colección 'usuarios'.
 * Cada vez que un usuario se crea, edita o elimina, el callback se ejecuta.
 * Retorna la función unsubscribe para limpiar el listener.
 */
export function escucharUsuariosFirebase(callback) {
  const q = query(collection(db, 'usuarios'));
  return onSnapshot(q, (snapshot) => {
    const usuarios = snapshot.docs.map(normalizarUsuario);
    callback(usuarios);
  }, (error) => {
    console.error("Error en listener de usuarios Firestore:", error);
  });
}

/**
 * Actualiza los datos de un usuario en Firestore.
 * No puede cambiar la contraseña de Firebase Auth desde el cliente
 * (eso requiere Firebase Admin SDK en el servidor).
 */
export async function editarUsuarioFirebase(uid, datosActualizados) {
  const updateData = {};

  if (datosActualizados.fullName !== undefined) updateData.nombre = datosActualizados.fullName;
  if (datosActualizados.username !== undefined) updateData.username = datosActualizados.username;
  if (datosActualizados.email !== undefined) updateData.email = datosActualizados.email.toLowerCase();
  if (datosActualizados.role !== undefined) updateData.rol = ROLE_TO_FIRESTORE[datosActualizados.role] || 'vecino';
  if (datosActualizados.institucion !== undefined) updateData.institucion = datosActualizados.institucion;

  await updateDoc(doc(db, 'usuarios', uid), updateData);
}

/**
 * Elimina el documento del usuario de Firestore.
 * La cuenta de Auth sigue existiendo, pero sin perfil no puede acceder al sistema.
 */
export async function eliminarUsuarioFirebase(uid) {
  await deleteDoc(doc(db, 'usuarios', uid));
}

/**
 * Alterna el estado activo/inactivo de un usuario en Firestore.
 */
export async function alternarEstadoUsuarioFirebase(uid, estadoActual) {
  await updateDoc(doc(db, 'usuarios', uid), { activo: !estadoActual });
}

// ── Utilidad: Traducir errores de Firebase al español ────────────────────────
export function traducirErrorFirebase(error) {
  const codigo = error?.code || '';
  const mapa = {
    'auth/email-already-in-use': 'Este correo electrónico ya está registrado en Firebase.',
    'auth/invalid-email': 'El formato del correo electrónico no es válido.',
    'auth/weak-password': 'La contraseña es demasiado débil (mínimo 6 caracteres para Firebase).',
    'auth/operation-not-allowed': 'La creación de cuentas está deshabilitada en Firebase.',
    'auth/too-many-requests': 'Demasiados intentos. Espera un momento antes de intentar de nuevo.',
    'permission-denied': 'No tienes permisos para realizar esta operación en Firestore.',
    'not-found': 'El usuario no fue encontrado en la base de datos.'
  };
  return mapa[codigo] || `Error inesperado: ${error.message || codigo}`;
}
