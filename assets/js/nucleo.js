/* ============================================================
   NÚCLEO: utilidades, repositorio de datos y piezas de interfaz
   ------------------------------------------------------------
   Tres capas, en este orden:

   EU.util   Formato de fechas, dinero y texto. No sabe nada del negocio.
   EU.repo   ÚNICO punto donde se piden datos. Hoy lee de data/*.js.
             El día que exista API, se cambian estas funciones para que
             hagan fetch y ninguna página se entera. Es la razón de que
             exista esta capa.
   EU.ui     Piezas de interfaz que se repiten: cabecera, pie, tarjeta
             de oportunidad. Evita mantener ocho copias del mismo menú.
   ============================================================ */

window.EU = window.EU || {};

/* ============================================================
   EU.util
   ============================================================ */

EU.util = {

  esc: function (s) {
    return String(s === undefined || s === null ? '' : s)
      .replace(/[&<>"]/g, function (c) {
        return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c];
      });
  },

  MESES: ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
    'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'],

  /* Convierte 'AAAA-MM-DD' en Date local. No usar new Date(iso) a secas:
     esa forma interpreta la fecha en UTC y en Chile devuelve el día anterior. */
  aFecha: function (iso) {
    var p = String(iso).split('-');
    return new Date(+p[0], +p[1] - 1, +p[2]);
  },

  hoy: function () {
    var d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  },

  dia: function (iso) {
    var f = EU.util.aFecha(iso);
    return f.getDate() + ' de ' + EU.util.MESES[f.getMonth()];
  },

  diaConAno: function (iso) {
    var f = EU.util.aFecha(iso);
    return f.getDate() + ' de ' + EU.util.MESES[f.getMonth()] + ' de ' + f.getFullYear();
  },

  rangoFechas: function (desde, hasta) {
    if (!hasta || desde === hasta) return EU.util.dia(desde);
    var a = EU.util.aFecha(desde), b = EU.util.aFecha(hasta);
    if (a.getMonth() === b.getMonth()) return a.getDate() + ' al ' + EU.util.dia(hasta);
    return EU.util.dia(desde) + ' al ' + EU.util.dia(hasta);
  },

  diasHasta: function (iso) {
    return Math.round((EU.util.aFecha(iso) - EU.util.hoy()) / 86400000);
  },

  /* Dinero chileno: punto de miles y sin decimales. */
  pesos: function (n) {
    if (n === 0) return 'Gratuita';
    return '$' + Number(n).toLocaleString('es-CL');
  },

  parametro: function (nombre) {
    var m = location.search.match(new RegExp('[?&]' + nombre + '=([^&]*)'));
    return m ? decodeURIComponent(m[1].replace(/\+/g, ' ')) : '';
  },

  /* Texto del plazo, siempre desde el punto de vista de quien postula. */
  textoPlazo: function (cierre) {
    var d = EU.util.diasHasta(cierre);
    if (d < 0) return 'Cerrada el ' + EU.util.dia(cierre);
    if (d === 0) return 'Cierra hoy';
    if (d === 1) return 'Queda 1 día para postular';
    return 'Quedan ' + d + ' días para postular';
  }
};

/* ============================================================
   EU.repo
   ------------------------------------------------------------
   Hoy: lee de los arreglos cargados por data/*.js.
   Mañana: las mismas funciones devuelven una promesa con el resultado
   de la API. Para que ese cambio no rompa nada, las páginas ya tratan
   el resultado como si pudiera tardar, usando EU.repo.entonces().
   ============================================================ */

