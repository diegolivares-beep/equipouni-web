/* ============================================================
   VALIDADOR DE DATOS
   ------------------------------------------------------------
   Comprueba que los datos sean coherentes con la configuración:
   que cada comuna, tipo, rubro y estado que se nombra exista de verdad,
   y que se cumplan las reglas de la especificación.

   Por qué existe: en un sitio que lee sus datos de archivos editables a
   mano, un "04107" que no existe o un rubro mal escrito no produce
   ningún error. La oportunidad simplemente no aparece en un filtro y
   nadie se entera. Esto lo convierte en un aviso visible.

   Se ejecuta solo mientras EU.marca.esMaqueta sea verdadero.
   Al publicar de verdad deja de correr y no pesa nada.
   ============================================================ */

window.EU = window.EU || {};

EU.validar = (function () {
  'use strict';

  var OBLIGATORIOS = ['id', 'nombre', 'tipo', 'organizacion', 'estado', 'comuna',
    'region', 'fechaInicio', 'fechaTermino', 'cierrePostulacion', 'cupos',
    'descripcion', 'imagen', 'imagenAlt'];

  function esFecha(v) {
    return typeof v === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(v);
  }

  function aFecha(iso) {
    var p = String(iso).split('-');
    return new Date(+p[0], +p[1] - 1, +p[2]);
  }

  function oportunidades() {
    var problemas = [];
    var lista = (EU.datos && EU.datos.oportunidades) || [];
    var vistos = {};

    function error(id, texto) { problemas.push({ nivel: 'error', donde: id, texto: texto }); }
    function aviso(id, texto) { problemas.push({ nivel: 'aviso', donde: id, texto: texto }); }

    lista.forEach(function (o) {
      var id = o.id || '(sin id)';

      OBLIGATORIOS.forEach(function (campo) {
        if (o[campo] === undefined || o[campo] === null || o[campo] === '') {
          error(id, 'falta el campo obligatorio "' + campo + '"');
        }
      });

      if (vistos[o.id]) error(id, 'el id está repetido');
      vistos[o.id] = true;

      /* Territorio */
      var comuna = EU.territorio.comuna(o.comuna);
      if (!comuna) {
        error(id, 'la comuna "' + o.comuna + '" no existe en config/territorio.js');
      } else if (String(o.comuna).slice(0, 2) !== o.region) {
        error(id, 'la comuna ' + comuna.nombre + ' no pertenece a la región "' + o.region + '"');
      }
      if (!EU.territorio.region(o.region)) {
        error(id, 'la región "' + o.region + '" no existe en config/territorio.js');
      }

      /* Catálogo */
      if (!EU.catalogo.tipoOportunidad(o.tipo)) {
        error(id, 'el tipo "' + o.tipo + '" no existe en config/catalogo.js');
      }
      (o.rubrosBuscados || []).forEach(function (r) {
        if (!EU.catalogo.rubro(r)) error(id, 'el rubro buscado "' + r + '" no existe');
      });
      (o.subrubrosBuscados || []).forEach(function (s) {
        var sub = EU.catalogo.subrubro(s);
        if (!sub) { error(id, 'el subrubro buscado "' + s + '" no existe'); return; }
        var padre = null;
        EU.catalogo.rubros.forEach(function (r) {
          r.subrubros.forEach(function (x) { if (x.id === s) padre = r.id; });
        });
        if ((o.rubrosBuscados || []).indexOf(padre) === -1) {
          aviso(id, 'el subrubro "' + sub.nombre + '" pertenece al rubro "' + padre +
            '", que no está entre los rubros buscados');
        }
      });

      /* Estado */
      if (!EU.estados.oportunidadInfo[o.estado]) {
        error(id, 'el estado "' + o.estado + '" no existe en config/estados.js');
      }

      /* Fechas */
      ['fechaInicio', 'fechaTermino', 'cierrePostulacion'].forEach(function (c) {
        if (o[c] && !esFecha(o[c])) error(id, 'la fecha "' + c + '" no tiene formato AAAA-MM-DD');
      });
      if (esFecha(o.fechaInicio) && esFecha(o.fechaTermino) &&
          aFecha(o.fechaInicio) > aFecha(o.fechaTermino)) {
        error(id, 'la fecha de inicio es posterior a la de término');
      }
      if (esFecha(o.cierrePostulacion) && esFecha(o.fechaInicio) &&
          aFecha(o.cierrePostulacion) > aFecha(o.fechaInicio)) {
        error(id, 'el cierre de postulación es posterior al inicio del evento');
      }

      /* Cupos */
      if (typeof o.cuposDisponibles === 'number' && o.cuposDisponibles > o.cupos) {
        error(id, 'hay más cupos disponibles (' + o.cuposDisponibles + ') que cupos totales (' + o.cupos + ')');
      }

      /* Coherencia entre estado y plazo */
      if (o.estado === 'publicada' && esFecha(o.cierrePostulacion)) {
        var hoy = new Date(); hoy.setHours(0, 0, 0, 0);
        if (aFecha(o.cierrePostulacion) < hoy) {
          aviso(id, 'sigue marcada como publicada pero su plazo ya venció. ' +
            'Conviene pasarla a "cerrada".');
        }
      }

      /* Preguntas particulares */
      var idsPregunta = {};
      (o.preguntas || []).forEach(function (p) {
        if (!p.id) error(id, 'hay una pregunta sin id');
        if (idsPregunta[p.id]) error(id, 'el id de pregunta "' + p.id + '" está repetido');
        idsPregunta[p.id] = true;
        if (p.tipo !== 'una' && p.tipo !== 'varias') {
          error(id, 'la pregunta "' + p.id + '" usa el tipo "' + p.tipo +
            '". Solo se admite "una" o "varias".');
        }
        if (!p.alternativas || p.alternativas.length < 2) {
          error(id, 'la pregunta "' + p.id + '" tiene menos de dos alternativas');
        }
      });
      if (o.estado === 'publicada' && !idsPregunta.reemplazo) {
        aviso(id, 'no tiene la pregunta de reemplazo. Sin ella no se puede llenar ' +
          'un cupo liberado, porque el MVP no usa lista de espera.');
      }
    });

    return problemas;
  }

  function fichas() {
    var problemas = [];
    var lista = (EU.datos && EU.datos.emprendedores) || [];
    var vistos = {};

    function error(id, texto) { problemas.push({ nivel: 'error', donde: id, texto: texto }); }

    lista.forEach(function (f) {
      var id = f.id || '(ficha sin id)';
      if (vistos[f.id]) error(id, 'el id está repetido');
      vistos[f.id] = true;

      if (!EU.estados.fichaInfo[f.estado]) {
        error(id, 'el estado de ficha "' + f.estado + '" no existe');
      }
      ['representante', 'emprendimiento', 'clasificacion', 'productos', 'formalizacion'].forEach(function (s) {
        if (!f[s]) error(id, 'falta la sección "' + s + '"');
      });
      if (f.representante && !EU.territorio.comuna(f.representante.comuna)) {
        error(id, 'la comuna del representante no existe');
      }
      if (f.emprendimiento && !EU.territorio.comuna(f.emprendimiento.comuna)) {
        error(id, 'la comuna del emprendimiento no existe');
      }
      if (f.clasificacion) {
        var rubro = f.clasificacion.rubro;
        if (rubro !== EU.catalogo.OTRO && !EU.catalogo.rubro(rubro)) {
          error(id, 'el rubro "' + rubro + '" no existe en el catálogo');
        }
        var subs = EU.catalogo.subrubrosDe(f.clasificacion);
        subs.forEach(function (s) {
          if (!EU.catalogo.subrubro(s)) {
            error(id, 'el subrubro "' + s + '" no existe en el catálogo');
          } else {
            /* Un subrubro tiene que pertenecer al rubro principal elegido. */
            var pertenece = EU.catalogo.subrubros(rubro).some(function (x) { return x.id === s; });
            if (!pertenece) {
              error(id, 'el subrubro "' + s + '" no pertenece al rubro "' + rubro + '"');
            }
          }
        });
        var tope = EU.catalogo.MAX_SUBRUBROS;
        if (tope && subs.length > tope) {
          error(id, 'tiene ' + subs.length + ' subrubros y el máximo configurado es ' + tope);
        }
        if (rubro === EU.catalogo.OTRO && !f.clasificacion.otroDetalle) {
          error(id, 'marcó "Otro" sin detallar qué vende');
        }
      }
    });
    return problemas;
  }

  function postulaciones() {
    var problemas = [];
    var lista = (EU.datos && EU.datos.postulaciones) || [];
    var vistos = {};
    var pares = {};

    function error(id, texto) { problemas.push({ nivel: 'error', donde: id, texto: texto }); }

    lista.forEach(function (p) {
      var id = p.id || '(postulación sin id)';
      if (vistos[p.id]) error(id, 'el id está repetido');
      vistos[p.id] = true;

      var o = null;
      (EU.datos.oportunidades || []).forEach(function (x) { if (x.id === p.oportunidad) o = x; });
      if (!o) error(id, 'la oportunidad "' + p.oportunidad + '" no existe');
      if (!EU.datos.emprendedor(p.emprendedor)) {
        error(id, 'el emprendedor "' + p.emprendedor + '" no existe');
      }
      if (!EU.estados.postulacionInfo[p.estado]) {
        error(id, 'el estado "' + p.estado + '" no existe');
      }

      /* Regla: un emprendimiento no postula dos veces a la misma oportunidad. */
      var par = p.emprendedor + '|' + p.oportunidad;
      if (pares[par]) error(id, 'hay dos postulaciones del mismo emprendimiento a "' + p.oportunidad + '"');
      pares[par] = true;

      /* El historial debe respetar las transiciones permitidas y terminar
         en el estado actual. */
      var h = p.historial || [];
      if (!h.length) {
        error(id, 'no tiene historial');
      } else {
        if (h[0].a !== 'postulado') error(id, 'el historial no parte en "postulado"');
        for (var i = 1; i < h.length; i++) {
          if (!EU.estados.puedeTransitar(h[i - 1].a, h[i].a)) {
            error(id, 'transición prohibida en el historial: ' + h[i - 1].a + ' a ' + h[i].a);
          }
        }
        if (h[h.length - 1].a !== p.estado) {
          error(id, 'el historial termina en "' + h[h.length - 1].a +
            '" pero el estado actual es "' + p.estado + '"');
        }
      }
      if (p.estado === 'renuncio' && !p.estadoAnterior) {
        error(id, '"renuncio" debe guardar el estado anterior');
      }

      /* Cada respuesta debe corresponder a una pregunta de la oportunidad. */
      if (o) {
        var idsPregunta = {};
        (o.preguntas || []).forEach(function (q) { idsPregunta[q.id] = q; });
        Object.keys(p.respuestas || {}).forEach(function (rid) {
          if (!idsPregunta[rid]) {
            error(id, 'responde una pregunta "' + rid + '" que la oportunidad no tiene');
          }
        });
      }
    });
    return problemas;
  }

  function todo() {
    var problemas = oportunidades().concat(fichas()).concat(postulaciones());

    /* Configuración */
    if (!EU.marca || !EU.marca.nombre) {
      problemas.push({ nivel: 'error', donde: 'config/marca.js', texto: 'falta el nombre de la marca' });
    }
    if (EU.territorio.regionesActivas().length === 0) {
      problemas.push({ nivel: 'error', donde: 'config/marca.js',
        texto: 'territorioActivo no coincide con ninguna región de territorio.js' });
    }

    /* Catálogo: subrubros sin tipos declarados */
    EU.catalogo.rubros.forEach(function (r) {
      r.subrubros.forEach(function (s) {
        if (!s.tipos || !s.tipos.length) {
          problemas.push({ nivel: 'aviso', donde: 'catálogo: ' + s.nombre,
            texto: 'no tiene tipos de producto declarados' });
        }
      });
    });

    return problemas;
  }

  /* Al cargar, deja el resultado en consola. Si hay errores, los canta. */
  function auto() {
    if (!EU.marca || !EU.marca.esMaqueta) return;
    var p = todo();
    var errores = p.filter(function (x) { return x.nivel === 'error'; });
    if (errores.length) {
      console.error('Validación de datos: ' + errores.length + ' error(es).');
      errores.forEach(function (x) { console.error('  ' + x.donde + ': ' + x.texto); });
    } else {
      console.info('Validación de datos: sin errores.');
    }
  }

  return { oportunidades: oportunidades, fichas: fichas,
    postulaciones: postulaciones, todo: todo, auto: auto };
})();

EU.validar.auto();
