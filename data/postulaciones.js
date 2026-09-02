/* ============================================================
   POSTULACIONES (DATOS DE EJEMPLO)
   ------------------------------------------------------------
   Cada postulación vincula un emprendedor con una oportunidad y
   guarda las respuestas a las preguntas particulares de esa
   oportunidad, tal como exige la especificación: la postulación
   queda amarrada a lo que se respondió en ese momento.

   El historial registra cada cambio de estado con fecha, y para
   "renuncio" el estado anterior, que la especificación obliga a
   conservar.

   El clúster de coincidencia NO se guarda aquí: se calcula en
   assets/js/clusters.js a partir de la ficha y del perfil buscado.
   Guardarlo sería congelar un cálculo que depende de datos vivos.
   ============================================================ */

window.EU = window.EU || {};
EU.datos = EU.datos || {};

EU.datos.postulaciones = [

  /* ---- Del emprendedor demo (Telar Bruma) ---- */
  {
    id: 'post-001',
    oportunidad: 'costanera-primavera-2026',
    emprendedor: 'emp-demo',
    fecha: '2026-08-28',
    estado: 'postulado',
    respuestas: { dias: ['Sábado 26', 'Domingo 27'], toldo: 'Sí, propio', reemplazo: 'Sí' },
    historial: [{ fecha: '2026-08-28', a: 'postulado' }]
  },
  {
    id: 'post-002',
    oportunidad: 'feria-del-valle-vicuna-2026',
    emprendedor: 'emp-demo',
    fecha: '2026-08-30',
    estado: 'seleccionado',
    respuestas: { origen: 'Otra provincia de la región', reemplazo: 'Sí' },
    historial: [
      { fecha: '2026-08-30', a: 'postulado' },
      { fecha: '2026-09-01', a: 'seleccionado' }
    ]
  },
  {
    id: 'post-003',
    oportunidad: 'feria-invierno-andacollo-2026',
    emprendedor: 'emp-demo',
    fecha: '2026-08-05',
    estado: 'confirmado',
    respuestas: {},
    historial: [
      { fecha: '2026-08-05', a: 'postulado' },
      { fecha: '2026-08-16', a: 'seleccionado' },
      { fecha: '2026-08-19', a: 'confirmado' }
    ]
  },

  /* ---- De otros emprendedores, para el panel administrativo ---- */
  {
    id: 'post-010',
    oportunidad: 'costanera-primavera-2026',
    emprendedor: 'emp-greda-viva',
    fecha: '2026-08-25',
    estado: 'seleccionado',
    respuestas: { dias: ['Sábado 26', 'Domingo 27', 'Lunes 28'], toldo: 'Sí, propio', reemplazo: 'Sí' },
    historial: [
      { fecha: '2026-08-25', a: 'postulado' },
      { fecha: '2026-09-01', a: 'seleccionado' }
    ]
  },
  {
    id: 'post-011',
    oportunidad: 'costanera-primavera-2026',
    emprendedor: 'emp-hilaria',
    fecha: '2026-08-26',
    estado: 'postulado',
    respuestas: { dias: ['Sábado 26'], toldo: 'Lo arriendo', reemplazo: 'Sí' },
    historial: [{ fecha: '2026-08-26', a: 'postulado' }]
  },
  {
    id: 'post-012',
    oportunidad: 'costanera-primavera-2026',
    emprendedor: 'emp-verde-menta',
    fecha: '2026-08-27',
    estado: 'postulado',
    respuestas: { dias: ['Domingo 27', 'Lunes 28'], toldo: 'No tengo', reemplazo: 'No' },
    historial: [{ fecha: '2026-08-27', a: 'postulado' }]
  },
  {
    id: 'post-013',
    oportunidad: 'costanera-primavera-2026',
    emprendedor: 'emp-dulce-tinaja',
    fecha: '2026-08-29',
    estado: 'postulado',
    respuestas: { dias: ['Sábado 26', 'Domingo 27'], toldo: 'Sí, propio', reemplazo: 'Sí' },
    historial: [{ fecha: '2026-08-29', a: 'postulado' }]
  },
  {
    id: 'post-014',
    oportunidad: 'costanera-primavera-2026',
    emprendedor: 'emp-fotogenia',
    fecha: '2026-08-30',
    estado: 'postulado',
    respuestas: { dias: ['Sábado 26'], toldo: 'No tengo', reemplazo: 'Sí' },
    historial: [{ fecha: '2026-08-30', a: 'postulado' }]
  },
  {
    id: 'post-015',
    oportunidad: 'costanera-primavera-2026',
    emprendedor: 'emp-miel-choapa',
    fecha: '2026-08-31',
    estado: 'postulado',
    respuestas: { dias: ['Lunes 28'], toldo: 'Sí, propio', reemplazo: 'No' },
    historial: [{ fecha: '2026-08-31', a: 'postulado' }]
  },
  {
    id: 'post-016',
    oportunidad: 'costanera-primavera-2026',
    emprendedor: 'emp-cardumen-cuero',
    fecha: '2026-08-24',
    estado: 'renuncio',
    estadoAnterior: 'seleccionado',
    respuestas: { dias: ['Sábado 26', 'Domingo 27'], toldo: 'Sí, propio', reemplazo: 'No' },
    historial: [
      { fecha: '2026-08-24', a: 'postulado' },
      { fecha: '2026-08-30', a: 'seleccionado' },
      { fecha: '2026-09-01', a: 'renuncio', desde: 'seleccionado' }
    ]
  },
  {
    id: 'post-017',
    oportunidad: 'costanera-primavera-2026',
    emprendedor: 'emp-jabones-faro',
    fecha: '2026-08-23',
    estado: 'confirmado',
    respuestas: { dias: ['Sábado 26', 'Domingo 27', 'Lunes 28'], toldo: 'Sí, propio', reemplazo: 'Sí' },
    historial: [
      { fecha: '2026-08-23', a: 'postulado' },
      { fecha: '2026-08-30', a: 'seleccionado' },
      { fecha: '2026-09-02', a: 'confirmado' }
    ]
  },

  /* Otras oportunidades, para que el panel no muestre una sola */
  {
    id: 'post-020',
    oportunidad: 'mercado-barrio-ingles-2026',
    emprendedor: 'emp-dulce-tinaja',
    fecha: '2026-08-30',
    estado: 'seleccionado',
    respuestas: { dias: ['Jueves 17', 'Viernes 18', 'Sábado 19'], corriente: 'No', reemplazo: 'Sí' },
    historial: [
      { fecha: '2026-08-30', a: 'postulado' },
      { fecha: '2026-09-01', a: 'seleccionado' }
    ]
  },
  {
    id: 'post-021',
    oportunidad: 'mercado-barrio-ingles-2026',
    emprendedor: 'emp-cafe-peumo',
    fecha: '2026-09-01',
    estado: 'postulado',
    respuestas: { dias: ['Sábado 19'], corriente: 'Sí', reemplazo: 'Sí' },
    historial: [{ fecha: '2026-09-01', a: 'postulado' }]
  },
  {
    id: 'post-022',
    oportunidad: 'feria-saludable-companias-2026',
    emprendedor: 'emp-jabones-faro',
    fecha: '2026-09-01',
    estado: 'postulado',
    respuestas: { etiquetado: 'Sí, todos', reemplazo: 'Sí' },
    historial: [{ fecha: '2026-09-01', a: 'postulado' }]
  }
];

/* Consultas */

EU.datos.postulacionesDe = function (idEmprendedor) {
  return EU.datos.postulaciones.filter(function (p) {
    return p.emprendedor === idEmprendedor;
  });
};

EU.datos.postulacionesA = function (idOportunidad) {
  return EU.datos.postulaciones.filter(function (p) {
    return p.oportunidad === idOportunidad;
  });
};

EU.datos.postulacion = function (id) {
  var r = null;
  EU.datos.postulaciones.forEach(function (p) { if (p.id === id) r = p; });
  return r;
};

EU.datos.yaPostulo = function (idEmprendedor, idOportunidad) {
  return EU.datos.postulaciones.some(function (p) {
    return p.emprendedor === idEmprendedor && p.oportunidad === idOportunidad;
  });
};
