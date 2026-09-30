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

    /* El título sale de lo que hay en la lista, no de una frase fija.
       Antes decía siempre "Postulantes seleccionados" aunque se
       exportaran postulantes que no lo estaban, y en este punto del
       proceso normalmente todavía no hay nadie seleccionado. */
    var estados = {};
    filas.forEach(function (x) { estados[x.postulacion.estado] = true; });
    var soloUno = Object.keys(estados);
    var titulo = soloUno.length === 1
      ? EU.estados.etiqueta('postulacion', soloUno[0]) + 's'
      : 'Postulantes';

    /* UNA LÍNEA POR POSTULANTE, no una ficha por postulante.
       Lo pidió el cliente el 30-sep, textual: "ojalá cada semificha que se
       va a enviar esté lo más condensada en espacio posible". Con la ficha
       extendida, veinte postulantes eran veinte páginas y comparar
       obligaba a ir y volver. Los campos y su orden son los que él
       enumeró: nombre, emprendimiento, contacto, correo, rubro, los 3
       productos, sus respuestas y las etiquetas. */
    var cuerpo = filas.map(function (x, i) {
      var p = x.postulacion, f = x.ficha;
      if (!f) return '';

      var respuestas = Object.keys(p.respuestas || {}).map(function (rid) {
        var q = null;
        (oportunidad.preguntas || []).forEach(function (y) { if (y.id === rid) q = y; });
        var v = p.respuestas[rid];
        if (Array.isArray(v)) v = v.join(', ');
        return (q ? q.texto : rid) + ': ' + v;
      }).join(' · ');

      var top = (f.productos.masVendidos || []);
      var etiquetas = (f.etiquetas || []);

      var redes = [f.emprendimiento.instagram, f.emprendimiento.web]
        .filter(function (u) { return u; }).join(' · ');

      /* La formalización no está en la lista de campos que pidió el
         cliente, pero SÍ viajaba en la hoja anterior, y es justo el dato
         por el que él quiere poder priorizar. Sacarla al condensar habría
         sido una pérdida que nadie pidió: va abreviada, bajo el rubro. */
      var formal = [];
      if (f.formalizacion.inicioActividades) formal.push('inicio act.');
      if (f.formalizacion.boleta) formal.push('boleta');
      if (f.formalizacion.patente) formal.push('patente');
      if (f.formalizacion.resolucionSanitaria) formal.push('res. sanitaria');
      if (f.formalizacion.personalidadJuridica) formal.push('pers. jurídica');

      /* El RUT NO va acá, igual que antes. Es dato personal, la productora
         no lo necesita para decidir a quién dar un puesto, y al postular se
         le dijo al emprendedor que no se comparte. Si algún día hace falta
         (una factura, un seguro), se pide aparte y con su consentimiento,
         no de rutina para todos. */
      return '<tr>' +
        '<td class="num-pdf">' + (i + 1) + '</td>' +
        '<td><strong>' + esc(f.emprendimiento.nombre) + '</strong>' +
          '<span class="sub-pdf">' + esc(f.representante.nombre) + ' · ' +
          esc(EU.territorio.nombreComuna(f.emprendimiento.comuna)) + '</span></td>' +
        '<td>' + esc(f.representante.telefono) +
          '<span class="sub-pdf">' + esc(f.representante.correo) + '</span>' +
          (redes ? '<span class="sub-pdf">' + esc(redes) + '</span>' : '') + '</td>' +
        '<td>' + esc(EU.admin.clasificacionCorta(f)) +
          '<span class="sub-pdf">' +
          (formal.length ? esc(formal.join(', ')) : 'sin formalización declarada') +
          '</span></td>' +
        '<td>' + (top.length ? esc(top.join(', ')) : '<span class="vacio-pdf">no los declaró</span>') + '</td>' +
        '<td>' + (etiquetas.length ? esc(etiquetas.join(', ')) : '') + '</td>' +
        '<td>' + (respuestas ? esc(respuestas) : '<span class="vacio-pdf">sin respuestas</span>') + '</td>' +
      '</tr>';
    }).join('');

    var tabla =
      '<table class="lista-pdf">' +
        '<thead><tr>' +
          '<th></th><th>Emprendimiento</th><th>Contacto</th><th>Rubro</th>' +
          '<th>Más vendidos</th><th>Etiquetas</th><th>Respuestas</th>' +
        '</tr></thead>' +
        '<tbody>' + cuerpo + '</tbody>' +
      '</table>';

    return '' +
      '<div class="hoja">' +
        '<header class="cabecera-pdf">' +
          '<img src="assets/marca/cliente-logo.png" alt="' + esc(EU.marca.nombre) + '" class="logo-pdf">' +
          '<div class="meta-pdf">' +
            '<strong>' + esc(titulo) + '</strong>' +
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
        tabla +
        /* La productora recibe datos de contacto de terceros: tiene que
           saber para qué puede usarlos. Decirlo en el documento es lo
           que permite sostener después que se informó. */
        '<footer class="pie-pdf">' + esc(EU.marca.nombre) +
          ' · ' + esc(EU.marca.contacto.correo) + '<br>' +
          'Estos datos se entregan sólo para organizar ' + esc(oportunidad.nombre) +
          '. No se pueden usar para otra cosa ni compartir con terceros, y conviene ' +
          'eliminarlos una vez terminado el evento.' +
        '</footer>' +
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
