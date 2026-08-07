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

  // Operador de báscula: solo puede acceder a bascula.html
  if (usuario.rol === 'operador_bascula') {
    const paginaActual = window.location.pathname.split('/').pop()
    if (paginaActual !== 'bascula.html') {
      window.location.href = 'bascula.html'
      return null
    }
  }

  // Jefe de obra: solo puede acceder a dashboard y parte diario
  if (usuario.rol === 'jefe_obra') {
    const paginaActual = window.location.pathname.split('/').pop()
    const permitidas = ['dashboard.html', 'parte.html', '']
    if (!permitidas.includes(paginaActual)) {
      window.location.href = 'parte.html'
      return null
    }
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

  const esCoord   = usuario.rol === 'coordinador'
  const esDir     = usuario.rol === 'directivo'
  const esJefe    = usuario.rol === 'jefe_obra'
  const esBascula = usuario.rol === 'operador_bascula'

  const navContent = esBascula ? `
      <div class="nav-sec">B&aacute;scula</div>
      <a class="nav-item active" href="bascula.html">⚖️&nbsp; B&aacute;scula Pescadores</a>
  ` : esJefe ? `
      <div class="nav-sec">Principal</div>
      <a class="nav-item ${paginaActiva==='obras'?'active':''}" href="dashboard.html">🏗️&nbsp; Mis Obras / Contrataciones</a>
      <div class="nav-sec">Gesti&oacute;n Diaria</div>
      <a class="nav-item ${paginaActiva==='parte'?'active':''}" href="parte.html">📋&nbsp; Parte Diario</a>
  ` : `
      <div class="nav-sec">Principal</div>
      <a class="nav-item ${paginaActiva==='obras'?'active':''}" href="dashboard.html">🏗️&nbsp; Mis Obras / Contrataciones</a>
      ${esCoord ? `<a class="nav-item ${paginaActiva==='nueva-obra'?'active':''}" href="nueva-obra.html">➕&nbsp; Nueva Obra / Contratación</a>` : ''}
      ${(esCoord||esDir) ? `<a class="nav-item ${paginaActiva==='presupuesto'?'active':''}" href="presupuesto.html">💰&nbsp; Presupuesto Base</a>` : ''}
      <div class="nav-sec">Gestión Diaria</div>
      ${!esDir ? `<a class="nav-item ${paginaActiva==='parte'?'active':''}" href="parte.html">📋&nbsp; Parte Diario</a>` : ''}
      <div class="nav-sec">Reportes</div>
      <a class="nav-item ${paginaActiva==='avance'?'active':''}" href="avance.html">📈&nbsp; Avance Físico</a>
      ${(esCoord||esDir) ? `<a class="nav-item ${paginaActiva==='financiero'?'active':''}" href="financiero.html">📊&nbsp; Control Financiero</a>` : ''}
      ${(esCoord||esDir) ? `<a class="nav-item ${paginaActiva==='resumen-semanal'?'active':''}" href="resumen-semanal.html">🗞️&nbsp; Estado Actual de Obra</a>` : ''}
      <div class="nav-sec">Informes Mensuales</div>
      <a class="nav-item ${paginaActiva==='informes'?'active':''}" href="informes.html">📄&nbsp; Informes Mensuales</a>
      ${(esCoord||esDir) ? `<a class="nav-item ${paginaActiva==='asfalto'?'active':''}" href="asfalto.html">🛣️&nbsp; Producción Mezcla Asfáltica</a>
      <a class="nav-item ${paginaActiva==='planta'?'active':''}" href="planta.html">🏭&nbsp; Planta Asfáltica</a>
      <a class="nav-item ${paginaActiva==='bascula'?'active':''}" href="bascula.html">⚖️&nbsp; B&aacute;scula Pescadores</a>
      <a class="nav-item ${paginaActiva==='combustible'?'active':''}" href="combustible.html">⛽&nbsp; Control de Combustible</a>` : ''}
      <div class="nav-sec">Certificación</div>
      <a class="nav-item ${paginaActiva==='certificacion'?'active':''}" href="certificacion.html">📋&nbsp; Certificación</a>
      <a class="nav-item ${paginaActiva==='informes-mo'?'active':''}" href="informes.html?tab=mo">👷&nbsp; Inf. Mano de Obra</a>
      ${(esCoord||esDir) ? `<div class="nav-sec">Recursos</div>
      <a class="nav-item ${paginaActiva==='flota'?'active':''}" href="flota.html">🚜&nbsp; Flota de Equipos</a>
      <a class="nav-item ${paginaActiva==='rrhh'?'active':''}" href="rrhh.html">👷&nbsp; Recursos Humanos</a>
` : ''}
      ${esCoord ? `<div class="nav-sec">Administración</div>
      <a class="nav-item ${paginaActiva==='usuarios'?'active':''}" href="usuarios.html">👥&nbsp; Usuarios</a>` : ''}
  `

  document.getElementById('sidebar').innerHTML = `
    <div class="sb-logo">
      <img src="logo.png" alt="Serving">
      <p>Suite Control</p>
    </div>
    <nav class="sb-nav">${navContent}</nav>
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
    directivo: 'Directivo',
    operador_bascula: 'Operador Báscula'
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

// Calcular costo real de MO con horas básicas y extras
// Básicas (hasta 8 hs): precio_hora × 1
// Extras — gp=false (blanco): precio_hora × 0.75
// Extras — gp=true  (negro):  precio_hora × 1.50
function calcCostoMO(p) {
  const basicas = parseFloat(p.horas_trabajadas) || 0
  const extras  = parseFloat(p.horas_extras)     || 0
  const precio  = parseFloat(p.precio_hora)       || 0
  const factor  = p.gp ? 1.5 : 0.75
  return (basicas * precio) + (extras * precio * factor)
}
