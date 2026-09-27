/* ============================================================
   ARRANQUE DE CADA PÁGINA
   ------------------------------------------------------------
   Antes los datos venían en archivos .js que se cargaban con el HTML.
   Ahora vienen de la API, pero el resto del sitio no cambió: acá se
   piden una vez al abrir la página, se dejan en EU.datos (el mismo
   lugar de antes) y desde ahí todo funciona igual que siempre.

   Se hace así, y no consulta por consulta, porque el volumen es de
   decenas de registros. Si algún día son miles, se pagina acá dentro
   sin tocar ninguna pantalla.

   Cada página declara qué necesita:
     EU.arranque.publico(fn)   el tablero y el detalle, sin cuenta
     EU.arranque.cuenta(fn)    área privada, exige sesión
     EU.arranque.admin(fn)     panel, exige sesión de administrador
   ============================================================ */

window.EU = window.EU || {};
EU.datos = EU.datos || {};

/* Las pantallas no corren apenas carga el archivo: esperan a que los
   datos estén. Cada módulo se anota con EU.alEstarListo() y el arranque
   los ejecuta en orden cuando termina de traer todo. */
EU._pendientes = [];
EU._listo = false;

EU.alEstarListo = function (fn) {
  if (EU._listo) { fn(); return; }
  EU._pendientes.push(fn);
};

EU._marcarListo = function () {
  EU._listo = true;
  var cola = EU._pendientes.slice();
  EU._pendientes = [];
  cola.forEach(function (fn) {
    try { fn(); } catch (e) { console.error('Error al armar la pantalla:', e); }
  });
};

EU.arranque = (function () {
  'use strict';

  function aviso(texto, detalle) {
    var main = document.getElementById('contenido') || document.body;
    main.innerHTML =
      '<div class="envoltura bloque"><div class="sin-resultados" style="border:0">' +
      '<h2>' + EU.util.esc(texto) + '</h2>' +
      (detalle ? '<p>' + EU.util.esc(detalle) + '</p>' : '') +
      '<p class="acciones"><a class="boton" href="index.html">Volver al inicio</a>' +
      '<button type="button" class="boton boton--linea" onclick="location.reload()">Reintentar</button></p>' +
      '</div></div>';
  }

  function cargando(si) {
    document.documentElement.classList.toggle('cargando', !!si);
  }

  /* Trae las oportunidades que el visitante puede ver. Quien no tiene
     sesión recibe solo las publicadas: lo impone el backend, no esto. */
  function traerOportunidades() {
    return EU.api.listar('oportunidades', { orden: 'cierre_postulacion' })
      .then(function (items) {
        EU.datos.oportunidades = items.map(EU.modelo.oportunidadDesdeBase);
        return EU.datos.oportunidades;
      });
  }

  function traerMiFicha() {
    var u = EU.api.usuario();
    if (!u) return Promise.resolve(null);
    return EU.api.listar('fichas', {
      filtro: 'usuario = "' + u.id + '"', expandir: 'usuario'
    }).then(function (items) {
      var ficha = items.length ? EU.modelo.fichaDesdeBase(items[0]) : null;
      EU.datos.emprendedores = ficha ? [ficha] : [];
      EU.sesion.ficha_ = ficha;
      return ficha;
    });
  }

  function traerMisPostulaciones() {
    return EU.api.listar('postulaciones', { orden: '-created' })
      .then(function (items) {
        EU.datos.postulaciones = items.map(EU.modelo.postulacionDesdeBase);
        return EU.datos.postulaciones;
      });
  }

  function traerTodoAdmin() {
    return Promise.all([
      EU.api.listar('fichas', { expandir: 'usuario', orden: 'emp_nombre' }),
      EU.api.listar('postulaciones', { orden: '-created' })
    ]).then(function (r) {
      EU.datos.emprendedores = r[0].map(EU.modelo.fichaDesdeBase);
      EU.datos.postulaciones = r[1].map(EU.modelo.postulacionDesdeBase);
    });
  }

  function fallo(e) {
    cargando(false);
    if (e && (e.estado === 401 || e.estado === 403)) {
      location.href = 'entrar.html?volver=' + encodeURIComponent(location.pathname.split('/').pop() + location.search);
      return;
    }
    aviso('No pudimos cargar la información',
      (e && e.message) || 'Revisa tu conexión e inténtalo otra vez.');
  }

  return {
    /* Páginas que no consultan datos (institucionales, entrar, registro).
       Solo revalida la sesión para que la cabecera muestre lo correcto. */
    simple: function (alTerminar) {
      var previo = EU.api.haySesion() ? EU.api.revalidar() : Promise.resolve(null);
      previo.catch(function () { return null; }).then(function () {
        if (alTerminar) alTerminar();
        EU._marcarListo();
      });
    },

    publico: function (alTerminar) {
      cargando(true);
      /* Si hay sesión guardada se revalida en silencio, para que la
         cabecera muestre el nombre y el botón correcto. */
      var previo = EU.api.haySesion() ? EU.api.revalidar() : Promise.resolve(null);
      previo
        .then(traerOportunidades)
        .then(function () { cargando(false); if (alTerminar) alTerminar(); EU._marcarListo(); })
        .catch(fallo);
    },

    cuenta: function (alTerminar) {
      cargando(true);
      if (!EU.api.haySesion()) {
        location.href = 'entrar.html?volver=' + encodeURIComponent(location.pathname.split('/').pop() + location.search);
        return;
      }
      EU.api.revalidar().then(function (u) {
        if (!u) throw { estado: 401 };
        return Promise.all([traerOportunidades(), traerMiFicha(), traerMisPostulaciones()]);
      }).then(function () { cargando(false); if (alTerminar) alTerminar(); EU._marcarListo(); })
        .catch(fallo);
    },

    admin: function (alTerminar) {
      cargando(true);
      if (!EU.api.haySesion()) {
        location.href = 'entrar.html?volver=' + encodeURIComponent(location.pathname.split('/').pop() + location.search);
        return;
      }
      EU.api.revalidar().then(function (u) {
        if (!u) throw { estado: 401 };
        if (u.rol !== 'admin') {
          cargando(false);
          aviso('Esta sección es solo para el equipo de ' + EU.marca.nombre,
                'Tu cuenta no tiene permisos de administración.');
          throw { manejado: true };
        }
        return Promise.all([traerOportunidades(), traerTodoAdmin()]);
      }).then(function () { cargando(false); if (alTerminar) alTerminar(); EU._marcarListo(); })
        .catch(function (e) { if (!e || !e.manejado) fallo(e); });
    },

    /* Para recargar datos después de guardar algo, sin recargar la página. */
    recargarOportunidades: traerOportunidades,
    recargarMiFicha: traerMiFicha,
    recargarAdmin: traerTodoAdmin
  };
})();
