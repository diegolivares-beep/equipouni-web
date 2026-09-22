/* ============================================================
   EXPORTAR POSTULANTES A PDF
   ------------------------------------------------------------
   Pedido del cliente: poder marcar postulantes y sacar un PDF con
   ellos y sus datos, para mandárselo a la productora del evento.

   Cómo funciona: se arma una hoja con formato de documento dentro de
   la misma página y se manda a imprimir. El navegador ofrece "Guardar
   como PDF" y sale un archivo con el logo, los datos y las respuestas.

   Por qué así y no con una librería de PDF: no agrega dependencias ni
   peso, respeta la tipografía y los colores de la marca, y el archivo
   que sale es seleccionable y buscable, no una imagen. Además funciona
   igual cuando el sitio pase a tener backend.
   ============================================================ */

window.EU = window.EU || {};

EU.exportar = {

  /* Arma la hoja imprimible con las postulaciones indicadas. */
  hojaPostulantes: function (oportunidad, filas) {
    var esc = EU.util.esc;
    var hoy = new Date();
    var fecha = hoy.getDate() + ' de ' + EU.util.MESES[hoy.getMonth()] + ' de ' + hoy.getFullYear();

    var fichas = filas.map(function (x, i) {
      var p = x.postulacion, f = x.ficha;
      if (!f) return '';

      var docs = [];
      if (f.formalizacion.inicioActividades) docs.push('Inicio de actividades');
      if (f.formalizacion.boleta) docs.push('Emite boleta');
      if (f.formalizacion.patente) docs.push('Patente comercial');
      if (f.formalizacion.resolucionSanitaria) docs.push('Resolución sanitaria');
      if (f.formalizacion.personalidadJuridica) docs.push('Personalidad jurídica');

      var respuestas = Object.keys(p.respuestas || {}).map(function (rid) {
        var q = null;
        (oportunidad.preguntas || []).forEach(function (y) { if (y.id === rid) q = y; });
        var v = p.respuestas[rid];
        if (Array.isArray(v)) v = v.join(', ');
        return '<tr><td class="pregunta">' + esc(q ? q.texto : rid) + '</td><td>' + esc(v) + '</td></tr>';
      }).join('');

      return '' +
        '<article class="ficha-pdf">' +
          '<header>' +
            '<span class="numero">' + (i + 1) + '</span>' +
            '<div>' +
              '<h2>' + esc(f.emprendimiento.nombre) + '</h2>' +
              '<p class="clasif">' + esc(EU.admin.clasificacionCorta(f)) + ' · ' +
                esc(EU.territorio.nombreComuna(f.emprendimiento.comuna)) + '</p>' +
            '</div>' +
            '<span class="estado-pdf">' + esc(EU.estados.etiqueta('postulacion', p.estado)) + '</span>' +
          '</header>' +
          '<table class="datos-pdf">' +
            '<tr><td class="pregunta">Representante</td><td>' + esc(f.representante.nombre) +
              ' · RUT ' + esc(f.representante.rut) + '</td></tr>' +
            '<tr><td class="pregunta">Contacto</td><td>' + esc(f.representante.correo) +
              ' · ' + esc(f.representante.telefono) + '</td></tr>' +
            '<tr><td class="pregunta">Qué vende</td><td>' + esc(f.emprendimiento.descripcion) + '</td></tr>' +
            (f.emprendimiento.instagram
              ? '<tr><td class="pregunta">Redes</td><td>' + esc(f.emprendimiento.instagram) + '</td></tr>' : '') +
            '<tr><td class="pregunta">Documentos</td><td>' +
              (docs.length ? esc(docs.join(' · ')) : 'Ninguno declarado') + '</td></tr>' +
            '<tr><td class="pregunta">Coincidencia</td><td>' +
              esc(EU.estados.clusterInfo[x.cluster].etiqueta) + ': ' + esc(x.razon) + '</td></tr>' +
            respuestas +
          '</table>' +
        '</article>';
    }).join('');

    return '' +
      '<div class="hoja">' +
        '<header class="cabecera-pdf">' +
          '<img src="assets/marca/cliente-logo.png" alt="' + esc(EU.marca.nombre) + '" class="logo-pdf">' +
          '<div class="meta-pdf">' +
            '<strong>Postulantes seleccionados</strong>' +
            '<span>Documento generado el ' + fecha + '</span>' +
          '</div>' +
        '</header>' +
        '<h1 class="titulo-pdf">' + esc(oportunidad.nombre) + '</h1>' +
        '<p class="bajada-pdf">' +
          EU.util.rangoFechas(oportunidad.fechaInicio, oportunidad.fechaTermino) + ' · ' +
          esc(oportunidad.lugar || oportunidad.direccion) + ', ' +
          esc(EU.territorio.nombreComuna(oportunidad.comuna)) + ' · ' +
          'Organiza ' + esc(oportunidad.organizacion) + '</p>' +
        '<p class="conteo-pdf">' + filas.length +
          (filas.length === 1 ? ' emprendimiento' : ' emprendimientos') + ' en esta lista</p>' +
        fichas +
        '<footer class="pie-pdf">' + esc(EU.marca.nombre) +
          ' · ' + esc(EU.marca.contacto.correo) + '</footer>' +
      '</div>';
  },

  /* Prepara la hoja en la página y abre el diálogo de impresión.
     Al cerrarse, la hoja se limpia para no dejar basura en el DOM. */
  imprimir: function (oportunidad, filas) {
    var zona = document.getElementById('hoja-impresion');
    if (!zona) {
      zona = document.createElement('div');
      zona.id = 'hoja-impresion';
      document.body.appendChild(zona);
    }
    zona.innerHTML = EU.exportar.hojaPostulantes(oportunidad, filas);
    document.body.classList.add('imprimiendo');

    function limpiar() {
      document.body.classList.remove('imprimiendo');
      zona.innerHTML = '';
      window.removeEventListener('afterprint', limpiar);
    }
    window.addEventListener('afterprint', limpiar);

    /* Dar un respiro para que el logo cargue antes de abrir el diálogo. */
    setTimeout(function () { window.print(); }, 120);
  }
};