EU.repo = {

  /* Envoltura mínima para que las páginas no asuman que el dato es
     inmediato. Cuando esto pase a fetch, solo cambia el interior. */
  entonces: function (valor, hacer) { hacer(valor); },

  oportunidades: {

    /* Todas las que el público puede ver, en el orden en que deben
       mostrarse: primero las que reciben postulaciones, y dentro de
       esas, la que cierra antes va primero. */
    listar: function (criterios) {
      var c = criterios || {};
      var lista = (EU.datos.oportunidades || []).filter(function (o) {
        var info = EU.estados.oportunidadInfo[o.estado];
        return info && info.publica;
      });

      if (c.tipo)   lista = lista.filter(function (o) { return o.tipo === c.tipo; });
      if (c.comuna) lista = lista.filter(function (o) { return o.comuna === c.comuna; });
      if (c.region) lista = lista.filter(function (o) { return o.region === c.region; });
      if (c.rubro) {
        lista = lista.filter(function (o) {
          return (o.rubrosBuscados || []).indexOf(c.rubro) !== -1;
        });
      }
      if (c.gratuitas) lista = lista.filter(function (o) { return o.valor === 0; });
      if (c.mes) {
        lista = lista.filter(function (o) {
          return String(o.fechaInicio).slice(0, 7) === c.mes;
        });
      }
      if (!c.incluirCerradas) {
        lista = lista.filter(function (o) { return EU.estados.recibePostulaciones(o); });
      }

      return lista.sort(function (a, b) {
        var aa = EU.estados.recibePostulaciones(a) ? 0 : 1;
        var bb = EU.estados.recibePostulaciones(b) ? 0 : 1;
        if (aa !== bb) return aa - bb;
        return EU.util.aFecha(a.cierrePostulacion) - EU.util.aFecha(b.cierrePostulacion);
      });
    },

    obtener: function (id) {
      var r = null;
      (EU.datos.oportunidades || []).forEach(function (o) { if (o.id === id) r = o; });
      return r;
    },

    /* Meses con al menos una oportunidad abierta, para el filtro. */
    mesesConActividad: function () {
      var vistos = {}, salida = [];
      EU.repo.oportunidades.listar({}).forEach(function (o) {
        var m = String(o.fechaInicio).slice(0, 7);
        if (!vistos[m]) {
          vistos[m] = true;
          var f = EU.util.aFecha(o.fechaInicio);
          salida.push({ valor: m, texto: EU.util.MESES[f.getMonth()] + ' de ' + f.getFullYear() });
        }
      });
      return salida.sort(function (a, b) { return a.valor.localeCompare(b.valor); });
    },

    /* Comunas que hoy tienen alguna oportunidad visible. Evita ofrecer
       filtros que no devuelven nada. */
    comunasConActividad: function () {
      var vistos = {};
      EU.repo.oportunidades.listar({ incluirCerradas: true }).forEach(function (o) {
        vistos[o.comuna] = true;
      });
      return EU.territorio.comunasActivas().filter(function (c) { return vistos[c.codigo]; });
    }
  }
};

/* ============================================================
   EU.ui
   ============================================================ */

