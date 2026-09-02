/* ============================================================
   POSTULAR A UNA OPORTUNIDAD
   ------------------------------------------------------------
   El flujo que exige la especificación: abrir la oportunidad,
   confirmar que la ficha está vigente, responder TODAS las preguntas
   particulares y enviar.

   Validaciones antes de enviar, las cuatro, siempre:
   1. La oportunidad sigue abierta y dentro del plazo.
   2. La ficha permite postular (estado validada).
   3. Todas las preguntas particulares tienen respuesta.
   4. No existe otra postulación del mismo emprendimiento.

   En la versión real, la postulación queda vinculada a una copia de
   los datos de la ficha en ese momento.
   ============================================================ */

(function () {
  'use strict';

  var esc = EU.util.esc;
  var contenedor = document.getElementById('postular');
  var id = EU.util.parametro('id');
  var o = id ? EU.repo.oportunidades.obtener(id) : null;
  var ficha = EU.sesion.ficha();

  function pantalla(html) { contenedor.innerHTML = html; }

  function volverA(texto, enlace, boton) {
    return '<p class="acciones" style="margin-top:1rem"><a class="boton" href="' + enlace + '">' +
      esc(boton) + '</a></p>';
  }

  /* ---------- Cortes previos: sin oportunidad no hay nada que hacer ---------- */

  if (!o) {
    pantalla('<h1>Falta elegir la oportunidad</h1>' +
      '<p>Llega a esta página desde el botón Postular de una oportunidad.</p>' +
      volverA('', 'oportunidades.html', 'Ver oportunidades'));
    return;
  }

  EU.ui.titulo('Postular a ' + o.nombre);

  /* Validación 1: abierta y dentro del plazo. */
  if (!EU.estados.recibePostulaciones(o)) {
    pantalla('<h1>Esta oportunidad ya cerró</h1>' +
      '<p>' + esc(o.nombre) + ' dejó de recibir postulaciones el ' +
      EU.util.diaConAno(o.cierrePostulacion) + '.</p>' +
      volverA('', 'oportunidades.html', 'Ver otras oportunidades'));
    return;
  }

  /* Validación 4: sin postulación duplicada. */
  if (EU.datos.yaPostulo(EU.sesion.emprendedor, o.id)) {
    pantalla('<h1>Ya postulaste a esta oportunidad</h1>' +
      '<p>' + esc(ficha.emprendimiento.nombre) + ' ya tiene una postulación a ' +
      esc(o.nombre) + '. Un emprendimiento no puede postular dos veces a la misma.</p>' +
      volverA('', 'cuenta-postulaciones.html', 'Ver mis postulaciones'));
    return;
  }

  /* Validación 2: la ficha permite postular. */
  var puedeFicha = EU.estados.info('ficha', ficha.estado).permitePostular;

  /* ---------- Pantalla del flujo ---------- */

  var resumenFicha =
    '<section class="seccion-detalle"><h2>1. Confirma tu ficha</h2>' +
    '<div class="ficha-lateral" style="position:static">' +
      '<p class="fila-etiquetas">' + EU.cuenta.etiquetaFicha(ficha.estado) + '</p>' +
      '<dl class="datos">' +
        '<div><dt>Emprendimiento</dt><dd>' + esc(ficha.emprendimiento.nombre) + '</dd></div>' +
        '<div><dt>Qué vende</dt><dd>' + esc(EU.catalogo.nombre(ficha.clasificacion.rubro)) +
          (ficha.clasificacion.subrubro ? ', ' + esc(EU.catalogo.nombre(ficha.clasificacion.subrubro).toLowerCase()) : '') +
        '</dd></div>' +
        '<div><dt>Comuna</dt><dd>' + esc(EU.territorio.nombreComuna(ficha.emprendimiento.comuna)) + '</dd></div>' +
        '<div><dt>Contacto</dt><dd>' + esc(ficha.representante.correo) + '</dd></div>' +
      '</dl>' +
      '<p class="nota">Esta es la información que va a recibir quien organiza, tal como ' +
      'está ahora. <a href="cuenta-ficha.html">Revisar mi ficha</a> antes de enviar.</p>' +
    '</div>' +
    (puedeFicha ? '' :
      '<p class="aviso-categoria">Tu ficha está en estado "' +
      esc(EU.estados.etiqueta('ficha', ficha.estado).toLowerCase()) +
      '" y todavía no permite postular. Resuélvelo en <a href="cuenta-ficha.html">Mi ficha</a>.</p>') +
    '</section>';

  var preguntas = (o.preguntas || []).map(function (q, i) {
    var control;
    if (q.tipo === 'una') {
      control = q.alternativas.map(function (alt) {
        return '<label class="casilla"><input type="radio" name="' + esc(q.id) +
          '" value="' + esc(alt) + '" required><span>' + esc(alt) + '</span></label>';
      }).join('');
    } else {
      control = q.alternativas.map(function (alt) {
        return '<label class="casilla"><input type="checkbox" name="' + esc(q.id) +
          '" value="' + esc(alt) + '"><span>' + esc(alt) + '</span></label>';
      }).join('');
    }
    return '<fieldset><legend>' + (i + 1) + '. ' + esc(q.texto) + '</legend>' + control + '</fieldset>';
  }).join('');

  pantalla(
    '<p class="migas"><a href="oportunidad.html?id=' + encodeURIComponent(o.id) + '">' +
      esc(o.nombre) + '</a> / Postular</p>' +
    '<h1 style="max-width:22ch">Postular a ' + esc(o.nombre) + '</h1>' +
    '<p class="angosto">' + EU.util.rangoFechas(o.fechaInicio, o.fechaTermino) + ' en ' +
      esc(EU.territorio.nombreComuna(o.comuna)) + '. ' +
      esc(EU.util.textoPlazo(o.cierrePostulacion)) + '.</p>' +

    resumenFicha +

    '<section class="seccion-detalle"><h2>2. Responde las preguntas de esta oportunidad</h2>' +
      '<form class="formulario" id="form-postular" novalidate>' +
        (preguntas || '<p>Esta oportunidad no hace preguntas adicionales.</p>') +
        '<p><button class="boton boton--grande" type="submit"' + (puedeFicha ? '' : ' disabled') +
          '>Enviar postulación</button></p>' +
        '<p id="mensaje-form" class="mensaje-form" role="status" aria-live="polite"></p>' +
      '</form>' +
    '</section>');

  /* ---------- Envío ---------- */

  var form = document.getElementById('form-postular');
  var mensaje = document.getElementById('mensaje-form');

  form.addEventListener('submit', function (e) {
    e.preventDefault();

    /* Validación 3: todas las preguntas respondidas. Las de tipo
       "varias" exigen al menos una alternativa marcada. */
    var faltantes = [];
    (o.preguntas || []).forEach(function (q) {
      var marcadas = form.querySelectorAll('[name="' + q.id + '"]:checked').length;
      if (!marcadas) faltantes.push(q.texto);
    });
    if (faltantes.length) {
      mensaje.textContent = 'Falta responder: ' + faltantes.join(' · ');
      mensaje.className = 'mensaje-form mensaje-form--error';
      return;
    }

    mensaje.className = 'mensaje-form';
    mensaje.textContent = 'Postulación válida. En la versión final quedaría registrada ' +
      'como "Postulado", junto con una copia de tu ficha de hoy, y la verías en Mis postulaciones.';
  });
})();
