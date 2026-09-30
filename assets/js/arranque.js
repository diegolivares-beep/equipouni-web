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

/* ---------- Búsquedas sobre lo que ya está cargado ----------
   Las pantallas no recorren los arreglos a mano: preguntan acá. Estas cinco
   funciones vivían en los archivos data/*.js de la maqueta y se fueron con
   ellos al conectar el backend, pero catorce pantallas seguían llamándolas: el
   área privada y casi todo el panel quedaron en blanco por un TypeError. Van
   junto a EU.datos porque son derivaciones de los mismos arreglos que llena
   este archivo, y así no pueden volver a separarse de ellos.

   Se leen los arreglos en cada llamada, no al definirse, porque EU.datos se
   rellena después y se puede recargar sin recargar la página. */

EU.datos.postulacionesDe = function (idFicha) {
  return (EU.datos.postulaciones || []).filter(function (p) {
    return p.emprendedor === idFicha;
  });
};

EU.datos.postulacionesA = function (idOportunidad) {
  return (EU.datos.postulaciones || []).filter(function (p) {
    return p.oportunidad === idOportunidad;
  });
};

EU.datos.postulacion = function (id) {
  var r = null;
  (EU.datos.postulaciones || []).forEach(function (p) { if (p.id === id) r = p; });
  return r;
};

/* "emprendedor" es la ficha: una postulación guarda el id de la ficha, y la
   ficha es la que representa al emprendimiento. */
EU.datos.emprendedor = function (idFicha) {
  var r = null;
  (EU.datos.emprendedores || []).forEach(function (f) { if (f.id === idFicha) r = f; });
  return r;
};

/* Cuenta también las renunciadas, a propósito: la base tiene un índice único
   por (oportunidad, ficha) sin mirar el estado, así que quien renunció tampoco
   puede volver a postular. Si esto ignorara "renuncio", el sitio ofrecería un
   botón que el backend va a rechazar. */
EU.datos.yaPostulo = function (idFicha, idOportunidad) {
  return (EU.datos.postulaciones || []).some(function (p) {
    return p.emprendedor === idFicha && p.oportunidad === idOportunidad;
  });
};

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
    /* Si los datos fallaron, la pantalla nunca llegó a montar su cabecera,
       porque eso pasa en el callback. Quedaba una página sin menú y sin pie:
       la persona veía el error y no tenía a dónde ir salvo los dos botones.
       Se monta la cabecera pública, que sirve en cualquier modo. */
    var arriba = document.getElementById('cabecera');
    if (arriba && !arriba.innerHTML.trim()) arriba.innerHTML = EU.ui.cabecera();
    var abajo = document.getElementById('pie');
    if (abajo && !abajo.innerHTML.trim()) abajo.innerHTML = EU.ui.pie();
    EU.ui.conectarSalir();

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

  /* El catálogo de rubros y subrubros, que el cliente administra desde el
     panel. Va con su propio catch a propósito y NO dentro del Promise.all
     de más abajo: si esta consulta falla, el sitio sigue con el catálogo
     de respaldo que viene en config/catalogo.js. Meterla en el Promise.all
     haría que un catálogo caído tumbe la pantalla completa, que es el
     error que dejó el área privada en blanco el 29-sep. */
  function traerCatalogo() {
    return EU.api.listar('catalogo', { orden: 'orden' })
      .then(function (items) { EU.catalogo.cargarDesde(items); })
      .catch(function () {
        if (console && console.warn) {
          console.warn('No se pudo traer el catálogo: se usa el de respaldo.');
        }
      });
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
        .then(traerCatalogo)
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
        return traerCatalogo().then(function () {
          return Promise.all([traerOportunidades(), traerMiFicha(), traerMisPostulaciones()]);
        });
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
        return traerCatalogo().then(function () {
          return Promise.all([traerOportunidades(), traerTodoAdmin()]);
        });
      }).then(function () { cargando(false); if (alTerminar) alTerminar(); EU._marcarListo(); })
        .catch(function (e) { if (!e || !e.manejado) fallo(e); });
    },

    /* Para recargar datos después de guardar algo, sin recargar la página. */
    recargarCatalogo: traerCatalogo,
    recargarOportunidades: traerOportunidades,
    recargarMiFicha: traerMiFicha,
    recargarAdmin: traerTodoAdmin
  };
})();
