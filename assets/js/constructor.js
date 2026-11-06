/* ============================================================
   CREAR O EDITAR UNA OPORTUNIDAD (5 bloques + constructor de preguntas)
   ------------------------------------------------------------
   Los cinco bloques de la especificación: información visible,
   condiciones, perfil buscado, formulario particular y control interno.

   El constructor de preguntas implementa lo que la especificación
   permite y nada más: preguntas de "una" o "varias" alternativas,
   todas obligatorias, con agregar, duplicar, eliminar y reordenar,
   y la marca de filtro administrativo.
   ============================================================ */

EU.alEstarListo(function () {
  'use strict';

  var esc = EU.util.esc;
  var idExistente = EU.util.parametro('id');
  var original = idExistente ? EU.repo.oportunidades.obtener(idExistente) : null;

  /* Copia de trabajo de las preguntas: el constructor edita esto. */
  var preguntas = original
    ? JSON.parse(JSON.stringify(original.preguntas || []))
    : [{ id: 'reemplazo',
         texto: 'Si no queda seleccionado, ¿acepta que lo contactemos si se libera un cupo?',
         tipo: 'una', alternativas: ['Sí', 'No'], esFiltroInterno: true }];

  document.getElementById('titulo-pagina').textContent = original
    ? 'Editar: ' + original.nombre
    : 'Crear una oportunidad';

  var f = document.getElementById('form-oportunidad');

  /* ---------- Bloque 1 y 2: llenar selects y valores ---------- */

  var selTipo = f.elements.tipo;
  EU.catalogo.tiposOportunidad.forEach(function (t) {
    var op = document.createElement('option');
    op.value = t.id; op.textContent = t.nombre;
    selTipo.appendChild(op);
  });

  var selComuna = f.elements.comuna;
  EU.territorio.comunasActivas().forEach(function (c) {
    var op = document.createElement('option');
    op.value = c.codigo; op.textContent = c.nombre;
    selComuna.appendChild(op);
  });

  /* EL ESTADO LO DECIDEN LOS BOTONES, NO UN SELECTOR.
     Hasta el 6-nov había un selector con los cinco estados y, abajo,
     cuatro botones que le escribían encima su propio estado antes de
     guardar. Elegir "Cancelada" en la lista y apretar el botón grande
     dejaba la oportunidad publicada: le pasó al cliente en la reunión
     del 2-nov. Además el campo de fecha solo aparecía al cambiar el
     selector, así que "Programar" decía que faltaba una fecha que no
     estaba a la vista. Ahora el estado actual solo se muestra, y cada
     botón dice exactamente lo que hace. */
  function pintarEstadoActual(estado) {
    var zona = document.getElementById('estado-actual');
    if (!zona) return;
    var info = EU.estados.oportunidadInfo[estado];
    zona.innerHTML = info
      ? 'Estado actual: <strong>' + esc(info.etiqueta) + '</strong>. ' + esc(info.ayuda || '')
      : 'Todavía no está guardada.';
  }

  /* ---------- Bloque 3: perfil buscado con casillas dependientes ---------- */

  var zonaRubros = document.getElementById('zona-rubros');
  var zonaSubrubros = document.getElementById('zona-subrubros');

  zonaRubros.innerHTML = EU.catalogo.rubros.map(function (r) {
    return '<label class="casilla"><input type="checkbox" name="rubros" value="' +
      r.id + '"><span>' + esc(r.nombre) + '</span></label>';
  }).join('');

  function pintarSubrubros() {
    var marcados = Array.prototype.map.call(
      f.querySelectorAll('[name="rubros"]:checked'),
      function (c) { return c.value; });
    var previos = Array.prototype.map.call(
      f.querySelectorAll('[name="subrubros"]:checked'),
      function (c) { return c.value; });

    if (!marcados.length) {
      zonaSubrubros.innerHTML = '<p class="pista">Sin rubros marcados, la oportunidad ' +
        'queda abierta a todos. Marca rubros para poder priorizar subrubros.</p>';
      return;
    }
    zonaSubrubros.innerHTML = '<p class="pista" style="margin-bottom:.5rem">Subrubros ' +
      'a priorizar (opcional). Solo aparecen los de los rubros marcados:</p>' +
      marcados.map(function (idRubro) {
        var r = EU.catalogo.rubro(idRubro);
        return r.subrubros.map(function (s) {
          var con = previos.indexOf(s.id) !== -1 ? ' checked' : '';
          return '<label class="casilla"><input type="checkbox" name="subrubros" value="' +
            s.id + '"' + con + '><span>' + esc(s.nombre) +
            ' <small style="color:var(--tinta-2)">(' + esc(r.nombre) + ')</small></span></label>';
        }).join('');
      }).join('');
  }
  zonaRubros.addEventListener('change', pintarSubrubros);

  /* ---------- Bloque 4: constructor de preguntas ---------- */

  var zonaPreguntas = document.getElementById('zona-preguntas');

  function pintarPreguntas() {
    if (!preguntas.length) {
      zonaPreguntas.innerHTML = '<p class="pista">Sin preguntas particulares. ' +
        'Los postulantes solo confirman su ficha.</p>';
      return;
    }
    zonaPreguntas.innerHTML = preguntas.map(function (q, i) {
      var alternativas = (q.alternativas || []).map(function (alt, j) {
        return '<div class="constructor-alternativa">' +
          '<input type="text" value="' + esc(alt) + '" data-alt="' + i + ':' + j +
            '" aria-label="Alternativa ' + (j + 1) + '">' +
          '<button type="button" class="enlace-boton" data-quitar-alt="' + i + ':' + j +
            '">Quitar</button>' +
        '</div>';
      }).join('');

      return '<fieldset class="constructor-pregunta">' +
        '<legend>Pregunta ' + (i + 1) + (q.esFiltroInterno ? ' (filtro administrativo)' : '') + '</legend>' +
        '<div class="campo">' +
          '<input type="text" value="' + esc(q.texto) + '" data-texto="' + i +
            '" aria-label="Texto de la pregunta ' + (i + 1) + '">' +
        '</div>' +
        '<div class="campo campo--fila">' +
          '<label style="font-size:.85rem">Tipo de respuesta ' +
            '<select data-tipo="' + i + '">' +
              '<option value="una"' + (q.tipo === 'una' ? ' selected' : '') + '>Una opción</option>' +
              '<option value="varias"' + (q.tipo === 'varias' ? ' selected' : '') + '>Varias opciones</option>' +
            '</select></label>' +
          '<label class="casilla" style="margin:0"><input type="checkbox" data-filtro="' + i + '"' +
            (q.esFiltroInterno ? ' checked' : '') + '><span>Usar como filtro administrativo</span></label>' +
        '</div>' +
        alternativas +
        '<p class="acciones" style="margin-top:.6rem">' +
          '<button type="button" class="enlace-boton" data-agregar-alt="' + i + '">Agregar alternativa</button>' +
          '<button type="button" class="enlace-boton" data-duplicar="' + i + '">Duplicar</button>' +
          (i > 0 ? '<button type="button" class="enlace-boton" data-subir="' + i + '">Subir</button>' : '') +
          (i < preguntas.length - 1 ? '<button type="button" class="enlace-boton" data-bajar="' + i + '">Bajar</button>' : '') +
          '<button type="button" class="enlace-boton" data-eliminar="' + i + '">Eliminar</button>' +
        '</p>' +
      '</fieldset>';
    }).join('');
  }

  /* Un solo listener delegado para todo el constructor. */
  zonaPreguntas.addEventListener('click', function (e) {
    var b = e.target;
    function idx(attr) { return parseInt(b.getAttribute(attr), 10); }

    if (b.hasAttribute('data-agregar-alt')) {
      preguntas[idx('data-agregar-alt')].alternativas.push('');
    } else if (b.hasAttribute('data-quitar-alt')) {
      var par = b.getAttribute('data-quitar-alt').split(':');
      preguntas[+par[0]].alternativas.splice(+par[1], 1);
    } else if (b.hasAttribute('data-duplicar')) {
      var i = idx('data-duplicar');
      var copia = JSON.parse(JSON.stringify(preguntas[i]));
      copia.id = copia.id + '-copia';
      copia.esFiltroInterno = false;
      preguntas.splice(i + 1, 0, copia);
    } else if (b.hasAttribute('data-subir')) {
      var s = idx('data-subir');
      preguntas.splice(s - 1, 0, preguntas.splice(s, 1)[0]);
    } else if (b.hasAttribute('data-bajar')) {
      var j = idx('data-bajar');
      preguntas.splice(j + 1, 0, preguntas.splice(j, 1)[0]);
    } else if (b.hasAttribute('data-eliminar')) {
      preguntas.splice(idx('data-eliminar'), 1);
    } else {
      return;
    }
    pintarPreguntas();
  alCambiarEstado();
  });

  /* Ediciones de texto y tipo se recogen al vuelo. */
  zonaPreguntas.addEventListener('input', function (e) {
    var el = e.target;
    if (el.hasAttribute('data-texto')) {
      preguntas[+el.getAttribute('data-texto')].texto = el.value;
    } else if (el.hasAttribute('data-alt')) {
      var par = el.getAttribute('data-alt').split(':');
      preguntas[+par[0]].alternativas[+par[1]] = el.value;
    }
  });
  zonaPreguntas.addEventListener('change', function (e) {
    var el = e.target;
    if (el.hasAttribute('data-tipo')) {
      preguntas[+el.getAttribute('data-tipo')].tipo = el.value;
    } else if (el.hasAttribute('data-filtro')) {
      preguntas[+el.getAttribute('data-filtro')].esFiltroInterno = el.checked;
    }
  });

  document.getElementById('agregar-pregunta').addEventListener('click', function () {
    preguntas.push({ id: 'pregunta-' + (preguntas.length + 1), texto: '',
      tipo: 'una', alternativas: ['', ''], esFiltroInterno: false });
    pintarPreguntas();
  });

  /* ---------- Cargar valores si es edición ---------- */

  if (original) {
    f.elements.nombre.value = original.nombre;
    f.elements.organizacion.value = original.organizacion;
    f.elements.tipo.value = original.tipo;
    f.elements.comuna.value = original.comuna;
    f.elements.direccion.value = original.direccion;
    f.elements.descripcion.value = original.descripcion;
    f.elements.fechaInicio.value = original.fechaInicio;
    f.elements.fechaTermino.value = original.fechaTermino;
    f.elements.horario.value = original.horario || '';
    f.elements.cupos.value = original.cupos;
    f.elements.valor.value = original.valor;
    f.elements.cierrePostulacion.value = original.cierrePostulacion;
    f.elements.lugar.value = original.lugar || '';
    f.elements.modalidad.value = original.modalidad || 'presencial';
    f.elements.queIncluye.value = (original.queIncluye || []).join('\n');
    f.elements.queNoIncluye.value = (original.queNoIncluye || []).join('\n');
    f.elements.requisitos.value = (original.requisitos || []).join('\n');
    f.elements.imagenAlt.value = original.imagenAlt || '';
    f.elements.plazoPago.value = original.plazoPago || '';
    f.elements.datosTransferencia.value = original.datosTransferencia || '';
    f.elements.asistencia.value = original.asistencia || '';
    f.elements.cancelacion.value = original.cancelacion || '';
    f.elements.motivoCancelacion.value = original.motivoCancelacion || '';
    f.elements.estado.value = original.estado;
    if (f.elements.fechaPublicacion) f.elements.fechaPublicacion.value = original.fechaPublicacion || '';
    f.elements.responsable.value = original.responsable || '';
    (original.rubrosBuscados || []).forEach(function (r) {
      var c = f.querySelector('[name="rubros"][value="' + r + '"]');
      if (c) c.checked = true;
    });
    pintarSubrubros();
    (original.subrubrosBuscados || []).forEach(function (s) {
      var c = f.querySelector('[name="subrubros"][value="' + s + '"]');
      if (c) c.checked = true;
    });
    pintarEstadoActual(original.estado);
  } else {
    pintarSubrubros();
    pintarEstadoActual('');
  }
  pintarPreguntas();

  /* ---------- Guardar ---------- */

  var mensaje = document.getElementById('mensaje-form');

  /* Las reglas antes de guardar, para TODOS los botones. Hasta el 6-nov
     vivían dentro del "submit" del formulario, que ningún botón disparaba:
     se podía publicar una feria que terminaba antes de empezar, o con el
     cierre de postulación después del evento. */
  function validar() {
    if (!f.checkValidity()) { f.reportValidity(); return false; }
    var errores = [];
    if (f.elements.fechaInicio.value > f.elements.fechaTermino.value) {
      errores.push('La fecha de inicio es posterior a la de término.');
    }
    if (f.elements.cierrePostulacion.value > f.elements.fechaInicio.value) {
      errores.push('El cierre de postulación es posterior al inicio del evento.');
    }
    preguntas.forEach(function (q, i) {
      if (!q.texto.trim()) errores.push('La pregunta ' + (i + 1) + ' no tiene texto.');
      var llenas = q.alternativas.filter(function (a) { return a.trim(); });
      if (llenas.length < 2) errores.push('La pregunta ' + (i + 1) + ' necesita al menos dos alternativas.');
    });
    if (errores.length) {
      mensaje.textContent = errores.join(' ');
      mensaje.className = 'mensaje-form mensaje-form--error';
      return false;
    }
    return true;
  }

  /* Apretar Enter en un campo no publica nada por accidente: se guarda
     solo con los botones de abajo, que dicen qué hacen. */
  f.addEventListener('submit', function (e) { e.preventDefault(); });

  /* ---------- Guardar contra el backend ---------- */

  function comoLineas(texto) {
    return (texto || '').split('\n').map(function (l) { return l.trim(); })
      .filter(function (l) { return l; });
  }

  function recoger(estado) {
    return {
      nombre: f.elements.nombre.value.trim(),
      organizacion: f.elements.organizacion.value.trim(),
      tipo: f.elements.tipo.value,
      estado: estado,
      fechaPublicacion: f.elements.fechaPublicacion ? f.elements.fechaPublicacion.value : '',
      region: (f.elements.comuna.value || '').slice(0, 2),
      comuna: f.elements.comuna.value,
      direccion: f.elements.direccion.value.trim(),
      /* El lugar es su propio campo, no una copia de la dirección: antes
         se pisaba con ella y "Plaza de Armas" se convertía en la calle. */
      lugar: f.elements.lugar.value.trim(),
      modalidad: f.elements.modalidad.value,
      descripcion: f.elements.descripcion.value.trim(),
      fechaInicio: f.elements.fechaInicio.value,
      fechaTermino: f.elements.fechaTermino.value,
      horario: f.elements.horario.value.trim(),
      cupos: Number(f.elements.cupos.value) || 0,
      /* Al crear, todos los cupos están libres. De ahí en adelante el
         número lo lleva el backend contando las postulaciones que ocupan
         lugar, así que acá no se toca: mandarlo lo dejaría viejo. */
      cuposDisponibles: original ? undefined : Number(f.elements.cupos.value) || 0,
      valor: Number(f.elements.valor.value) || 0,
      cierrePostulacion: f.elements.cierrePostulacion.value,
      queIncluye: comoLineas(f.elements.queIncluye.value),
      queNoIncluye: comoLineas(f.elements.queNoIncluye.value),
      requisitos: comoLineas(f.elements.requisitos.value),
      plazoPago: f.elements.plazoPago.value.trim(),
      datosTransferencia: f.elements.datosTransferencia.value.trim(),
      asistencia: f.elements.asistencia.value.trim(),
      cancelacion: f.elements.cancelacion.value.trim(),
      motivoCancelacion: f.elements.motivoCancelacion.value.trim(),
      rubrosBuscados: Array.prototype.map.call(
        f.querySelectorAll('[name="rubros"]:checked'), function (c) { return c.value; }),
      subrubrosBuscados: Array.prototype.map.call(
        f.querySelectorAll('[name="subrubros"]:checked'), function (c) { return c.value; }),
      imagenAlt: f.elements.imagenAlt.value.trim(),
      preguntas: preguntas.filter(function (q) { return q.texto.trim(); }),
      responsable: f.elements.responsable.value.trim(),
      orden: original ? original.orden : 0
    };
  }

  function guardar(estado) {
    if (estado === 'programada' && (!f.elements.fechaPublicacion || !f.elements.fechaPublicacion.value)) {
      mensaje.className = 'mensaje-form mensaje-form--error';
      mensaje.textContent = 'Para programar hay que indicar la fecha de publicación.';
      return;
    }
    var cuerpo = EU.modelo.oportunidadHaciaBase(recoger(estado));
    mensaje.className = 'mensaje-form';
    mensaje.textContent = 'Guardando…';

    var accion = original
      ? EU.api.actualizar('oportunidades', original.id, cuerpo)
      : EU.api.crear('oportunidades', cuerpo);

    accion.then(function (r) {
      return subirImagen(r.id);
    }).then(function () {
      var etiqueta = EU.estados.oportunidadInfo[estado].etiqueta.toLowerCase();
      location.href = 'admin-oportunidades.html?guardada=' + encodeURIComponent(etiqueta);
    }).catch(function (err) {
      mensaje.className = 'mensaje-form mensaje-form--error';
      mensaje.textContent = err.message || 'No se pudo guardar.';
    });
  }

  /* ---------- Imagen de la oportunidad ----------
     El archivo va aparte del resto porque una subida necesita FormData
     y el resto del cuerpo viaja como JSON. Se manda después de guardar,
     cuando el registro ya tiene identificador. */

  var entradaImagen = document.getElementById('o-imagen');
  var porSubirImagen = null;

  if (entradaImagen) {
    entradaImagen.addEventListener('change', function () {
      porSubirImagen = entradaImagen.files[0] || null;
      var aviso = document.getElementById('aviso-imagen');
      if (!aviso) return;
      if (!porSubirImagen) { aviso.textContent = ''; return; }
      if (porSubirImagen.size > 5 * 1024 * 1024) {
        aviso.className = 'mensaje-form mensaje-form--error';
        aviso.textContent = 'Esa imagen pesa más de 5 MB. Achícala antes de subirla.';
        porSubirImagen = null;
        entradaImagen.value = '';
        return;
      }
      aviso.className = 'mensaje-form';
      aviso.textContent = porSubirImagen.name + ' lista para subir al guardar.';
    });
  }

  function subirImagen(idOportunidad) {
    if (!porSubirImagen) return Promise.resolve();
    var fd = new FormData();
    fd.append('imagen', porSubirImagen);
    return fetch(EU.api.BASE + '/api/collections/oportunidades/records/' + idOportunidad, {
      method: 'PATCH',
      headers: { Authorization: EU.api.token() },
      body: fd
    }).then(function (r) {
      if (!r.ok) throw new Error('Se guardó la oportunidad, pero no se pudo subir la imagen.');
      porSubirImagen = null;
    });
  }

  /* Al editar, mostrar la imagen que ya tiene para saber si hace falta
     cambiarla. */
  if (original && original.imagen) {
    var zona = document.getElementById('imagen-actual');
    if (zona) {
      zona.innerHTML = '<p class="pista" style="margin:.5rem 0 .3rem">Imagen actual:</p>' +
        '<img src="' + EU.util.esc(EU.util.urlImagen(original, '360x270')) +
        '" alt="' + EU.util.esc(original.imagenAlt || '') +
        '" width="180" height="135" style="height:auto;border-radius:6px">';
    }
  }

  /* Botones de publicación: lo que pidió el cliente, un botón por acción
     en vez de tener que entender un selector de estados.

     El texto depende de si se crea o se edita (pedido del cliente el
     2-nov): "Publicar ahora" solo al crear; al editar, "Publicar
     cambios". Y "Ocultar del tablero" en vez de "Ocultar del sitio",
     porque desde el 6-nov una oculta sí se abre con su enlace. */
  var barra = document.getElementById('acciones-publicacion');
  if (barra) {
    var BOTONES = original
      ? (original.estado === 'cancelada'
          ? [['cancelada', 'Guardar cambios', 'boton--grande'],
             ['publicada', 'Volver a publicar', 'boton--linea']]
          : [['publicada', 'Publicar cambios', 'boton--grande'],
             ['programada', 'Programar', 'boton--linea'],
             ['borrador', 'Guardar como borrador', 'boton--linea'],
             ['oculta', 'Ocultar del tablero', 'boton--linea']])
      : [['publicada', 'Publicar ahora', 'boton--grande'],
         ['programada', 'Programar', 'boton--linea'],
         ['borrador', 'Guardar como borrador', 'boton--linea']];
    barra.innerHTML = BOTONES.map(function (b) {
      return '<button type="button" class="boton ' + b[2] + '" data-publicar="' + b[0] + '">' +
        esc(b[1]) + '</button>';
    }).join('');

    barra.addEventListener('click', function (e) {
      var b = e.target.closest('[data-publicar]');
      if (!b) return;
      e.preventDefault();
      if (!validar()) return;
      var estado = b.getAttribute('data-publicar');
      f.elements.estado.value = estado;
      guardar(estado);
    });
  }

  /* SUSPENDER EL EVENTO.
     Antes no había forma de hacerlo: ningún botón llegaba a "cancelada".
     Va aparte, con su motivo al lado, y pide confirmación diciendo a
     cuántas personas les va a llegar el correo, porque ese correo no se
     puede retirar. No pasa por validar(): suspender un evento nunca debe
     quedar bloqueado por un campo que no tiene nada que ver. */
  var zonaSuspender = document.getElementById('zona-suspender');
  if (zonaSuspender && original && ['publicada', 'oculta', 'programada'].indexOf(original.estado) !== -1) {
    zonaSuspender.hidden = false;
    document.getElementById('suspender-evento').addEventListener('click', function () {
      var motivo = f.elements.motivoCancelacion.value.trim();
      if (!motivo) {
        mensaje.className = 'mensaje-form mensaje-form--error';
        mensaje.textContent = 'Escribe por qué se suspende antes de confirmar: es lo que les llega por correo.';
        f.elements.motivoCancelacion.focus();
        return;
      }
      var avisados = EU.datos.postulacionesA(original.id).filter(function (p) {
        return p.estado === 'seleccionado' || p.estado === 'confirmado';
      }).length;
      var quienes = avisados
        ? 'Le llegará un correo con el motivo a ' + avisados +
          (avisados === 1 ? ' persona seleccionada o confirmada.' : ' personas seleccionadas o confirmadas.')
        : 'Todavía no hay nadie seleccionado ni confirmado, así que no sale ningún correo.';
      if (!window.confirm('Vas a suspender "' + original.nombre + '".\n\n' + quienes +
          '\n\nEl correo no se puede retirar después. ¿Suspender el evento?')) {
        return;
      }
      f.elements.estado.value = 'cancelada';
      guardar('cancelada');
    });
  }
});
