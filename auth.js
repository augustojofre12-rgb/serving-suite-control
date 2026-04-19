// =============================================
//  SERVING SUITE CONTROL — Auth & Navegación
// =============================================

// Verificar sesión activa, redirige a login si no hay
async function requireAuth() {
  const { data: { session } } = await db.auth.getSession()
  if (!session) {
    window.location.href = 'index.html'
    return null
  }
  const { data: usuario } = await db
    .from('usuarios')
    .select('*')
    .eq('id', session.user.id)
    .single()

  if (!usuario) {
    window.location.href = 'index.html'
    return null
  }
  return usuario
}

// Obtener usuario actual sin redirigir
async function getUsuario() {
  const { data: { session } } = await db.auth.getSession()
  if (!session) return null
  const { data: usuario } = await db
    .from('usuarios')
    .select('*')
    .eq('id', session.user.id)
    .single()
  return usuario
}

// Cerrar sesión
async function logout() {
  await db.auth.signOut()
  window.location.href = 'index.html'
}

// Renderizar sidebar según rol
function renderSidebar(usuario, paginaActiva) {
  const iniciales = usuario.nombre
    ? usuario.nombre.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()
    : usuario.email.substring(0, 2).toUpperCase()

  const esCoord = usuario.rol === 'coordinador'
  const esDir   = usuario.rol === 'directivo'
  const esJefe  = usuario.rol === 'jefe_obra'

  document.getElementById('sidebar').innerHTML = `
    <div class="sb-logo">
      <img src="logo.png" alt="Serving">
      <p>Suite Control</p>
    </div>
    <nav class="sb-nav">
      <div class="nav-sec">Principal</div>
      <a class="nav-item ${paginaActiva==='obras'?'active':''}" href="dashboard.html">🏗️&nbsp; Mis Obras / Contrataciones</a>
      ${esCoord ? `<a class="nav-item ${paginaActiva==='nueva-obra'?'active':''}" href="nueva-obra.html">➕&nbsp; Nueva Obra / Contratación</a>` : ''}
      <div class="nav-sec">Gestión Diaria</div>
      ${!esDir ? `<a class="nav-item ${paginaActiva==='parte'?'active':''}" href="parte.html">📋&nbsp; Parte Diario</a>` : ''}
      ${(esCoord||esDir) ? `<a class="nav-item ${paginaActiva==='presupuesto'?'active':''}" href="presupuesto.html">💰&nbsp; Presupuesto Base</a>` : ''}
      <div class="nav-sec">Reportes</div>
      <a class="nav-item ${paginaActiva==='avance'?'active':''}" href="avance.html">📈&nbsp; Avance Físico</a>
      ${(esCoord||esDir) ? `<a class="nav-item ${paginaActiva==='financiero'?'active':''}" href="financiero.html">📊&nbsp; Control Financiero</a>` : ''}
      ${(esCoord||esDir) ? `<div class="nav-sec">Recursos</div>
      <a class="nav-item ${paginaActiva==='flota'?'active':''}" href="flota.html">🚜&nbsp; Flota de Equipos</a>
      <a class="nav-item ${paginaActiva==='rrhh'?'active':''}" href="rrhh.html">👷&nbsp; Recursos Humanos</a>` : ''}
      ${esCoord ? `<div class="nav-sec">Administración</div>
      <a class="nav-item ${paginaActiva==='usuarios'?'active':''}" href="usuarios.html">👥&nbsp; Usuarios</a>` : ''}
    </nav>
    <div class="sb-user">
      <div class="avatar">${iniciales}</div>
      <div>
        <div class="uname">${usuario.nombre || usuario.email}</div>
        <div class="urole">${labelRol(usuario.rol)}</div>
        <span class="sb-logout" onclick="logout()">Cerrar sesión</span>
      </div>
    </div>
  `
}

function labelRol(rol) {
  const labels = {
    coordinador: 'Coordinador',
    jefe_obra: 'Jefe de Obra',
    directivo: 'Directivo'
  }
  return labels[rol] || rol
}

// Toast de notificaciones
function toast(msg, tipo = 'ok') {
  const el = document.getElementById('toast')
  el.textContent = (tipo === 'ok' ? '✓ ' : '✗ ') + msg
  el.className = `toast toast-${tipo}`
  el.style.display = 'block'
  setTimeout(() => el.style.display = 'none', 3500)
}

// Formatear moneda
function formatPeso(n) {
  if (!n && n !== 0) return '$0'
  const num = Number(n)
  const tieneCentavos = num % 1 !== 0
  return '$' + num.toLocaleString('es-AR', {
    minimumFractionDigits: tieneCentavos ? 2 : 0,
    maximumFractionDigits: 2
  })
}

// Formatear número
function formatNum(n) {
  if (!n && n !== 0) return '0'
  return Number(n).toLocaleString('es-AR')
}

// Calcular horas entre dos tiempos
function calcHoras(inicio, fin) {
  if (!inicio || !fin) return 0
  const [h1, m1] = inicio.split(':').map(Number)
  const [h2, m2] = fin.split(':').map(Number)
  return Math.max(0, (h2 * 60 + m2 - h1 * 60 - m1) / 60)
}
