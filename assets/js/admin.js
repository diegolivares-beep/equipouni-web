/* ============================================================
   PANEL ADMINISTRATIVO: esqueleto y operaciones en memoria
   ------------------------------------------------------------
   El panel es la herramienta del equipo de EquipoUni. En la maqueta
   las acciones (cambiar estados, aprobar fichas) operan sobre los
   datos EN MEMORIA: sirven para probar el flujo completo y se
   pierden al recargar, y el aviso superior lo dice.

   Dos reglas de la especificación que este código hace cumplir:
   - Ningún cambio de estado fuera de la tabla de transiciones.
   - Cambiar estados y enviar correos son acciones separadas: aquí
     no existe ningún botón que haga las dos cosas a la vez.
   ============================================================ */

window.EU = window.EU || {};

EU.admin = {

  MENU: [
    { archivo: 'admin.html',                texto: 'Panel' },
    { archivo: 'admin-oportunidades.html',  texto: 'Oportunidades' },
    { archivo: 'admin-validaciones.html',   texto: 'Validaciones' },
    { archivo: 'admin-emprendedores.html',  texto: 'Emprendedores' },
    { archivo: 'admin-comunicaciones.html', texto: 'Comunicaciones' }
  ],

  cabecera: function () {
    var esc = EU.util.esc;
    var actual = EU.ui.paginaActual();
    var enlaces = EU.admin.MENU.map(function (m) {
      var activo = m.archivo === actual ? ' aria-current="page"' : '';
      return '<li><a href="' + m.archivo + '"' + activo + '>' + esc(m.texto) + '</a></li>';
    }).join('');

    var aviso = '';
    if (EU.marca.esMaqueta) {
      aviso = '<div class="demo"><div class="envoltura"><p>Panel administrativo de ' +
        'demostración. Los cambios de estado funcionan pero viven solo en esta ' +
        'pestaña: se pierden al recargar.</p></div></div>';
    }

    return aviso +
      '<header class="cabecera cabecera--admin"><div class="envoltura">' +
        EU.ui.logotipo() +
        '<nav aria-label="Panel administrativo"><ul class="menu">' + enlaces + '</ul></nav>' +
        '<div class="cabecera__acciones">' +
          '<a class="enlace-sesion" href="index.html">Salir del panel</a>' +
        '</div>' +
      '</div></header>';
  },

  montar: function () {
    var arriba = document.getElementById('cabecera');
    if (arriba) arriba.innerHTML = EU.admin.cabecera();
    var propio = document.body.getAttribute('data-titulo');
    if (propio) document.title = propio + ' | Panel ' + EU.marca.nombre;
  },

  /* ---------- Cambios de estado en memoria ---------- */

  /* Cambia el estado de una postulación respetando las transiciones.
     Devuelve { ok, error }. Registra el paso en el historial, y para
     "renuncio" conserva el estado anterior, como exige la especificación. */
  /* Devuelve una promesa: el cambio lo aplica el backend, que además
     vuelve a verificar la transición aunque acá ya se haya revisado. */
  cambiarEstado: function (idPostulacion, nuevoEstado) {
    var p = EU.datos.postulacion(idPostulacion);
    if (!p) return Promise.reject(new Error('No existe la postulación.'));
    if (p.estado === nuevoEstado) return Promise.reject(new Error('Ya está en ese estado.'));
    if (!EU.estados.puedeTransitar(p.estado, nuevoEstado)) {
      return Promise.reject(new Error('No se puede pasar de "' +
        EU.estados.etiqueta('postulacion', p.estado) + '" a "' +
        EU.estados.etiqueta('postulacion', nuevoEstado) + '".'));
    }
    return EU.api.actualizar('postulaciones', idPostulacion, { estado: nuevoEstado })
      .then(function (r) {
        var actualizada = EU.modelo.postulacionDesdeBase(r);
        for (var k in actualizada) p[k] = actualizada[k];
        return p;
      });
  },

  /* Las cinco secciones de la ficha, en el orden en que se revisan. La
     observación se guarda contra una de ellas para que el emprendedor
     sepa qué tiene que arreglar: antes todo caía en "general" y él leía
     "general" como título del problema. */
  SECCIONES: [
    ['representante', 'Quién representa'],
    ['emprendimiento', 'El emprendimiento'],
    ['clasificacion', 'Qué vende'],
    ['productos', 'Sus productos'],
    ['formalizacion', 'Formalización']
  ],

  /* Cambia el estado de una ficha (validar o pedir corrección). */
  resolverFicha: function (idFicha, decision, observacion, seccion) {
    var obs = {};
    obs[seccion || 'general'] = observacion || 'Revisar antecedentes.';
    var cuerpo = decision === 'validar'
      ? { estado: 'validada', observaciones: {} }
      : { estado: 'correccion', observaciones: obs };
    return EU.api.actualizar('fichas', idFicha, cuerpo).then(function (r) {
      var f = EU.datos.emprendedor(idFicha);
      var nueva = EU.modelo.fichaDesdeBase(r);
      if (f) { f.estado = nueva.estado; f.observaciones = nueva.observaciones; }
      return nueva;
    });
  },

  /* ---------- Piezas de interfaz ---------- */

  etiquetaCluster: function (cluster) {
    var info = EU.estados.clusterInfo[cluster];
    var clase = { directa: 'abierta', parcial: 'cerrada', complementario: 'cerrada', revision: 'pronto' }[cluster];
    return '<span class="estado estado--' + clase + '">' + EU.util.esc(info.etiqueta) + '</span>';
  },

  /* Resumen en una línea de la clasificación de una ficha. */
  clasificacionCorta: function (ficha) {
    var c = ficha.clasificacion;
    if (c.rubro === EU.catalogo.OTRO) return 'Otro: ' + (c.otroDetalle || 'sin detalle');
    var t = EU.catalogo.nombre(c.rubro);
    var subs = EU.catalogo.nombresSubrubros(c);
    if (subs.length) t += ' · ' + subs.join(', ');
    return t;
  },

  /* Ficha completa desplegada, para revisión dentro del panel. */
  fichaCompleta: function (ficha) {
    var esc = EU.util.esc;
    var r = ficha.representante, em = ficha.emprendimiento;
    var docs = [];
    if (ficha.formalizacion.inicioActividades) docs.push('Inicio de actividades');
    if (ficha.formalizacion.boleta) docs.push('Emite boleta');
    if (ficha.formalizacion.patente) docs.push('Patente comercial');
    if (ficha.formalizacion.resolucionSanitaria) docs.push('Resolución sanitaria');
    if (ficha.formalizacion.personalidadJuridica) docs.push('Personalidad jurídica');

    var fotos = (ficha.productos.fotos || []).map(function (fo) {
      var url = fo && fo.miniatura ? fo.miniatura : (fo && fo.url) || ('assets/img/' + fo);
      return '<img src="' + esc(url) + '" alt="Producto de ' +
        esc(em.nombre) + '" width="160" height="120" loading="lazy">';
    }).join('');

    /* Los archivos adjuntos: la pantalla promete comprobarlos y antes no
       los mostraba, sólo decía qué casillas había marcado el emprendedor.
       Van protegidos, así que el enlace pide su permiso al tocarlo. */
    var adjuntos = (ficha.documentos || []).length
      ? (ficha.documentos || []).map(function (d, i) {
          return '<button type="button" class="enlace-doc" data-doc="' + esc(ficha.id) +
            '" data-archivo="' + esc(d.archivo) + '" style="background:none;border:0;padding:0;' +
            'color:var(--acento);text-decoration:underline;cursor:pointer;font:inherit">' +
            'Documento ' + (i + 1) + '</button>';
        }).join(' · ')
      : '<span style="color:var(--tinta-2)">No subió ninguno</span>';

    var personaliza = ficha.productos.personaliza
      ? 'Sí' + (ficha.productos.detallePersonaliza
          ? ': ' + esc(ficha.productos.detallePersonaliza) : '')
      : 'No';

    return '<dl class="datos" style="border-top:0;padding-top:0;margin-top:.4rem">' +
      '<div><dt>Representante</dt><dd>' + esc(r.nombre) + '<br>' + esc(r.rut) + '</dd></div>' +
      '<div><dt>Contacto</dt><dd>' + esc(r.correo) + '<br>' + esc(r.telefono) + '</dd></div>' +
      '<div><dt>Comuna</dt><dd>' + esc(EU.territorio.nombreComuna(em.comuna)) + '</dd></div>' +
      '<div><dt>Desde</dt><dd>' + em.anoInicio + '</dd></div>' +
      '<div><dt>Clasificación</dt><dd>' + esc(EU.admin.clasificacionCorta(ficha)) + '</dd></div>' +
      '<div><dt>Personaliza</dt><dd>' + personaliza + '</dd></div>' +
      '<div><dt>Declara tener</dt><dd>' + (docs.length ? esc(docs.join(', ')) : 'Ninguno') + '</dd></div>' +
      '<div><dt>Archivos que subió</dt><dd>' + adjuntos + '</dd></div>' +
      '</dl>' +
      '<p style="margin:.7rem 0 .4rem;font-size:.92rem">' + esc(em.descripcion) + '</p>' +
      (em.instagram ? '<p style="font-size:.85rem"><a href="' + esc(em.instagram) +
        '" target="_blank" rel="noopener noreferrer">Ver redes del emprendimiento</a></p>' : '') +
      '<div class="fotos-ficha">' + fotos + '</div>';
  },

  /* Abre un documento protegido. Se engancha una vez por pantalla y vale
     para todos los botones, incluidos los que se dibujen después. */
  conectarDocumentos: function (contenedor) {
    (contenedor || document).addEventListener('click', function (e) {
      var b = e.target.closest ? e.target.closest('[data-doc]') : null;
      if (!b) return;
      var ficha = EU.datos.emprendedor(b.getAttribute('data-doc'));
      if (!ficha) return;
      var texto = b.textContent;
      b.textContent = 'Abriendo…';
      EU.api.archivoProtegido(ficha._registro, b.getAttribute('data-archivo'))
        .then(function (url) {
          b.textContent = texto;
          window.open(url, '_blank', 'noopener');
        })
        .catch(function () { b.textContent = 'No se pudo abrir'; });
    });
  }
};
