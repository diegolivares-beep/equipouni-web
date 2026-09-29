/* ============================================================
   MI FICHA: formulario de la ficha única
   ------------------------------------------------------------
   Reglas de la especificación que esta pantalla hace visibles:

   - El subrubro depende del rubro, y los tipos de producto dependen
     del subrubro. Los selectores se repueblan en cadena.
   - "Otro" existe en rubro y subrubro, pide detalle y deriva la
     clasificación a revisión humana.
   - Si cambia un dato de una sección validada, ESA sección vuelve a
     "pendiente de validación" sin tocar las demás. Acá se simula en
     vivo al editar.
   ============================================================ */

EU.alEstarListo(function () {
  'use strict';

  var esc = EU.util.esc;
  var usuario = EU.api.usuario();

  /* Quien acaba de crear su cuenta todavía no tiene ficha: se arma una
     en blanco para que el formulario tenga qué mostrar, y se crea en la
     base al guardar por primera vez. */
  var ficha = EU.sesion.ficha() || {
    id: null, estado: 'incompleta',
    representante: { nombre: usuario.nombre || '', rut: '', correo: usuario.email || '',
                     telefono: usuario.telefono || '', comuna: '', contactoPreferido: 'whatsapp' },
    emprendimiento: { nombre: '', comuna: '', anoInicio: '', descripcion: '', instagram: '' },
    clasificacion: { rubro: '', subrubros: [], tipos: [], otroDetalle: '' },
    productos: { fotos: [], personaliza: false, detallePersonaliza: '' },
    formalizacion: {}, documentos: [], observaciones: {}
  };

  /* Estado por sección: con observación pendiente es corrección; si no,
     hereda el estado global de la ficha. */
  var estadoSeccion = {};
  ['representante', 'emprendimiento', 'clasificacion', 'productos', 'formalizacion']
    .forEach(function (s) {
      estadoSeccion[s] = (ficha.observaciones && ficha.observaciones[s])
        ? 'correccion' : ficha.estado;
    });

  function pintarEstado(seccion) {
    var marca = document.querySelector('[data-estado-seccion="' + seccion + '"]');
    if (marca) marca.innerHTML = EU.cuenta.etiquetaFicha(estadoSeccion[seccion]);
  }

  /* Al editar una sección validada, pasa a pendiente. La simulación es
     el comportamiento real prometido por la especificación. */
  function vigilarCambios(seccion) {
    var zona = document.querySelector('[data-seccion="' + seccion + '"]');
    if (!zona) return;
    zona.addEventListener('change', function () {
      if (estadoSeccion[seccion] === 'validada') {
        estadoSeccion[seccion] = 'pendiente';
        pintarEstado(seccion);
        avisar('Cambiaste un dato ya validado: la sección "' + nombreSeccion(seccion) +
          '" volverá a revisión cuando guardes. El resto de tu ficha no se toca.');
      }
    });
  }

  function nombreSeccion(s) {
    return { representante: 'Quién representa', emprendimiento: 'El emprendimiento',
      clasificacion: 'Qué vendes', productos: 'Tus productos',
      formalizacion: 'Formalización' }[s] || s;
  }

  var mensaje = document.getElementById('mensaje-form');
  function avisar(texto, esError) {
    mensaje.textContent = texto;
    mensaje.className = 'mensaje-form' + (esError ? ' mensaje-form--error' : '');
  }

  /* ---------- Encabezado con el estado global ---------- */

  document.getElementById('estado-ficha').innerHTML =
    EU.cuenta.etiquetaFicha(ficha.estado) +
    ' <span style="font-size:.9rem;color:var(--tinta-2)">' +
    esc(EU.estados.info('ficha', ficha.estado).descripcion) + '</span>';

  /* ---------- Observaciones del revisor ---------- */

  var claves = Object.keys(ficha.observaciones || {});
  if (claves.length) {
    document.getElementById('observaciones').innerHTML =
      '<h2 style="font-size:1.2rem">Observaciones por resolver</h2>' +
      claves.map(function (s) {
        return '<p class="aviso-categoria"><strong>' + esc(nombreSeccion(s)) + ':</strong> ' +
               esc(ficha.observaciones[s]) + '</p>';
      }).join('');
  }

  /* ---------- Rellenar campos ---------- */

  var f = document.getElementById('form-ficha');
  var r = ficha.representante, em = ficha.emprendimiento;

  f.elements['rep-nombre'].value = r.nombre;
  f.elements['rep-rut'].value = r.rut;
  f.elements['rep-correo'].value = r.correo;
  f.elements['rep-telefono'].value = r.telefono;
  f.elements['rep-contacto'].value = r.contactoPreferido;

  f.elements['emp-nombre'].value = em.nombre;
  f.elements['emp-ano'].value = em.anoInicio;
  f.elements['emp-descripcion'].value = em.descripcion;
  f.elements['emp-instagram'].value = em.instagram || '';

  /* Comunas desde el territorio */
  ['rep-comuna', 'emp-comuna'].forEach(function (id) {
    var sel = f.elements[id];
    EU.territorio.comunasActivas().forEach(function (c) {
      var op = document.createElement('option');
      op.value = c.codigo; op.textContent = c.nombre;
      sel.appendChild(op);
    });
  });
  f.elements['rep-comuna'].value = r.comuna;
  f.elements['emp-comuna'].value = em.comuna;

  /* ---------- Clasificación dependiente ---------- */

  var selRubro = f.elements['cla-rubro'];
  var zonaSubrubros = document.getElementById('zona-subrubros');
  var zonaTipos = document.getElementById('zona-tipos');
  var campoOtro = document.getElementById('campo-otro');

  EU.catalogo.rubros.forEach(function (ru) {
    var op = document.createElement('option');
    op.value = ru.id; op.textContent = ru.nombre;
    selRubro.appendChild(op);
  });
  /* El brief pide "uno o varios subrubros", asi que van como casillas.
     El tope sale de EU.catalogo.MAX_SUBRUBROS (0 = sin limite). */
  function poblarSubrubros(idRubro, marcados) {
    var lista = EU.catalogo.subrubros(idRubro);
    marcados = marcados || [];
    if (!lista.length) {
      zonaSubrubros.innerHTML = idRubro === EU.catalogo.OTRO
        ? '<p class="pista">Este rubro no tiene subrubros: lo revisa una persona.</p>'
        : '<p class="pista">Elige primero un rubro.</p>';
      return;
    }
    var tope = EU.catalogo.MAX_SUBRUBROS;
    zonaSubrubros.innerHTML =
      '<p class="pista" style="margin:.2rem 0 .5rem">Marca todos los que correspondan' +
      (tope ? ', hasta ' + tope : '') + ':</p>' +
      lista.map(function (s) {
        var con = marcados.indexOf(s.id) !== -1 ? ' checked' : '';
        return '<label class="casilla"><input type="checkbox" name="cla-subrubros" value="' +
          esc(s.id) + '"' + con + '><span>' + esc(s.nombre) + '</span></label>';
      }).join('') +
      '<p class="mensaje-form" id="aviso-subrubros" style="min-height:0"></p>';
  }

  function subrubrosMarcados() {
    return Array.prototype.map.call(
      f.querySelectorAll('[name="cla-subrubros"]:checked'),
      function (c) { return c.value; });
  }

  /* Al marcar subrubros se rearman los tipos de producto de todos ellos,
     conservando lo que el emprendedor ya tenia marcado. */
  function alCambiarSubrubros() {
    var marcados = subrubrosMarcados();
    var tope = EU.catalogo.MAX_SUBRUBROS;
    var aviso = document.getElementById('aviso-subrubros');
    if (tope && marcados.length > tope) {
      if (aviso) {
        aviso.textContent = 'Puedes marcar hasta ' + tope + '.';
        aviso.className = 'mensaje-form mensaje-form--error';
      }
    } else if (aviso) {
      aviso.textContent = ''; aviso.className = 'mensaje-form';
    }
    poblarTipos(marcados, tiposMarcados());
  }

  function tiposMarcados() {
    return Array.prototype.map.call(
      f.querySelectorAll('[name="cla-tipos"]:checked'),
      function (c) { return c.value; });
  }

  function poblarTipos(idsSubrubro, marcados) {
    var tipos = [];
    (idsSubrubro || []).forEach(function (id) {
      EU.catalogo.tipos(id).forEach(function (x) {
        if (tipos.indexOf(x) === -1) tipos.push(x);
      });
    });
    if (!tipos.length) { zonaTipos.innerHTML = ''; return; }
    zonaTipos.innerHTML = '<p class="pista" style="margin:.2rem 0 .5rem">' +
      'Marca los tipos de producto que vendes:</p>' +
      tipos.map(function (t) {
        var con = (marcados || []).indexOf(t) !== -1 ? ' checked' : '';
        return '<label class="casilla"><input type="checkbox" name="cla-tipos" value="' +
          esc(t) + '"' + con + '><span>' + esc(t) + '</span></label>';
      }).join('');
  }

  function mostrarAvisoRubro(idRubro) {
    var ru = EU.catalogo.rubro(idRubro);
    var zona = document.getElementById('aviso-rubro');
    zona.innerHTML = (ru && ru.avisa)
      ? '<p class="aviso-categoria">' + esc(ru.avisa) + '</p>' : '';
  }

  selRubro.addEventListener('change', function () {
    var v = selRubro.value;
    campoOtro.hidden = v !== EU.catalogo.OTRO;
    poblarSubrubros(v, []);
    zonaTipos.innerHTML = '';
    mostrarAvisoRubro(v);
  });
  zonaSubrubros.addEventListener('change', alCambiarSubrubros);

  /* Estado inicial de la clasificación */
  selRubro.value = ficha.clasificacion.rubro;
  campoOtro.hidden = ficha.clasificacion.rubro !== EU.catalogo.OTRO;
  f.elements['cla-otro'].value = ficha.clasificacion.otroDetalle || '';
  var subsIniciales = EU.catalogo.subrubrosDe(ficha.clasificacion);
  poblarSubrubros(ficha.clasificacion.rubro, subsIniciales);
  poblarTipos(subsIniciales, ficha.clasificacion.tipos);
  mostrarAvisoRubro(ficha.clasificacion.rubro);

  /* ---------- Productos y formalización ---------- */

  /* Las fotos se pintan con pintarFotos(), definida más abajo. */

  f.elements['pro-personaliza'].value = ficha.productos.personaliza ? 'si' : 'no';
  f.elements['pro-detalle'].value = ficha.productos.detallePersonaliza || '';
  document.getElementById('campo-personaliza').hidden = !ficha.productos.personaliza;
  f.elements['pro-personaliza'].addEventListener('change', function () {
    document.getElementById('campo-personaliza').hidden = this.value !== 'si';
  });

  ['inicioActividades', 'boleta', 'patente', 'resolucionSanitaria', 'personalidadJuridica']
    .forEach(function (campo) {
      f.elements['for-' + campo].checked = !!ficha.formalizacion[campo];
    });

  /* ---------- Estados por sección y vigilancia de cambios ---------- */

  ['representante', 'emprendimiento', 'clasificacion', 'productos', 'formalizacion']
    .forEach(function (s) { pintarEstado(s); vigilarCambios(s); });

  /* ---------- Guardar ---------- */

  f.addEventListener('submit', function (e) {
    e.preventDefault();
    if (!f.checkValidity()) { f.reportValidity(); return; }
    var subs = subrubrosMarcados();
    var tope = EU.catalogo.MAX_SUBRUBROS;
    if (selRubro.value && selRubro.value !== EU.catalogo.OTRO && !subs.length) {
      avisar('Marca al menos un subrubro: es lo que usan las oportunidades para encontrarte.', true);
      return;
    }
    if (tope && subs.length > tope) {
      avisar('Puedes marcar hasta ' + tope + ' subrubros.', true);
      return;
    }
    if (selRubro.value === EU.catalogo.OTRO && !f.elements['cla-otro'].value.trim()) {
      avisar('Si marcas "Otro", cuéntanos en una línea qué vendes.', true);
      f.elements['cla-otro'].focus();
      return;
    }
    guardar();
  });

  /* ---------- Guardar contra el backend ---------- */

  var botonGuardar = f.querySelector('button[type="submit"]');
  var textoGuardar = botonGuardar ? botonGuardar.textContent : '';

  function recoger() {
    return {
      representante: {
        nombre: f.elements['rep-nombre'].value.trim(),
        rut: f.elements['rep-rut'].value.trim(),
        telefono: f.elements['rep-telefono'].value.trim(),
        comuna: f.elements['rep-comuna'].value,
        contactoPreferido: f.elements['rep-contacto'].value
      },
      emprendimiento: {
        nombre: f.elements['emp-nombre'].value.trim(),
        comuna: f.elements['emp-comuna'].value,
        anoInicio: f.elements['emp-ano'].value,
        descripcion: f.elements['emp-descripcion'].value.trim(),
        instagram: f.elements['emp-instagram'].value.trim()
      },
      clasificacion: {
        rubro: selRubro.value,
        subrubros: subrubrosMarcados(),
        tipos: tiposMarcados(),
        otroDetalle: f.elements['cla-otro'].value.trim()
      },
      productos: {
        personaliza: f.elements['pro-personaliza'].value === 'si',
        detallePersonaliza: f.elements['pro-detalle'].value.trim()
      },
      formalizacion: {
        inicioActividades: f.elements['for-inicioActividades'].checked,
        boleta: f.elements['for-boleta'].checked,
        patente: f.elements['for-patente'].checked,
        resolucionSanitaria: f.elements['for-resolucionSanitaria'].checked,
        personalidadJuridica: f.elements['for-personalidadJuridica'].checked
      }
    };
  }

  function ocupado(si) {
    if (!botonGuardar) return;
    botonGuardar.disabled = si;
    botonGuardar.textContent = si ? 'Guardando…' : textoGuardar;
  }

  function guardar() {
    ocupado(true);
    var cuerpo = EU.modelo.fichaHaciaBase(recoger());
    var accion = ficha.id
      ? EU.api.actualizar('fichas', ficha.id, cuerpo)
      : EU.api.crear('fichas', Object.assign({ usuario: usuario.id, estado: 'pendiente' }, cuerpo));

    accion.then(function (r) {
      ficha.id = r.id;
      return subirPendientes(r.id);
    }).then(function () {
      return EU.arranque.recargarMiFicha();
    }).then(function (nueva) {
      ocupado(false);
      var estado = nueva ? EU.estados.etiqueta('ficha', nueva.estado).toLowerCase() : 'guardada';
      avisar('Listo, tu ficha quedó guardada y está ' + estado + '.');
      if (nueva) {
        ficha = nueva;
        document.getElementById('estado-ficha').innerHTML =
          EU.cuenta.etiquetaFicha(nueva.estado) +
          ' <span style="font-size:.9rem;color:var(--tinta-2)">' +
          esc(EU.estados.info('ficha', nueva.estado).descripcion) + '</span>';
        pintarFotos(nueva);
      }
    }).catch(function (err) {
      ocupado(false);
      avisar(err.message || 'No se pudo guardar. Inténtalo otra vez.', true);
    });
  }

  /* ---------- Fotos y documentos ---------- */

  var porSubir = { fotos: [], documentos: [] };

  function subirPendientes(idFicha) {
    var campos = Object.keys(porSubir).filter(function (c) { return porSubir[c].length; });
    if (!campos.length) return Promise.resolve();
    var fd = new FormData();
    campos.forEach(function (campo) {
      porSubir[campo].forEach(function (archivo) { fd.append(campo, archivo); });
    });
    return fetch(EU.api.BASE + '/api/collections/fichas/records/' + idFicha, {
      method: 'PATCH',
      headers: { Authorization: EU.api.token() },
      body: fd
    }).then(function (r) {
      if (!r.ok) throw new Error('No se pudieron subir los archivos.');
      porSubir = { fotos: [], documentos: [] };
    });
  }

  function pintarFotos(f2) {
    var zona = document.getElementById('fotos-actuales');
    if (!zona) return;
    var fotos = (f2 && f2.productos.fotos) || [];
    zona.innerHTML = fotos.length
      ? fotos.map(function (fo) {
          return '<img src="' + esc(fo.miniatura || fo.url) + '" alt="Producto de ' +
                 esc(f2.emprendimiento.nombre) + '" width="160" height="120" loading="lazy">';
        }).join('')
      : '<p class="pista">Todavía no has subido fotografías.</p>';
  }

  var entradaFotos = document.getElementById('subir-fotos');
  if (entradaFotos) {
    entradaFotos.addEventListener('change', function () {
      porSubir.fotos = Array.prototype.slice.call(entradaFotos.files);
      var n = porSubir.fotos.length;
      document.getElementById('aviso-fotos').textContent = n
        ? n + (n === 1 ? ' foto lista para subir al guardar.' : ' fotos listas para subir al guardar.')
        : '';
    });
  }
  var entradaDocs = document.getElementById('subir-documentos');
  if (entradaDocs) {
    entradaDocs.addEventListener('change', function () {
      porSubir.documentos = Array.prototype.slice.call(entradaDocs.files);
      var n = porSubir.documentos.length;
      document.getElementById('aviso-documentos').textContent = n
        ? n + (n === 1 ? ' archivo listo para subir.' : ' archivos listos para subir.') : '';
    });
  }
});
