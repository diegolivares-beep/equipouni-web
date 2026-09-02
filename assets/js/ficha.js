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

(function () {
  'use strict';

  var esc = EU.util.esc;
  var ficha = EU.sesion.ficha();

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
  var selSubrubro = f.elements['cla-subrubro'];
  var zonaTipos = document.getElementById('zona-tipos');
  var campoOtro = document.getElementById('campo-otro');

  EU.catalogo.rubros.forEach(function (ru) {
    var op = document.createElement('option');
    op.value = ru.id; op.textContent = ru.nombre;
    selRubro.appendChild(op);
  });
  var opOtro = document.createElement('option');
  opOtro.value = EU.catalogo.OTRO;
  opOtro.textContent = 'Otro (lo revisa una persona)';
  selRubro.appendChild(opOtro);

  function poblarSubrubros(idRubro, valor) {
    selSubrubro.innerHTML = '<option value="">Elige uno</option>';
    EU.catalogo.subrubros(idRubro).forEach(function (s) {
      var op = document.createElement('option');
      op.value = s.id; op.textContent = s.nombre;
      selSubrubro.appendChild(op);
    });
    selSubrubro.disabled = !EU.catalogo.subrubros(idRubro).length;
    if (valor) selSubrubro.value = valor;
  }

  function poblarTipos(idSubrubro, marcados) {
    var tipos = EU.catalogo.tipos(idSubrubro);
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
    poblarSubrubros(v, '');
    zonaTipos.innerHTML = '';
    mostrarAvisoRubro(v);
  });
  selSubrubro.addEventListener('change', function () {
    poblarTipos(selSubrubro.value, []);
  });

  /* Estado inicial de la clasificación */
  selRubro.value = ficha.clasificacion.rubro;
  campoOtro.hidden = ficha.clasificacion.rubro !== EU.catalogo.OTRO;
  f.elements['cla-otro'].value = ficha.clasificacion.otroDetalle || '';
  poblarSubrubros(ficha.clasificacion.rubro, ficha.clasificacion.subrubro);
  poblarTipos(ficha.clasificacion.subrubro, ficha.clasificacion.tipos);
  mostrarAvisoRubro(ficha.clasificacion.rubro);

  /* ---------- Productos y formalización ---------- */

  document.getElementById('fotos-actuales').innerHTML =
    (ficha.productos.fotos || []).map(function (foto) {
      return '<img src="assets/img/' + esc(foto) + '" alt="Fotografía de producto de ' +
        esc(em.nombre) + '" width="160" height="120" loading="lazy">';
    }).join('');

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
    if (selRubro.value === EU.catalogo.OTRO && !f.elements['cla-otro'].value.trim()) {
      avisar('Si marcas "Otro", cuéntanos en una línea qué vendes.', true);
      f.elements['cla-otro'].focus();
      return;
    }
    avisar('Ficha válida. En la versión final esto guardaría los cambios y las ' +
      'secciones editadas quedarían en revisión.');
  });
})();