EU.ui = {

  /* Enlaces del menú público. Un solo lugar: agregar una página al sitio
     es agregar una línea acá.
     El texto del menú es más corto que el título de la página. "Para
     emprendedores" encabeza esa página, pero en la barra dice
     "Emprendedores": si no, el menú no cabe en una línea. */
  MENU: [
    { archivo: 'index.html',          texto: 'Inicio' },
    { archivo: 'oportunidades.html',  texto: 'Oportunidades' },
    { archivo: 'emprendedores.html',  texto: 'Emprendedores' },
    { archivo: 'productoras.html',    texto: 'Productoras' },
    { archivo: 'nosotros.html',       texto: 'Nosotros' }
  ],

  /* Nombre del archivo actual, para marcar el enlace activo. */
  paginaActual: function () {
    var p = location.pathname.split('/').pop();
    return p || 'index.html';
  },

  /* El logotipo es el SVG de marca, no texto. Se usa <img> y no SVG en
     linea para que el navegador lo cachee una vez y lo reutilice en las
     21 paginas. La variante invertida es para fondos oscuros. */
  logotipo: function (invertido) {
    var archivo = invertido ? 'cliente-logo-invertido.png' : 'cliente-logo.png';
    return '<a class="marca" href="index.html" aria-label="' +
           EU.util.esc(EU.marca.nombre) + ', ir al inicio">' +
           '<img src="assets/marca/' + archivo + '" alt="' +
           EU.util.esc(EU.marca.nombre) + '" width="729" height="281">' +
           '</a>';
  },

  cabecera: function () {
    var actual = EU.ui.paginaActual();
    var enlaces = EU.ui.MENU.map(function (m) {
      var activo = m.archivo === actual ? ' aria-current="page"' : '';
      return '<li><a href="' + m.archivo + '"' + activo + '>' + EU.util.esc(m.texto) + '</a></li>';
    }).join('');

    var aviso = '';
    if (EU.marca.esMaqueta) {
      aviso = '<div class="demo"><div class="envoltura"><p>Maqueta de revisión. ' +
        'Las oportunidades, las organizaciones y los datos de contacto son de ejemplo.' +
        '</p></div></div>';
    }

    return aviso +
      '<header class="cabecera"><div class="envoltura">' +
        EU.ui.logotipo() +
        '<nav aria-label="Principal"><ul class="menu">' + enlaces + '</ul></nav>' +
        '<div class="cabecera__acciones">' +
          '<a class="enlace-sesion" href="entrar.html">Iniciar sesión</a>' +
          '<a class="boton" href="registro.html">Crear mi ficha</a>' +
        '</div>' +
      '</div></header>';
  },

  pie: function () {
    var c = EU.marca.contacto;
    var contacto = '<li><a href="mailto:' + EU.util.esc(c.correo) + '">' + EU.util.esc(c.correo) + '</a></li>';
    if (c.whatsapp) contacto += '<li><a href="https://wa.me/' + EU.util.esc(c.whatsapp) + '">WhatsApp</a></li>';
    if (c.instagram) contacto += '<li><a href="https://instagram.com/' + EU.util.esc(c.instagram) + '">Instagram</a></li>';

    var legal = EU.marca.esMaqueta
      ? 'Maqueta de revisión con datos de ejemplo. Fotografías de referencia vía Unsplash, ' +
        'a reemplazar por imágenes reales de cada oportunidad.'
      : '';

    /* Accesos de revisión: existen solo mientras el sitio sea maqueta,
       para poder recorrer las tres áreas sin sistema de cuentas. */
    var revision = EU.marca.esMaqueta
      ? '<div><strong>Revisión de la maqueta</strong><ul>' +
        '<li><a href="cuenta.html">Área privada (demostración)</a></li>' +
        '<li><a href="admin.html">Panel administrativo</a></li>' +
        '<li><a href="control.html">Control de fundación</a></li>' +
        '</ul></div>'
      : '';

    return '<footer class="pie"><div class="envoltura">' +
      '<div class="pie__grilla">' +
        '<div>' + EU.ui.logotipo(true) + '</div>' +
        '<div><strong>Emprendedores</strong><ul>' +
          '<li><a href="oportunidades.html">Ver oportunidades</a></li>' +
          '<li><a href="registro.html">Crear mi ficha</a></li>' +
          '<li><a href="emprendedores.html">Cómo funciona</a></li>' +
        '</ul></div>' +
        '<div><strong>Organizaciones</strong><ul>' +
          '<li><a href="productoras.html">Publicar una oportunidad</a></li>' +
          '<li><a href="nosotros.html">Sobre ' + EU.util.esc(EU.marca.nombre) + '</a></li>' +
        '</ul></div>' +
        '<div><strong>Contacto</strong><ul>' + contacto + '</ul></div>' +
        revision +
      '</div>' +
      (legal ? '<p class="pie__legal">' + legal + '</p>' : '') +
    '</div></footer>';
  },

  /* Etiqueta de estado de una oportunidad, desde el punto de vista de
     quien postula: lo que importa es si puede postular o no. */
  etiquetaEstado: function (o) {
    if (!EU.estados.recibePostulaciones(o)) {
      return { clase: 'cerrada', texto: 'Postulaciones cerradas' };
    }
    var d = EU.util.diasHasta(o.cierrePostulacion);
    if (d <= 10) return { clase: 'pronto', texto: 'Cierra pronto' };
    return { clase: 'abierta', texto: 'Postulaciones abiertas' };
  },

  /* Tarjeta del tablero. Los campos son los que pide la especificación:
     nombre y tipo, fecha y comuna, valor o gratuita, plazo, rubros. */
  tarjetaOportunidad: function (o) {
    var e = EU.ui.etiquetaEstado(o);
    var rubros = (o.rubrosBuscados || []).map(function (r) {
      return EU.catalogo.nombre(r);
    });
    var rubrosTexto = rubros.length ? rubros.slice(0, 3).join(', ') +
      (rubros.length > 3 ? ' y ' + (rubros.length - 3) + ' más' : '') : 'Todos los rubros';

    return '' +
      '<li class="oportunidad">' +
        '<a class="oportunidad__foto" href="oportunidad.html?id=' + encodeURIComponent(o.id) + '" tabindex="-1" aria-hidden="true">' +
          '<img src="assets/img/' + EU.util.esc(o.imagen) + '" alt="" width="180" height="135" loading="lazy" decoding="async">' +
        '</a>' +
        '<div class="oportunidad__cuerpo">' +
          '<p class="fila-etiquetas">' +
            '<span class="estado estado--' + e.clase + '">' + e.texto + '</span>' +
            '<span class="tipo">' + EU.util.esc(EU.catalogo.nombreTipo(o.tipo)) + '</span>' +
          '</p>' +
          '<h3><a href="oportunidad.html?id=' + encodeURIComponent(o.id) + '">' +
            EU.util.esc(o.nombre) + '</a></h3>' +
          '<p class="oportunidad__organiza">Organiza ' + EU.util.esc(o.organizacion) + '</p>' +
          '<dl class="datos">' +
            '<div><dt>Cuándo</dt><dd>' + EU.util.rangoFechas(o.fechaInicio, o.fechaTermino) + '</dd></div>' +
            '<div><dt>Dónde</dt><dd>' + EU.util.esc(EU.territorio.nombreComuna(o.comuna)) + '</dd></div>' +
            '<div><dt>Participación</dt><dd>' + EU.util.pesos(o.valor) + '</dd></div>' +
            '<div><dt>Rubros</dt><dd>' + EU.util.esc(rubrosTexto) + '</dd></div>' +
          '</dl>' +
        '</div>' +
        '<div class="oportunidad__accion">' +
          '<p class="plazo' + (e.clase === 'pronto' ? ' plazo--urgente' : '') + '">' +
            EU.util.esc(EU.util.textoPlazo(o.cierrePostulacion)) + '</p>' +
          '<a class="boton' + (e.clase === 'cerrada' ? ' boton--linea' : '') +
            '" href="oportunidad.html?id=' + encodeURIComponent(o.id) + '">Ver oportunidad</a>' +
        '</div>' +
      '</li>';
  },

  /* Inserta cabecera y pie. Las páginas solo escriben su contenido.

     El título de la pestaña se arma acá a partir de data-titulo del body,
     para que el nombre de la marca siga viviendo en un solo lugar. El
     <title> escrito en el HTML queda como respaldo si el JavaScript falla,
     así que conviene mantenerlo parecido. */
  montarEsqueleto: function () {
    var arriba = document.getElementById('cabecera');
    var abajo = document.getElementById('pie');
    if (arriba) arriba.innerHTML = EU.ui.cabecera();
    if (abajo) abajo.innerHTML = EU.ui.pie();

    var propio = document.body.getAttribute('data-titulo');
    if (propio) document.title = propio + ' | ' + EU.marca.nombre;

    if (EU.marca.esMaqueta) document.documentElement.classList.add('es-maqueta');
  },

  /* Cambia el título desde una página que lo sabe recién al cargar los
     datos, como el detalle de una oportunidad. */
  titulo: function (texto) {
    document.title = texto + ' | ' + EU.marca.nombre;
  }
};
