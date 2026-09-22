/* ============================================================
   FICHAS DE EMPRENDEDORES (DATOS DE EJEMPLO)
   ------------------------------------------------------------
   Personas y emprendimientos inventados. Los RUT son de fantasía.

   La forma de cada ficha sigue la especificación (campos que debe
   almacenar la ficha única): representante, emprendimiento,
   clasificación, productos, formalización y datos automáticos.

   'emp-demo' es la ficha con la que se navega el área privada de la
   maqueta, como si fuera la cuenta con sesión iniciada.

   Referencias cruzadas por código, nunca por nombre:
     comuna               -> config/territorio.js
     clasificacion.rubro  -> config/catalogo.js
     estado               -> config/estados.js (ficha)
   ============================================================ */

window.EU = window.EU || {};
EU.datos = EU.datos || {};

EU.datos.emprendedores = [
  {
    id: 'emp-demo',
    estado: 'validada',
    creada: '2026-07-15',
    actualizada: '2026-08-20',
    representante: {
      nombre: 'Carla Rojas Pizarro',
      rut: '12.345.678-5',
      correo: 'carla@ejemplo.cl',
      telefono: '+56 9 8765 4321',
      comuna: '04101',
      contactoPreferido: 'whatsapp'
    },
    emprendimiento: {
      nombre: 'Telar Bruma',
      comuna: '04101',
      anoInicio: 2022,
      descripcion: 'Mantas, cojines y bufandas tejidas a telar con lana de la zona, ' +
        'teñidas con tintes naturales del valle.',
      instagram: 'https://instagram.com/telarbruma.ejemplo',
      web: ''
    },
    clasificacion: {
      rubro: 'artesania',
      subrubro: 'telar-tejido',
      tipos: ['Telar', 'Fieltro'],
      otroDetalle: ''
    },
    productos: {
      fotos: ['feria-textil.jpg', 'feria-arte.jpg'],
      personaliza: true,
      detallePersonaliza: 'Colores y medidas a pedido, con dos semanas de anticipación.'
    },
    formalizacion: {
      inicioActividades: true,
      boleta: true,
      patente: false,
      resolucionSanitaria: false,
      personalidadJuridica: false
    },
    /* Observaciones del equipo revisor, por sección. Vacío = sin reparos. */
    observaciones: {}
  },

  {
    id: 'emp-greda-viva',
    estado: 'validada',
    creada: '2026-06-02',
    actualizada: '2026-08-10',
    representante: {
      nombre: 'Manuel Ardiles Cortés', rut: '11.222.333-4',
      correo: 'manuel@ejemplo.cl', telefono: '+56 9 1111 2222',
      comuna: '04301', contactoPreferido: 'correo'
    },
    emprendimiento: {
      nombre: 'Greda Viva', comuna: '04301', anoInicio: 2019,
      descripcion: 'Vajilla y macetas de greda torneadas a mano, con esmaltes sin plomo.',
      instagram: 'https://instagram.com/gredaviva.ejemplo', web: ''
    },
    clasificacion: { rubro: 'artesania', subrubro: 'ceramica', tipos: ['Vajilla', 'Macetas'], otroDetalle: '' },
    productos: { fotos: ['feria-greda.jpg'], personaliza: false, detallePersonaliza: '' },
    formalizacion: { inicioActividades: true, boleta: true, patente: true, resolucionSanitaria: false, personalidadJuridica: false },
    observaciones: {}
  },

  {
    id: 'emp-dulce-tinaja',
    estado: 'validada',
    creada: '2026-05-18',
    actualizada: '2026-07-30',
    representante: {
      nombre: 'Rosa Villalobos Marín', rut: '13.444.555-6',
      correo: 'rosa@ejemplo.cl', telefono: '+56 9 3333 4444',
      comuna: '04106', contactoPreferido: 'whatsapp'
    },
    emprendimiento: {
      nombre: 'Dulce Tinaja', comuna: '04106', anoInicio: 2020,
      descripcion: 'Mermeladas y conservas de fruta del valle de Elqui, en frascos reutilizables.',
      instagram: 'https://instagram.com/dulcetinaja.ejemplo', web: ''
    },
    clasificacion: { rubro: 'alimentos-bebidas', subrubro: 'conservas', tipos: ['Mermeladas', 'Miel'], otroDetalle: '' },
    productos: { fotos: ['feria-alimentos.jpg'], personaliza: false, detallePersonaliza: '' },
    formalizacion: { inicioActividades: true, boleta: true, patente: false, resolucionSanitaria: true, personalidadJuridica: false },
    observaciones: {}
  },

  {
    id: 'emp-cardumen-cuero',
    estado: 'validada',
    creada: '2026-04-25',
    actualizada: '2026-08-01',
    representante: {
      nombre: 'Diego Farías Soto', rut: '14.555.666-7',
      correo: 'dfarias@ejemplo.cl', telefono: '+56 9 5555 6666',
      comuna: '04102', contactoPreferido: 'whatsapp'
    },
    emprendimiento: {
      nombre: 'Cardumen Cuero', comuna: '04102', anoInicio: 2017,
      descripcion: 'Billeteras, cinturones y bolsos de cuero cosidos a mano.',
      instagram: 'https://instagram.com/cardumencuero.ejemplo', web: ''
    },
    clasificacion: { rubro: 'artesania', subrubro: 'cuero', tipos: ['Billeteras', 'Cinturones'], otroDetalle: '' },
    productos: { fotos: ['feria-joyas.jpg'], personaliza: true, detallePersonaliza: 'Grabado de iniciales.' },
    formalizacion: { inicioActividades: true, boleta: false, patente: false, resolucionSanitaria: false, personalidadJuridica: false },
    observaciones: {}
  },

  {
    id: 'emp-jabones-faro',
    estado: 'validada',
    creada: '2026-06-20',
    actualizada: '2026-08-15',
    representante: {
      nombre: 'Paula Ibacache León', rut: '15.666.777-8',
      correo: 'paula@ejemplo.cl', telefono: '+56 9 7777 8888',
      comuna: '04101', contactoPreferido: 'correo'
    },
    emprendimiento: {
      nombre: 'Jabones del Faro', comuna: '04101', anoInicio: 2023,
      descripcion: 'Jabones artesanales de caléndula, avena y algas, en barra y líquidos.',
      instagram: 'https://instagram.com/jabonesdelfaro.ejemplo', web: ''
    },
    clasificacion: { rubro: 'belleza-cuidado', subrubro: 'jabones-bano', tipos: ['Jabón artesanal', 'Exfoliantes'], otroDetalle: '' },
    productos: { fotos: ['feria-flores.jpg'], personaliza: false, detallePersonaliza: '' },
    formalizacion: { inicioActividades: true, boleta: true, patente: false, resolucionSanitaria: false, personalidadJuridica: false },
    observaciones: {}
  },

  {
    id: 'emp-hilaria',
    estado: 'validada',
    creada: '2026-07-01',
    actualizada: '2026-08-22',
    representante: {
      nombre: 'Hilda Araya Rivera', rut: '9.888.999-0',
      correo: 'hilda@ejemplo.cl', telefono: '+56 9 9999 0000',
      comuna: '04201', contactoPreferido: 'telefono'
    },
    emprendimiento: {
      nombre: 'Hilaria Tejidos', comuna: '04201', anoInicio: 2015,
      descripcion: 'Gorros, bufandas y ropa de guagua tejida a palillo y crochet.',
      instagram: '', web: ''
    },
    clasificacion: { rubro: 'artesania', subrubro: 'telar-tejido', tipos: ['Tejido a palillo o crochet'], otroDetalle: '' },
    productos: { fotos: ['feria-textil.jpg'], personaliza: true, detallePersonaliza: 'Tallas y colores a pedido.' },
    formalizacion: { inicioActividades: false, boleta: false, patente: false, resolucionSanitaria: false, personalidadJuridica: false },
    observaciones: {}
  },

  {
    id: 'emp-cafe-peumo',
    estado: 'pendiente',
    creada: '2026-08-28',
    actualizada: '2026-08-28',
    representante: {
      nombre: 'Andrés Peña Olguín', rut: '16.777.888-9',
      correo: 'andres@ejemplo.cl', telefono: '+56 9 2222 3333',
      comuna: '04102', contactoPreferido: 'whatsapp'
    },
    emprendimiento: {
      nombre: 'Café Peumo', comuna: '04102', anoInicio: 2024,
      descripcion: 'Café de grano tostado en Coquimbo, en bolsas de 250 g y venta preparada.',
      instagram: 'https://instagram.com/cafepeumo.ejemplo', web: ''
    },
    clasificacion: { rubro: 'alimentos-bebidas', subrubro: 'cafe-te', tipos: ['Café de grano', 'Café preparado'], otroDetalle: '' },
    productos: { fotos: ['feria-pan.jpg'], personaliza: false, detallePersonaliza: '' },
    formalizacion: { inicioActividades: true, boleta: true, patente: false, resolucionSanitaria: false, personalidadJuridica: false },
    observaciones: {}
  },

  {
    id: 'emp-fotogenia',
    estado: 'pendiente',
    creada: '2026-08-30',
    actualizada: '2026-08-30',
    representante: {
      nombre: 'Valentina Muñoz Godoy', rut: '17.888.999-K',
      correo: 'vale@ejemplo.cl', telefono: '+56 9 4444 5555',
      comuna: '04101', contactoPreferido: 'correo'
    },
    emprendimiento: {
      nombre: 'Fotogenia Sur', comuna: '04101', anoInicio: 2021,
      descripcion: 'Fotografía de productos y de eventos para emprendimientos.',
      instagram: 'https://instagram.com/fotogeniasur.ejemplo', web: ''
    },
    /* Marcó "Otro": queda en revisión humana según la regla del catálogo. */
    clasificacion: { rubro: 'otro', subrubro: '', tipos: [], otroDetalle: 'Fotografía comercial y cobertura de eventos' },
    productos: { fotos: ['feria-arte.jpg'], personaliza: false, detallePersonaliza: '' },
    formalizacion: { inicioActividades: true, boleta: true, patente: false, resolucionSanitaria: false, personalidadJuridica: false },
    observaciones: {}
  },

  {
    id: 'emp-verde-menta',
    estado: 'validada',
    creada: '2026-05-05',
    actualizada: '2026-07-18',
    representante: {
      nombre: 'Camila Tapia Guerrero', rut: '18.999.000-1',
      correo: 'camila@ejemplo.cl', telefono: '+56 9 6666 7777',
      comuna: '04101', contactoPreferido: 'whatsapp'
    },
    emprendimiento: {
      nombre: 'Verde Menta Deco', comuna: '04101', anoInicio: 2022,
      descripcion: 'Suculentas, plantas de interior y macramé para colgarlas.',
      instagram: 'https://instagram.com/verdementa.ejemplo', web: ''
    },
    clasificacion: { rubro: 'deco-hogar', subrubro: 'plantas', tipos: ['Suculentas', 'Plantas de interior'], otroDetalle: '' },
    productos: { fotos: ['feria-flores.jpg'], personaliza: false, detallePersonaliza: '' },
    formalizacion: { inicioActividades: false, boleta: false, patente: false, resolucionSanitaria: false, personalidadJuridica: false },
    observaciones: {}
  },

  {
    id: 'emp-miel-choapa',
    estado: 'correccion',
    creada: '2026-08-12',
    actualizada: '2026-08-25',
    representante: {
      nombre: 'Luis Olivares Bugueño', rut: '10.111.222-3',
      correo: 'luis@ejemplo.cl', telefono: '+56 9 8888 9999',
      comuna: '04204', contactoPreferido: 'telefono'
    },
    emprendimiento: {
      nombre: 'Miel del Choapa', comuna: '04204', anoInicio: 2018,
      descripcion: 'Miel de flora nativa del Choapa, en formatos de 250 g a 1 kg.',
      instagram: '', web: ''
    },
    clasificacion: { rubro: 'alimentos-bebidas', subrubro: 'conservas', tipos: ['Miel'], otroDetalle: '' },
    productos: { fotos: ['feria-alimentos.jpg'], personaliza: false, detallePersonaliza: '' },
    formalizacion: { inicioActividades: true, boleta: false, patente: false, resolucionSanitaria: false, personalidadJuridica: false },
    observaciones: {
      productos: 'Las fotografías no muestran el etiquetado. Sube una foto donde se lea la etiqueta.',
      formalizacion: 'La resolución sanitaria es exigible para envasar miel. Adjunta el documento o su comprobante en trámite.'
    }
  }
];

/* Consulta */
EU.datos.emprendedor = function (id) {
  var r = null;
  EU.datos.emprendedores.forEach(function (e) { if (e.id === id) r = e; });
  return r;
};
