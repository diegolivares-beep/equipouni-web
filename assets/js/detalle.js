/* ============================================================
   DETALLE PÚBLICO DE UNA OPORTUNIDAD
   ------------------------------------------------------------
   Muestra lo que la especificación exige en el detalle: descripción
   completa, quién organiza, fechas y lugar, cupos y costo, qué incluye,
   requisitos y condiciones, y el plazo para postular.

   Cualquier persona puede leerlo sin cuenta. El botón Postular lleva a
   iniciar sesión o a crear la ficha, nunca a un formulario directo.
   ============================================================ */

(function () {
  'use strict';

  var esc = EU.util.esc;
  var contenedor = document.getElementById('detalle');
  var id = EU.util.parametro('id');
  var o = id ? EU.repo.oportunidades.obtener(id) : null;

  if (!o || !EU.estados.oportunidadInfo[o.estado] || !EU.estados.oportunidadInfo[o.estado].publica) {
    contenedor.innerHTML =
      '<div class="sin-resultados"><h1>No encontramos esa oportunidad</h1>' +
      '<p>Puede que el enlace esté vencido o que la publicación se haya retirado.</p>' +
      '<p><a class="boton" href="oportunidades.html">Ver las oportunidades abiertas</a></p></div>';
    return;
  }

  EU.ui.titulo(o.nombre);

  var abierta = EU.estados.recibePostulaciones(o);
  var e = EU.ui.etiquetaEstado(o);
  var comuna = EU.territorio.nombreComuna(o.comuna);

  function lista(items) {
    if (!items || !items.length) return '';
    return '<ul class="lista-simple">' + items.map(function (x) {
      return '<li>' + esc(x) + '</li>';
    }).join('') + '</ul>';
  }

  var rubros = (o.rubrosBuscados || []).map(function (r) { return EU.catalogo.nombre(r); });
  var subrubros = (o.subrubrosBuscados || []).map(function (s) { return EU.catalogo.nombre(s); });
  var avisos = EU.catalogo.avisos((o.rubrosBuscados || []).concat(o.subrubrosBuscados || []));

  var seccionPerfil = '';
  if (rubros.length) {
    seccionPerfil =
      '<section class="seccion-detalle"><h2>A quién buscan</h2>' +
      '<p>Rubros: <strong>' + esc(rubros.join(', ')) + '</strong>.' +
      (subrubros.length ? ' Con prioridad para ' + esc(subrubros.join(', ').toLowerCase()) + '.' : '') +
      '</p>' +
      avisos.map(function (a) { return '<p class="aviso-categoria">' + esc(a) + '</p>'; }).join('') +
      '</section>';
  }

  var seccionRequisitos = '';
  if ((o.requisitos || []).length) {
    seccionRequisitos =
      '<section class="seccion-detalle"><h2>Requisitos</h2>' + lista(o.requisitos) + '</section>';
  }

  var condiciones = [];
  if (o.plazoPago) condiciones.push(['Pago', o.plazoPago]);
  if (o.asistencia) condiciones.push(['Asistencia', o.asistencia]);
  if (o.cancelacion) condiciones.push(['Cancelación', o.cancelacion]);

  /* En producción este botón pasa por iniciar sesión. En la maqueta lleva
     directo al flujo de postulación con la cuenta de demostración, para
     poder recorrerlo de punta a punta. */
  var botonPostular = abierta
    ? '<a class="boton boton--grande" href="postular.html?id=' +
      encodeURIComponent(o.id) + '">Postular</a>' +
      '<p class="nota">Para postular necesitas una cuenta con tu ficha al día. ' +
      'Crearla toma unos cinco minutos y sirve para todas las oportunidades.</p>'
    : '<p class="nota">Esta oportunidad ya no recibe postulaciones.</p>';

  contenedor.innerHTML =
    '<p class="migas"><a href="oportunidades.html">Oportunidades</a> / ' + esc(o.nombre) + '</p>' +

    '<div class="detalle">' +
      '<article>' +
        '<p class="fila-etiquetas">' +
          '<span class="estado estado--' + e.clase + '">' + e.texto + '</span>' +
          '<span class="tipo">' + esc(EU.catalogo.nombreTipo(o.tipo)) + '</span>' +
        '</p>' +
        '<h1>' + esc(o.nombre) + '</h1>' +
        '<p class="oportunidad__organiza">Organiza ' + esc(o.organizacion) + '</p>' +

        '<img class="detalle__foto" src="assets/img/' + esc(o.imagen) + '" alt="' +
          esc(o.imagenAlt) + '" width="1400" height="600" decoding="async">' +

        '<section class="seccion-detalle"><h2>De qué se trata</h2>' +
          '<p>' + esc(o.descripcion) + '</p></section>' +

        seccionPerfil +

        '<section class="seccion-detalle"><h2>Qué incluye el espacio</h2>' +
          lista(o.queIncluye) +
          ((o.queNoIncluye || []).length
            ? '<p>No incluye: ' + esc(o.queNoIncluye.join(', ').toLowerCase()) + '.</p>'
            : '') +
        '</section>' +

        seccionRequisitos +

        (condiciones.length
          ? '<section class="seccion-detalle"><h2>Condiciones</h2><ul class="lista-datos">' +
            condiciones.map(function (c) {
              return '<li><b>' + esc(c[0]) + '</b><span>' + esc(c[1]) + '</span></li>';
            }).join('') + '</ul></section>'
          : '') +
      '</article>' +

      '<aside class="ficha-lateral" aria-label="Resumen y postulación">' +
        '<h2>' + (abierta ? 'Postulaciones abiertas' : 'Postulaciones cerradas') + '</h2>' +
        '<dl class="datos">' +
          '<div><dt>Cuándo</dt><dd>' + EU.util.rangoFechas(o.fechaInicio, o.fechaTermino) +
            (o.horario ? ', ' + esc(o.horario) : '') + '</dd></div>' +
          '<div><dt>Dónde</dt><dd>' + esc(o.direccion) + ', ' + esc(comuna) + '</dd></div>' +
          '<div><dt>Participación</dt><dd>' + EU.util.pesos(o.valor) + '</dd></div>' +
          '<div><dt>Cupos</dt><dd>' + o.cuposDisponibles + ' disponibles de ' + o.cupos + '</dd></div>' +
          '<div><dt>Cierre</dt><dd>' + EU.util.diaConAno(o.cierrePostulacion) + '</dd></div>' +
        '</dl>' +
        '<p class="plazo' + (e.clase === 'pronto' ? ' plazo--urgente' : '') + '" style="margin-top:.8rem">' +
          esc(EU.util.textoPlazo(o.cierrePostulacion)) + '</p>' +
        botonPostular +
      '</aside>' +
    '</div>';
})();
