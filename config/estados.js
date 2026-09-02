/* ============================================================
   ESTADOS Y TRANSICIONES
   ------------------------------------------------------------
   Un solo lugar para los estados de ficha, oportunidad, postulación
   y clúster de coincidencia. Ninguna pantalla escribe un estado a mano
   como texto suelto: siempre se usa la constante.

   Por qué importa: la especificación define transiciones permitidas.
   Si los estados viven repartidos como texto por el código, tarde o
   temprano aparece un "Seleccionadó" o un "seleccionado " con espacio
   y el filtro deja de encontrarlo, sin ningún error visible.

   Reglas que vienen de la especificación:
   - La plataforma ordena y facilita; nunca decide sola quién participa.
   - Cambiar de estado y enviar correos son acciones separadas.
   - "Renunció" guarda la fecha y el estado anterior.
   - Si cambia un dato validado relevante de la ficha, esa sección
     vuelve a "pendiente" sin borrar el historial anterior.
   ============================================================ */

window.EU = window.EU || {};

EU.estados = {

  /* ---------- Ficha del emprendimiento ---------- */
  ficha: {
    INCOMPLETA:  'incompleta',
    PENDIENTE:   'pendiente',
    VALIDADA:    'validada',
    CORRECCION:  'correccion',
    SUSPENDIDA:  'suspendida'
  },

  fichaInfo: {
    incompleta: {
      etiqueta: 'Incompleta',
      descripcion: 'Faltan campos requeridos. No permite postular.',
      tono: 'neutro',
      permitePostular: false
    },
    pendiente: {
      etiqueta: 'Pendiente de validación',
      descripcion: 'Enviada a revisión de EquipoUni.',
      tono: 'espera',
      permitePostular: false
    },
    validada: {
      etiqueta: 'Validada',
      descripcion: 'Revisada y aprobada. Habilitada para postular.',
      tono: 'bueno',
      permitePostular: true
    },
    correccion: {
      etiqueta: 'Requiere corrección',
      descripcion: 'Hay observaciones que resolver antes de aprobarla.',
      tono: 'alerta',
      permitePostular: false
    },
    suspendida: {
      etiqueta: 'Suspendida',
      descripcion: 'Inhabilitada por EquipoUni.',
      tono: 'alerta',
      permitePostular: false
    }
  },

  /* ---------- Oportunidad ---------- */
  oportunidad: {
    BORRADOR:     'borrador',
    VISTA_PREVIA: 'vista_previa',
    PUBLICADA:    'publicada',
    CERRADA:      'cerrada',
    CANCELADA:    'cancelada'
  },

  oportunidadInfo: {
    borrador:     { etiqueta: 'Borrador',     publica: false, recibePostulaciones: false },
    vista_previa: { etiqueta: 'Vista previa', publica: false, recibePostulaciones: false },
    publicada:    { etiqueta: 'Publicada',    publica: true,  recibePostulaciones: true },
    cerrada:      { etiqueta: 'Cerrada',      publica: true,  recibePostulaciones: false },
    cancelada:    { etiqueta: 'Cancelada',    publica: true,  recibePostulaciones: false }
  },

  /* ---------- Postulación ---------- */
  postulacion: {
    POSTULADO:    'postulado',
    SELECCIONADO: 'seleccionado',
    CONFIRMADO:   'confirmado',
    RENUNCIO:     'renuncio'
  },

  postulacionInfo: {
    postulado: {
      etiqueta: 'Postulado',
      descripcion: 'Envió la postulación. Si sigue así al cerrar la selección, no quedó.',
      tono: 'espera'
    },
    seleccionado: {
      etiqueta: 'Seleccionado',
      descripcion: 'Recibió un cupo y las instrucciones para pagar.',
      tono: 'bueno'
    },
    confirmado: {
      etiqueta: 'Confirmado',
      descripcion: 'Pago recibido y validado por EquipoUni.',
      tono: 'bueno'
    },
    renuncio: {
      etiqueta: 'Renunció',
      descripcion: 'Desistió. Queda registrada la fecha y el estado anterior.',
      tono: 'neutro'
    }
  },

  /* Transiciones permitidas. Cualquier cambio fuera de esta tabla es
     un error de programación, no una opción del usuario. */
  transicionesPostulacion: {
    postulado:    ['seleccionado', 'renuncio'],
    seleccionado: ['confirmado', 'renuncio'],
    confirmado:   ['renuncio'],
    renuncio:     []
  },

  /* ---------- Clúster de coincidencia ----------
     Ordena a los postulantes; no los puntúa ni los selecciona. */
  cluster: {
    DIRECTA:        'directa',
    PARCIAL:        'parcial',
    COMPLEMENTARIO: 'complementario',
    REVISION:       'revision'
  },

  clusterInfo: {
    directa: {
      etiqueta: 'Coincidencia directa',
      descripcion: 'Cumple las condiciones y coincide con el rubro, subrubro o producto buscado.',
      orden: 1
    },
    parcial: {
      etiqueta: 'Coincidencia parcial',
      descripcion: 'Cumple lo básico, pero solo parte del perfil preferido.',
      orden: 2
    },
    complementario: {
      etiqueta: 'Perfil complementario',
      descripcion: 'Puede aportar variedad aunque no sea el foco principal.',
      orden: 3
    },
    revision: {
      etiqueta: 'Revisión',
      descripcion: 'Tiene "Otro", información pendiente o una condición que necesita análisis humano.',
      orden: 4
    }
  }
};

/* ---------- Funciones de consulta ---------- */

EU.estados.info = function (familia, valor) {
  var tabla = EU.estados[familia + 'Info'];
  return (tabla && tabla[valor]) || { etiqueta: valor, descripcion: '', tono: 'neutro' };
};

EU.estados.etiqueta = function (familia, valor) {
  return EU.estados.info(familia, valor).etiqueta;
};

EU.estados.puedeTransitar = function (desde, hacia) {
  var permitidas = EU.estados.transicionesPostulacion[desde] || [];
  return permitidas.indexOf(hacia) !== -1;
};

/* Una oportunidad recibe postulaciones solo si su estado lo permite
   Y sigue dentro del plazo. Las dos condiciones, nunca una sola. */
EU.estados.recibePostulaciones = function (oportunidad, hoy) {
  var info = EU.estados.oportunidadInfo[oportunidad.estado];
  if (!info || !info.recibePostulaciones) return false;
  var referencia = hoy || new Date();
  referencia.setHours(0, 0, 0, 0);
  var p = String(oportunidad.cierrePostulacion).split('-');
  var cierre = new Date(+p[0], +p[1] - 1, +p[2]);
  return cierre >= referencia;
};
