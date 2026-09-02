/* ============================================================
   ÁREA PRIVADA DEL EMPRENDEDOR: esqueleto y sesión simulada
   ------------------------------------------------------------
   La maqueta no tiene cuentas reales. El área privada se navega con
   la ficha 'emp-demo' (Carla Rojas, Telar Bruma) como si esa fuera la
   sesión iniciada, y lo dice en un aviso permanente.

   Cuando exista backend, EU.sesion se reemplaza por el usuario real
   y todo lo demás queda igual.
   ============================================================ */

window.EU = window.EU || {};

EU.sesion = {
  emprendedor: 'emp-demo',
  ficha: function () { return EU.datos.emprendedor(EU.sesion.emprendedor); }
};

EU.cuenta = {

  MENU: [
    { archivo: 'cuenta.html',               texto: 'Resumen' },
    { archivo: 'cuenta-ficha.html',         texto: 'Mi ficha' },
    { archivo: 'oportunidades.html',        texto: 'Oportunidades' },
    { archivo: 'cuenta-postulaciones.html', texto: 'Mis postulaciones' },
    { archivo: 'cuenta-historial.html',     texto: 'Historial' }
  ],

  cabecera: function () {
    var esc = EU.util.esc;
    var actual = EU.ui.paginaActual();
    var ficha = EU.sesion.ficha();

    var enlaces = EU.cuenta.MENU.map(function (m) {
      var activo = m.archivo === actual ? ' aria-current="page"' : '';
      return '<li><a href="' + m.archivo + '"' + activo + '>' + esc(m.texto) + '</a></li>';
    }).join('');

    var aviso = '';
    if (EU.marca.esMaqueta) {
      aviso = '<div class="demo"><div class="envoltura"><p>Área privada de demostración: ' +
        'estás navegando la cuenta de ' + esc(ficha.representante.nombre) + ' (' +
        esc(ficha.emprendimiento.nombre) + '). Los cambios no se guardan.</p></div></div>';
    }

    return aviso +
      '<header class="cabecera"><div class="envoltura">' +
        EU.ui.logotipo() +
        '<nav aria-label="Área privada"><ul class="menu">' + enlaces + '</ul></nav>' +
        '<div class="cabecera__acciones">' +
          '<a class="enlace-sesion" href="index.html">Cerrar sesión</a>' +
        '</div>' +
      '</div></header>';
  },

  montar: function () {
    var arriba = document.getElementById('cabecera');
    var abajo = document.getElementById('pie');
    if (arriba) arriba.innerHTML = EU.cuenta.cabecera();
    if (abajo) abajo.innerHTML = EU.ui.pie();
    var propio = document.body.getAttribute('data-titulo');
    if (propio) document.title = propio + ' | ' + EU.marca.nombre;
  },

  /* Etiqueta con el estado de la ficha, con el tono que corresponde. */
  etiquetaFicha: function (estado) {
    var info = EU.estados.info('ficha', estado);
    var clase = { bueno: 'abierta', espera: 'pronto', alerta: 'cerrada', neutro: 'cerrada' }[info.tono] || 'cerrada';
    /* El tono "alerta" merece el rojo de urgencia, no el gris. */
    if (info.tono === 'alerta') clase = 'pronto';
    return '<span class="estado estado--' + clase + '">' + EU.util.esc(info.etiqueta) + '</span>';
  },

  etiquetaPostulacion: function (estado) {
    var info = EU.estados.info('postulacion', estado);
    var clase = { bueno: 'abierta', espera: 'cerrada', neutro: 'cerrada' }[info.tono] || 'cerrada';
    return '<span class="estado estado--' + clase + '">' + EU.util.esc(info.etiqueta) + '</span>';
  },

  /* Una postulación pertenece al historial cuando su ciclo terminó:
     renunció, o el evento al que postuló ya pasó. */
  esHistorica: function (p) {
    if (p.estado === 'renuncio') return true;
    var o = EU.repo.oportunidades.obtener(p.oportunidad);
    if (!o) return true;
    return EU.util.aFecha(o.fechaTermino) < EU.util.hoy();
  },

  /* Fila de una postulación, con su detalle desplegable: respuestas
     dadas e historial de estados. */
  filaPostulacion: function (p) {
    var esc = EU.util.esc;
    var o = EU.repo.oportunidades.obtener(p.oportunidad);
    if (!o) return '';

    var respuestas = Object.keys(p.respuestas || {}).map(function (rid) {
      var pregunta = null;
      (o.preguntas || []).forEach(function (q) { if (q.id === rid) pregunta = q; });
      var valor = p.respuestas[rid];
      if (Array.isArray(valor)) valor = valor.join(', ');
      return '<li><b>' + esc(pregunta ? pregunta.texto : rid) + '</b><span>' +
             esc(valor) + '</span></li>';
    }).join('');

    var historial = (p.historial || []).map(function (h) {
      return '<li><b>' + EU.util.dia(h.fecha) + '</b><span>' +
             esc(EU.estados.etiqueta('postulacion', h.a)) +
             (h.desde ? ' (venía de ' + esc(EU.estados.etiqueta('postulacion', h.desde).toLowerCase()) + ')' : '') +
             '</span></li>';
    }).join('');

    return '<details class="postulacion">' +
      '<summary>' +
        '<span class="postulacion__resumen">' +
          '<strong>' + esc(o.nombre) + '</strong>' +
          '<small>' + EU.util.rangoFechas(o.fechaInicio, o.fechaTermino) + ' en ' +
            esc(EU.territorio.nombreComuna(o.comuna)) +
            ' · postulada el ' + EU.util.dia(p.fecha) + '</small>' +
        '</span>' +
        EU.cuenta.etiquetaPostulacion(p.estado) +
      '</summary>' +
      '<div class="postulacion__detalle">' +
        '<p>' + esc(EU.estados.info('postulacion', p.estado).descripcion) + '</p>' +
        (respuestas ? '<h4>Lo que respondiste</h4><ul class="lista-datos">' + respuestas + '</ul>' : '') +
        '<h4>Historial</h4><ul class="lista-datos">' + historial + '</ul>' +
        '<p style="margin-top:.8rem"><a href="oportunidad.html?id=' + encodeURIComponent(o.id) +
          '">Ver la oportunidad</a></p>' +
      '</div>' +
    '</details>';
  }
};
