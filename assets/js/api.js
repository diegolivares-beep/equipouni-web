/* ============================================================
   CLIENTE DE LA API
   ------------------------------------------------------------
   Habla con el backend (PocketBase) en api.equipouni.cl. Es la única
   pieza que sabe de HTTP: el resto del sitio le pide datos a EU.repo
   y no se entera de dónde salen.

   La sesión se guarda en el navegador para no pedir la contraseña en
   cada página. El token dura y lo renueva el propio backend.
   ============================================================ */

window.EU = window.EU || {};

EU.api = (function () {
  'use strict';

  var BASE = 'https://api.equipouni.cl';
  var LLAVE_SESION = 'equipouni.sesion';

  function sesionGuardada() {
    try {
      var s = localStorage.getItem(LLAVE_SESION);
      return s ? JSON.parse(s) : null;
    } catch (e) { return null; }
  }

  function guardarSesion(datos) {
    try {
      if (datos) localStorage.setItem(LLAVE_SESION, JSON.stringify(datos));
      else localStorage.removeItem(LLAVE_SESION);
    } catch (e) { /* navegación privada: la sesión dura lo que la pestaña */ }
    sesion = datos;
  }

  var sesion = sesionGuardada();

  /* Petición a la API. Devuelve una promesa con el cuerpo ya interpretado
     y, si algo falla, un error con el mensaje en español cuando se puede. */
  function pedir(ruta, opciones) {
    opciones = opciones || {};
    var cabeceras = opciones.headers || {};
    if (sesion && sesion.token) cabeceras.Authorization = sesion.token;
    if (opciones.body && !(opciones.body instanceof FormData)) {
      cabeceras['Content-Type'] = 'application/json';
      opciones.body = JSON.stringify(opciones.body);
    }
    return fetch(BASE + ruta, {
      method: opciones.method || 'GET',
      headers: cabeceras,
      body: opciones.body
    }).then(function (r) {
      return r.text().then(function (texto) {
        var cuerpo = null;
        try { cuerpo = texto ? JSON.parse(texto) : null; } catch (e) { cuerpo = texto; }
        if (r.ok) return cuerpo;

        if (r.status === 401 || r.status === 403) {
          /* El token venció o ya no sirve: se cierra la sesión para que
             la persona vuelva a entrar en vez de ver errores raros. */
          if (sesion) guardarSesion(null);
        }
        var e = new Error(mensajeDeError(cuerpo, r.status));
        e.estado = r.status;
        e.datos = cuerpo;
        throw e;
      });
    });
  }

  /* Traduce los errores del backend a algo que se pueda leer en pantalla. */
  function mensajeDeError(cuerpo, estado) {
    if (cuerpo && cuerpo.message) {
      var detalle = cuerpo.data && Object.keys(cuerpo.data).length
        ? Object.keys(cuerpo.data).map(function (k) {
            return cuerpo.data[k].message || k;
          }).join(' ')
        : '';
      if (/failed to authenticate/i.test(cuerpo.message)) {
        return 'El correo o la contraseña no coinciden.';
      }
      if (/already exists|unique/i.test(detalle)) {
        return 'Ese correo ya tiene una cuenta.';
      }
      return detalle || cuerpo.message;
    }
    if (estado === 0) return 'No se pudo conectar. Revisa tu conexión.';
    return 'Ocurrió un problema (código ' + estado + ').';
  }

  function guardarDeAuth(r) {
    guardarSesion({ token: r.token, usuario: r.record });
    return r.record;
  }

  return {
    BASE: BASE,

    /* ---------- Sesión ---------- */

    usuario: function () { return sesion ? sesion.usuario : null; },
    haySesion: function () { return !!(sesion && sesion.token); },
    /* Para las subidas de archivos, que van con FormData y no pueden
       pasar por pedir(). Nadie más debería leer el almacenamiento del
       navegador por su cuenta: la llave de sesión vive solo acá. */
    token: function () { return sesion ? sesion.token : ''; },
    esAdmin: function () { return !!(sesion && sesion.usuario && sesion.usuario.rol === 'admin'); },

    entrar: function (correo, clave) {
      return pedir('/api/collections/users/auth-with-password', {
        method: 'POST', body: { identity: correo, password: clave }
      }).then(guardarDeAuth);
    },

    registrar: function (datos) {
      return pedir('/api/collections/users/records', {
        method: 'POST',
        body: {
          email: datos.correo,
          password: datos.clave,
          passwordConfirm: datos.clave,
          nombre: datos.nombre || '',
          telefono: datos.telefono || ''
          /* El rol no se manda: el backend lo fija en "emprendedor". */
        }
      }).then(function () {
        return EU.api.entrar(datos.correo, datos.clave);
      });
    },

    salir: function () { guardarSesion(null); },

    /* Refresca los datos del usuario y comprueba que el token siga vivo. */
    revalidar: function () {
      if (!EU.api.haySesion()) return Promise.resolve(null);
      return pedir('/api/collections/users/auth-refresh', { method: 'POST' })
        .then(guardarDeAuth)
        .catch(function () { return null; });
    },

    pedirRecuperacion: function (correo) {
      return pedir('/api/collections/users/request-password-reset', {
        method: 'POST', body: { email: correo }
      });
    },

    /* ---------- Registros ---------- */

    listar: function (coleccion, opciones) {
      var q = [];
      opciones = opciones || {};
      if (opciones.filtro) q.push('filter=' + encodeURIComponent(opciones.filtro));
      if (opciones.orden) q.push('sort=' + encodeURIComponent(opciones.orden));
      if (opciones.expandir) q.push('expand=' + encodeURIComponent(opciones.expandir));
      q.push('perPage=' + (opciones.porPagina || 200));
      return pedir('/api/collections/' + coleccion + '/records?' + q.join('&'))
        .then(function (r) { return r.items || []; });
    },

    obtener: function (coleccion, id, expandir) {
      var q = expandir ? '?expand=' + encodeURIComponent(expandir) : '';
      return pedir('/api/collections/' + coleccion + '/records/' + id + q);
    },

    crear: function (coleccion, datos) {
      return pedir('/api/collections/' + coleccion + '/records', { method: 'POST', body: datos });
    },

    actualizar: function (coleccion, id, datos) {
      return pedir('/api/collections/' + coleccion + '/records/' + id, { method: 'PATCH', body: datos });
    },

    borrar: function (coleccion, id) {
      return pedir('/api/collections/' + coleccion + '/records/' + id, { method: 'DELETE' });
    },

    /* Dirección de un archivo subido. Sirve para las fotos de producto,
       que son públicas a propósito. Los documentos de formalización
       están protegidos y necesitan permisoArchivo(). */
    archivo: function (registro, nombreArchivo, miniatura) {
      if (!registro || !nombreArchivo) return '';
      var u = BASE + '/api/files/' + registro.collectionId + '/' + registro.id + '/' + nombreArchivo;
      return miniatura ? u + '?thumb=' + miniatura : u;
    },

    /* Permiso de un solo uso para abrir un archivo protegido. Dura
       pocos minutos, así que se pide al momento de abrirlo y se guarda
       un rato para no pedir uno por cada documento de la misma ficha. */
    permisoArchivo: (function () {
      var guardado = null, vence = 0;
      return function () {
        if (guardado && Date.now() < vence) return Promise.resolve(guardado);
        return pedir('/api/files/token', { method: 'POST' }).then(function (r) {
          guardado = r.token;
          vence = Date.now() + 100 * 1000;
          return guardado;
        });
      };
    })(),

    /* Dirección de un documento protegido, ya con su permiso. */
    archivoProtegido: function (registro, nombreArchivo) {
      if (!registro || !nombreArchivo) return Promise.resolve('');
      return EU.api.permisoArchivo().then(function (t) {
        return EU.api.archivo(registro, nombreArchivo) + '?token=' + encodeURIComponent(t);
      });
    },

    /* Cerrar la cuenta. El backend revisa antes que no queden
       compromisos abiertos, y al borrar el usuario se van con él su
       ficha, sus archivos y sus postulaciones. */
    borrarMiCuenta: function () {
      var u = EU.api.usuario();
      if (!u) return Promise.reject(new Error('No hay sesión abierta.'));
      return pedir('/api/collections/users/records/' + u.id, { method: 'DELETE' })
        .then(function () { guardarSesion(null); });
    }
  };
})();
