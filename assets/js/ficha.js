/* ============================================================
   MI FICHA: formulario de la ficha única
   ------------------------------------------------------------
   Reglas que esta pantalla hace visibles:

   - EL EMPRENDEDOR NO ELIGE SU RUBRO. Lo decidió el cliente el
     30-sep: antes había 12 rubros y 53 subrubros en un selector, y
     cada persona se clasificaba sola, con el resultado previsible de
     emprendimientos mal catalogados y un catálogo que no podía
     crecer. Ahora él cuenta qué vende en sus palabras y el equipo le
     asigna rubro, subrubros y etiquetas al validar. Acá la
     clasificación se MUESTRA y no se edita; el backend además la
     repone si alguien la manda por su cuenta.
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
    emprendimiento: { nombre: '', comuna: '', anoInicio: '', descripcion: '',
                      instagram: '', web: '', logo: '' },
    clasificacion: { rubro: '', subrubros: [], tipos: [], otroDetalle: '', queVende: '' },
    productos: { fotos: [], personaliza: false, detallePersonaliza: '', masVendidos: [] },
    etiquetas: [], formalizacion: {}, documentos: [], observaciones: {}
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
  f.elements['emp-web'].value = em.web || '';

  f.elements['cla-que-vende'].value = ficha.clasificacion.queVende || '';

  var top = ficha.productos.masVendidos || [];
  f.elements['pro-top1'].value = top[0] || '';
  f.elements['pro-top2'].value = top[1] || '';
  f.elements['pro-top3'].value = top[2] || '';

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

  /* ---------- Clasificación: solo se mira ----------
     La pone el equipo al validar. Mientras no exista, se dice qué falta
     y por qué, en vez de mostrar un espacio vacío que no se entiende. */

  function pintarClasificacion(fi) {
    var zona = document.getElementById('clasificacion-asignada');
    if (!zona) return;
    var c = fi.clasificacion || {};
    var etiquetas = fi.etiquetas || [];

    if (!c.rubro) {
      zona.innerHTML = '<p class="pista">Todavía no está clasificado. Lo hace el equipo ' +
        'de ' + esc(EU.marca.nombre) + ' cuando revise tu ficha, a partir de lo que ' +
        'escribiste arriba.</p>';
      return;
    }

    var nombreRubro = EU.catalogo.nombre(c.rubro);
    var subs = EU.catalogo.nombresSubrubros(c);
    zona.innerHTML =
      '<p style="margin:0"><strong>' + esc(nombreRubro) + '</strong>' +
      (subs.length ? ' · ' + esc(subs.join(', ')) : '') + '</p>' +
      (etiquetas.length
        ? '<p style="margin:.35rem 0 0;font-size:.9rem;color:var(--tinta-2)">' +
          esc(etiquetas.join(' · ')) + '</p>'
        : '') +
      '<p class="pista" style="margin:.4rem 0 0">Lo asignó el equipo. Si crees que no ' +
      'corresponde, escríbenos y lo revisamos.</p>';
  }

  pintarClasificacion(ficha);

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
    /* Lo único que se exige de más: que "qué vendes" diga algo. Es lo que
       el equipo va a leer para clasificar, así que una línea de tres
       palabras deja la ficha imposible de resolver. El mínimo es corto a
       propósito, para no convertirlo en una barrera. */
    var queVende = f.elements['cla-que-vende'].value.trim();
    if (queVende.length < 20) {
      avisar('Cuéntanos un poco más de qué vendes: con eso el equipo clasifica tu ' +
             'emprendimiento y lo encuentran las oportunidades que te sirven.', true);
      f.elements['cla-que-vende'].focus();
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
        instagram: f.elements['emp-instagram'].value.trim(),
        web: f.elements['emp-web'].value.trim()
      },
      /* Solo queVende: el rubro, los subrubros y las etiquetas son del
         equipo. Si se mandaran igual, el hook del backend los repone
         desde el original y el viaje sería en vano. */
      clasificacion: {
        queVende: f.elements['cla-que-vende'].value.trim()
      },
      productos: {
        personaliza: f.elements['pro-personaliza'].value === 'si',
        detallePersonaliza: f.elements['pro-detalle'].value.trim(),
        masVendidos: ['pro-top1', 'pro-top2', 'pro-top3']
          .map(function (id) { return f.elements[id].value.trim(); })
          .filter(function (v) { return v; })
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
        pintarLogo(nueva);
        pintarClasificacion(nueva);
      }
    }).catch(function (err) {
      ocupado(false);
      avisar(err.message || 'No se pudo guardar. Inténtalo otra vez.', true);
    });
  }

  /* ---------- Fotos y documentos ---------- */

  var porSubir = { fotos: [], documentos: [], logo: [] };

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
      porSubir = { fotos: [], documentos: [], logo: [] };
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

  function pintarLogo(f2) {
    var zona = document.getElementById('logo-actual');
    if (!zona) return;
    var logo = f2 && f2.emprendimiento && f2.emprendimiento.logo;
    zona.innerHTML = logo
      ? '<img src="' + esc(logo) + '" alt="Logo de ' +
        esc(f2.emprendimiento.nombre) + '" width="140" height="140" loading="lazy"' +
        ' style="object-fit:contain;background:var(--papel-2);border-radius:var(--r)">'
      : '<p class="pista">Todavía no has subido tu logo.</p>';
  }

  pintarLogo(ficha);

  var entradaLogo = document.getElementById('subir-logo');
  if (entradaLogo) {
    entradaLogo.addEventListener('change', function () {
      porSubir.logo = Array.prototype.slice.call(entradaLogo.files);
      document.getElementById('aviso-logo').textContent = porSubir.logo.length
        ? 'Logo listo para subir al guardar.' : '';
    });
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
