/* ============================================================
   OPORTUNIDADES (DATOS DE EJEMPLO)
   ------------------------------------------------------------
   Ninguna de estas oportunidades es real. Sirven para construir y
   revisar las pantallas. Se reemplazan por las verdaderas antes de
   publicar.

   IMPORTANTE PARA EL DÍA DEL BACKEND:
   los nombres de campo de este archivo son los que debería tener la
   tabla de oportunidades. Cuando exista una API, se cambia de dónde
   vienen los datos y las pantallas no se tocan.

   Referencias cruzadas, todas por id o código, nunca por nombre:
     comuna  -> config/territorio.js
     tipo    -> config/catalogo.js (tiposOportunidad)
     rubros  -> config/catalogo.js (rubros)
     estado  -> config/estados.js (oportunidad)
   assets/js/validar-datos.js comprueba que estas referencias existan.
   ============================================================ */

window.EU = window.EU || {};

EU.datos = EU.datos || {};

EU.datos.oportunidades = [
  {
    id: 'mercado-barrio-ingles-2026',
    nombre: 'Mercado de Fiestas Patrias, Barrio Inglés',
    tipo: 'mercado',
    organizacion: 'Corporación Cultural Puerto Viejo',
    estado: 'publicada',

    /* Dónde */
    modalidad: 'presencial',
    region: '04',
    comuna: '04102',
    direccion: 'Calle Aldunate, entre Melgarejo y Pinto',
    lugar: 'Eje peatonal del Barrio Inglés',

    /* Cuándo */
    fechaInicio: '2026-09-17',
    fechaTermino: '2026-09-19',
    horario: '11:00 a 22:00',

    /* Condiciones */
    cupos: 30,
    cuposDisponibles: 6,
    valor: 25000,
    queIncluye: ['Espacio de 3x3 metros', 'Corriente eléctrica', 'Vigilancia nocturna'],
    queNoIncluye: ['Toldo', 'Mesón y sillas'],
    cierrePostulacion: '2026-09-05',
    plazoPago: '3 días corridos desde el aviso de selección',
    asistencia: 'Obligatoria los tres días completos.',
    cancelacion: 'Devolución del 50% si avisa con más de 7 días.',

    /* Perfil buscado */
    rubrosBuscados: ['alimentos', 'artesania'],
    subrubrosBuscados: ['comida-preparada', 'pasteleria', 'ceramica'],
    requisitos: [
      'Resolución sanitaria vigente para quienes vendan comida preparada.',
      'Toldo blanco de 3x3 con techo y laterales.'
    ],

    /* Presentación */
    imagen: 'feria-pan.jpg',
    imagenAlt: 'Puesto de feria con panes y productos de panadería sobre un mantel a cuadros',
    descripcion: 'Tres días de mercado en el eje peatonal de Aldunate, con música en ' +
      'vivo desde las 19:00 y un flujo alto de público por el fin de semana largo. ' +
      'Se prioriza cocinerías con resolución sanitaria al día.',

    /* Preguntas particulares de esta oportunidad.
       tipo admite solo "una" o "varias", según la especificación. */
    preguntas: [
      { id: 'dias', texto: '¿Qué días tiene disponibilidad?', tipo: 'varias',
        alternativas: ['Jueves 17', 'Viernes 18', 'Sábado 19'] },
      { id: 'corriente', texto: '¿Necesita corriente eléctrica?', tipo: 'una',
        alternativas: ['Sí', 'No'] },
      { id: 'reemplazo', texto: 'Si no queda seleccionado, ¿acepta que lo contactemos si se libera un cupo?',
        tipo: 'una', alternativas: ['Sí', 'No'], esFiltroInterno: true }
    ],

    /* Control interno */
    responsable: 'Coordinación EquipoUni',
    orden: 1
  },

  {
    id: 'costanera-primavera-2026',
    nombre: 'Feria Costanera de Primavera',
    tipo: 'feria',
    organizacion: 'Junta de Vecinos Sector Faro',
    estado: 'publicada',
    modalidad: 'presencial',
    region: '04',
    comuna: '04101',
    direccion: 'Avenida del Mar, frente al Faro Monumental',
    lugar: 'Explanada costera',
    fechaInicio: '2026-09-26',
    fechaTermino: '2026-09-28',
    horario: '12:00 a 21:00',
    cupos: 40,
    cuposDisponibles: 14,
    valor: 18000,
    queIncluye: ['Espacio de 3x3 metros', 'Baños químicos'],
    queNoIncluye: ['Toldo', 'Corriente eléctrica'],
    cierrePostulacion: '2026-09-12',
    plazoPago: '5 días corridos desde el aviso de selección',
    asistencia: 'Mínimo dos de los tres días.',
    cancelacion: 'Sin devolución dentro de los 5 días previos.',
    rubrosBuscados: ['artesania', 'deco-hogar', 'diseno-moda'],
    subrubrosBuscados: ['joyeria', 'textil-artesanal', 'velas', 'accesorios-moda'],
    requisitos: ['Toldo blanco de 3x3 exigido por normativa municipal.'],
    imagen: 'feria-arte.jpg',
    imagenAlt: 'Dos personas mirando cuadros y artesanías bajo toldos blancos en una feria al aire libre',
    descripcion: 'Feria al aire libre en la costanera, con alto flujo de visitantes ' +
      'los fines de semana de primavera. El municipio exige toldo blanco de 3x3 con ' +
      'techo, laterales y cierre frontal.',
    preguntas: [
      { id: 'dias', texto: '¿Qué días puede asistir?', tipo: 'varias',
        alternativas: ['Sábado 26', 'Domingo 27', 'Lunes 28'] },
      { id: 'toldo', texto: '¿Cuenta con toldo blanco de 3x3?', tipo: 'una',
        alternativas: ['Sí, propio', 'Lo arriendo', 'No tengo'] },
      { id: 'reemplazo', texto: 'Si no queda seleccionado, ¿acepta que lo contactemos si se libera un cupo?',
        tipo: 'una', alternativas: ['Sí', 'No'], esFiltroInterno: true }
    ],
    responsable: 'Coordinación EquipoUni',
    orden: 2
  },

  {
    id: 'feria-saludable-companias-2026',
    nombre: 'Feria Saludable Las Compañías',
    tipo: 'feria',
    organizacion: 'Centro Comunitario Las Compañías',
    estado: 'publicada',
    modalidad: 'presencial',
    region: '04',
    comuna: '04101',
    direccion: 'Multicancha de calle Los Aromos',
    lugar: 'Multicancha del sector',
    fechaInicio: '2026-10-04',
    fechaTermino: '2026-10-04',
    horario: '10:00 a 17:00',
    cupos: 25,
    cuposDisponibles: 11,
    valor: 0,
    queIncluye: ['Espacio de 3x3 metros', 'Difusión en redes del centro comunitario'],
    queNoIncluye: ['Toldo', 'Mesón'],
    cierrePostulacion: '2026-09-22',
    plazoPago: 'No aplica, la participación es sin costo.',
    asistencia: 'Jornada completa.',
    cancelacion: 'Avisar con 48 horas de anticipación.',
    rubrosBuscados: ['alimentos', 'cosmetica'],
    subrubrosBuscados: ['conservas', 'snacks', 'cosmetica-natural', 'jabones'],
    requisitos: ['Muestra del etiquetado de los productos al postular.'],
    imagen: 'feria-alimentos.jpg',
    imagenAlt: 'Puesto de feria con quesos y productos locales',
    descripcion: 'Feria de barrio sin costo de participación, orientada a alimentos ' +
      'elaborados y cosmética natural. Se pide fotografía del etiquetado al postular.',
    preguntas: [
      { id: 'etiquetado', texto: '¿Sus productos llevan etiqueta con ingredientes?', tipo: 'una',
        alternativas: ['Sí, todos', 'Algunos', 'Todavía no'] },
      { id: 'reemplazo', texto: 'Si no queda seleccionado, ¿acepta que lo contactemos si se libera un cupo?',
        tipo: 'una', alternativas: ['Sí', 'No'], esFiltroInterno: true }
    ],
    responsable: 'Coordinación EquipoUni',
    orden: 3
  },

  {
    id: 'feria-del-valle-vicuna-2026',
    nombre: 'Feria del Valle',
    tipo: 'feria',
    organizacion: 'Agrupación de Productores del Elqui',
    estado: 'publicada',
    modalidad: 'presencial',
    region: '04',
    comuna: '04106',
    direccion: 'Plaza de Armas de Vicuña',
    lugar: 'Plaza de Armas',
    fechaInicio: '2026-10-10',
    fechaTermino: '2026-10-11',
    horario: '11:00 a 20:00',
    cupos: 24,
    cuposDisponibles: 9,
    valor: 0,
    queIncluye: ['Espacio de 3x3 metros', 'Toldo comunitario compartido'],
    queNoIncluye: ['Mesón', 'Corriente eléctrica'],
    cierrePostulacion: '2026-09-25',
    plazoPago: 'No aplica, la participación es sin costo.',
    asistencia: 'Los dos días.',
    cancelacion: 'Avisar con 72 horas de anticipación.',
    rubrosBuscados: ['alimentos', 'artesania'],
    subrubrosBuscados: ['conservas', 'bebidas-alcoholicas', 'ceramica', 'textil-artesanal'],
    requisitos: ['Acreditar producción propia en la provincia de Elqui.'],
    imagen: 'feria-flores.jpg',
    imagenAlt: 'Mujeres vendiendo flores de colores en la calle',
    descripcion: 'Feria de productores del valle. Sin costo para quienes acrediten ' +
      'producción propia dentro de la provincia de Elqui.',
    preguntas: [
      { id: 'origen', texto: '¿Dónde produce?', tipo: 'una',
        alternativas: ['Provincia de Elqui', 'Otra provincia de la región', 'Fuera de la región'] },
      { id: 'reemplazo', texto: 'Si no queda seleccionado, ¿acepta que lo contactemos si se libera un cupo?',
        tipo: 'una', alternativas: ['Sí', 'No'], esFiltroInterno: true }
    ],
    responsable: 'Coordinación EquipoUni',
    orden: 4
  },

  {
    id: 'expo-emprende-ovalle-2026',
    nombre: 'Expo Emprende Ovalle',
    tipo: 'expo',
    organizacion: 'Cámara de Comercio de Ovalle',
    estado: 'publicada',
    modalidad: 'presencial',
    region: '04',
    comuna: '04301',
    direccion: 'Parque Municipal de Ovalle',
    lugar: 'Parque Municipal',
    fechaInicio: '2026-10-24',
    fechaTermino: '2026-10-25',
    horario: '10:00 a 20:00',
    cupos: 60,
    cuposDisponibles: 33,
    valor: 12000,
    queIncluye: ['Espacio de 2x2 metros', 'Mesón', 'Dos charlas de formalización'],
    queNoIncluye: ['Toldo'],
    cierrePostulacion: '2026-09-30',
    plazoPago: '7 días corridos desde el aviso de selección',
    asistencia: 'Los dos días completos.',
    cancelacion: 'Devolución del 70% hasta 10 días antes.',
    rubrosBuscados: ['artesania', 'alimentos', 'diseno-moda', 'servicios', 'deco-hogar'],
    subrubrosBuscados: [],
    requisitos: [],
    imagen: 'feria-textil.jpg',
    imagenAlt: 'Dos personas mostrando textiles y artesanías de colores en su puesto',
    descripcion: 'La expo más grande del Limarí, abierta a todos los rubros. Incluye ' +
      'dos charlas de formalización el sábado por la mañana.',
    preguntas: [
      { id: 'charla', texto: '¿Le interesa participar de las charlas de formalización?', tipo: 'una',
        alternativas: ['Sí', 'No'] },
      { id: 'reemplazo', texto: 'Si no queda seleccionado, ¿acepta que lo contactemos si se libera un cupo?',
        tipo: 'una', alternativas: ['Sí', 'No'], esFiltroInterno: true }
    ],
    responsable: 'Coordinación EquipoUni',
    orden: 5
  },

  {
    id: 'popup-diseno-puerto-2026',
    nombre: 'Pop-up de Diseño Puerto',
    tipo: 'pop-up',
    organizacion: 'Colectivo Diseño Norte Chico',
    estado: 'publicada',
    modalidad: 'presencial',
    region: '04',
    comuna: '04102',
    direccion: 'Explanada del Muelle de Coquimbo',
    lugar: 'Galpón del muelle',
    fechaInicio: '2026-11-08',
    fechaTermino: '2026-11-08',
    horario: '12:00 a 22:00',
    cupos: 20,
    cuposDisponibles: 4,
    valor: 30000,
    queIncluye: ['Espacio con mobiliario', 'Iluminación', 'Fotografía profesional del stand'],
    queNoIncluye: [],
    cierrePostulacion: '2026-10-15',
    plazoPago: '5 días corridos desde el aviso de selección',
    asistencia: 'Jornada completa.',
    cancelacion: 'Sin devolución.',
    rubrosBuscados: ['diseno-moda', 'deco-hogar', 'papeleria-arte', 'artesania'],
    subrubrosBuscados: ['ropa', 'joyeria', 'ilustracion', 'iluminacion-deco'],
    requisitos: ['Portafolio con seis fotografías del producto terminado.'],
    imagen: 'feria-joyas.jpg',
    imagenAlt: 'Vendedor ordenando joyas en el mesón de su puesto',
    descripcion: 'Pop-up curado de diseño de autor. La selección la hace un comité ' +
      'y se exige portafolio con seis fotografías del producto terminado.',
    preguntas: [
      { id: 'portafolio', texto: '¿Tiene seis fotografías del producto terminado?', tipo: 'una',
        alternativas: ['Sí', 'Todavía no'] },
      { id: 'reemplazo', texto: 'Si no queda seleccionado, ¿acepta que lo contactemos si se libera un cupo?',
        tipo: 'una', alternativas: ['Sí', 'No'], esFiltroInterno: true }
    ],
    responsable: 'Coordinación EquipoUni',
    orden: 6
  },

  {
    id: 'ruta-guanaqueros-2026',
    nombre: 'Ruta del Emprendedor Guanaqueros',
    tipo: 'feria',
    organizacion: 'Unión Comunal de Guanaqueros',
    estado: 'publicada',
    modalidad: 'presencial',
    region: '04',
    comuna: '04102',
    direccion: 'Caleta de Guanaqueros',
    lugar: 'Borde costero de la caleta',
    fechaInicio: '2026-11-15',
    fechaTermino: '2026-11-16',
    horario: '11:00 a 21:00',
    cupos: 35,
    cuposDisponibles: 22,
    valor: 15000,
    queIncluye: ['Espacio de 3x3 metros'],
    queNoIncluye: ['Toldo', 'Mesón', 'Corriente eléctrica'],
    cierrePostulacion: '2026-10-25',
    plazoPago: '5 días corridos desde el aviso de selección',
    asistencia: 'Al menos un día completo.',
    cancelacion: 'Devolución del 50% hasta 7 días antes.',
    rubrosBuscados: ['artesania', 'alimentos'],
    subrubrosBuscados: ['cuero', 'madera', 'snacks'],
    requisitos: [],
    imagen: 'feria-greda.jpg',
    imagenAlt: 'Cerámica y greda pintada de colores exhibida en un puesto de feria',
    descripcion: 'Feria de temporada en la caleta, coordinada con el inicio del verano. ' +
      'El toldo y el mesón los pone cada expositor.',
    preguntas: [
      { id: 'dias', texto: '¿Qué días puede asistir?', tipo: 'varias',
        alternativas: ['Sábado 15', 'Domingo 16'] },
      { id: 'reemplazo', texto: 'Si no queda seleccionado, ¿acepta que lo contactemos si se libera un cupo?',
        tipo: 'una', alternativas: ['Sí', 'No'], esFiltroInterno: true }
    ],
    responsable: 'Coordinación EquipoUni',
    orden: 7
  },

  {
    id: 'feria-invierno-andacollo-2026',
    nombre: 'Feria de Invierno Andacollo',
    tipo: 'feria',
    organizacion: 'Agrupación de Artesanos de Andacollo',
    estado: 'cerrada',
    modalidad: 'presencial',
    region: '04',
    comuna: '04103',
    direccion: 'Gimnasio Municipal de Andacollo',
    lugar: 'Gimnasio Municipal',
    fechaInicio: '2026-08-29',
    fechaTermino: '2026-08-30',
    horario: '11:00 a 19:00',
    cupos: 18,
    cuposDisponibles: 0,
    valor: 8000,
    queIncluye: ['Espacio bajo techo', 'Mesón'],
    queNoIncluye: [],
    cierrePostulacion: '2026-08-15',
    plazoPago: '3 días corridos desde el aviso de selección',
    asistencia: 'Los dos días.',
    cancelacion: 'Sin devolución.',
    rubrosBuscados: ['artesania', 'deco-hogar'],
    subrubrosBuscados: ['ceramica', 'textil-artesanal'],
    requisitos: [],
    imagen: 'feria-puesto.jpg',
    imagenAlt: 'Emprendedora atendiendo su puesto de accesorios en una feria',
    descripcion: 'Convocatoria cerrada. Queda publicada como referencia de lo que ' +
      'suele pedir esta organización.',
    preguntas: [],
    responsable: 'Coordinación EquipoUni',
    orden: 8
  }
];
