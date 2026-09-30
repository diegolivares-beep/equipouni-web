/* ============================================================
   TRADUCTOR ENTRE LA BASE Y LAS PANTALLAS
   ------------------------------------------------------------
   La base guarda campos planos (emp_nombre, cla_rubro) porque es lo
   que conviene para consultar e indexar. Las pantallas trabajan con
   objetos agrupados (emprendimiento.nombre, clasificacion.rubro)
   porque es lo que se lee bien al escribir una vista.

   Acá viven las dos traducciones. Gracias a esto, conectar el sitio
   al backend no obligó a reescribir ninguna pantalla.
   ============================================================ */

window.EU = window.EU || {};

EU.modelo = {

  /* ---------- Oportunidades ---------- */

  oportunidadDesdeBase: function (r) {
    return {
      id: r.id,
      nombre: r.nombre,
      tipo: r.tipo,
      organizacion: r.organizacion,
      estado: r.estado,
      fechaPublicacion: r.fecha_publicacion || '',

      modalidad: r.modalidad,
      region: r.region,
      comuna: r.comuna,
      direccion: r.direccion,
      lugar: r.lugar,

      fechaInicio: r.fecha_inicio,
      fechaTermino: r.fecha_termino,
      horario: r.horario,

      cupos: r.cupos,
      cuposDisponibles: r.cupos_disponibles,
      valor: r.valor,
      queIncluye: r.que_incluye || [],
      queNoIncluye: r.que_no_incluye || [],

      cierrePostulacion: r.cierre_postulacion,
      plazoPago: r.plazo_pago,
      /* Texto libre con la cuenta a la que se paga la participacion. Viaja
         al correo de seleccion (hook avisos.pb.js) y solo lo ve el
         seleccionado: no se muestra en el detalle publico. */
      datosTransferencia: r.datos_transferencia || '',
      asistencia: r.asistencia,
      cancelacion: r.cancelacion,

      rubrosBuscados: r.rubros_buscados || [],
      subrubrosBuscados: r.subrubros_buscados || [],
      requisitos: r.requisitos || [],

      /* La imagen puede venir subida al backend o ser una de las que
         vinieron con el sitio. Se distingue por si trae barra. */
      imagen: r.imagen ? EU.api.archivo(r, r.imagen) : '',
      imagenLocal: r.imagen ? '' : 'feria-toldos.jpg',
      imagenAlt: r.imagen_alt || '',
      descripcion: r.descripcion,

      preguntas: r.preguntas || [],
      responsable: r.responsable,
      orden: r.orden,
      _registro: r
    };
  },

  /* Los campos que llegan como undefined NO se mandan: mandarlos como
     vacío pisaba datos que el formulario no edita. Es lo que borraba
     "qué no incluye" y la modalidad cada vez que se editaba una
     oportunidad. */
  oportunidadHaciaBase: function (o) {
    var cuerpo = {
      nombre: o.nombre, tipo: o.tipo, organizacion: o.organizacion,
      estado: o.estado, fecha_publicacion: o.fechaPublicacion || '',
      modalidad: o.modalidad || 'presencial',
      region: o.region, comuna: o.comuna,
      direccion: o.direccion, lugar: o.lugar || '',
      fecha_inicio: o.fechaInicio, fecha_termino: o.fechaTermino,
      horario: o.horario || '',
      cupos: o.cupos,
      cupos_disponibles: o.cuposDisponibles,
      valor: o.valor,
      que_incluye: o.queIncluye || [], que_no_incluye: o.queNoIncluye || [],
      cierre_postulacion: o.cierrePostulacion,
      plazo_pago: o.plazoPago || '',
      datos_transferencia: o.datosTransferencia || '', asistencia: o.asistencia || '',
      cancelacion: o.cancelacion || '',
      rubros_buscados: o.rubrosBuscados || [],
      subrubros_buscados: o.subrubrosBuscados || [],
      requisitos: o.requisitos || [],
      imagen_alt: o.imagenAlt || '', descripcion: o.descripcion,
      preguntas: o.preguntas || [],
      responsable: o.responsable || '', orden: o.orden || 0
    };
    Object.keys(cuerpo).forEach(function (k) {
      if (cuerpo[k] === undefined) delete cuerpo[k];
    });
    return cuerpo;
  },

  /* ---------- Fichas ---------- */

  fichaDesdeBase: function (r) {
    var fotos = (r.fotos || []).map(function (f) {
      return { archivo: f, url: EU.api.archivo(r, f), miniatura: EU.api.archivo(r, f, '300x0') };
    });
    return {
      id: r.id,
      usuario: r.usuario,
      estado: r.estado,
      creada: (r.created || '').slice(0, 10),
      actualizada: (r.updated || '').slice(0, 10),
      representante: {
        nombre: r.representante_nombre || '',
        rut: r.representante_rut || '',
        correo: (r.expand && r.expand.usuario && r.expand.usuario.email) || '',
        telefono: r.representante_telefono || '',
        comuna: r.representante_comuna || '',
        contactoPreferido: r.contacto_preferido || 'whatsapp'
      },
      emprendimiento: {
        nombre: r.emp_nombre || '',
        comuna: r.emp_comuna || '',
        anoInicio: r.emp_ano_inicio || '',
        descripcion: r.emp_descripcion || '',
        instagram: r.emp_instagram || '',
        web: r.emp_web || '',
        logo: r.logo ? EU.api.archivo(r, r.logo, '300x0') : ''
      },
      clasificacion: {
        rubro: r.cla_rubro || '',
        subrubros: r.cla_subrubros || [],
        tipos: r.cla_tipos || [],
        otroDetalle: r.cla_otro_detalle || '',
        /* Lo que el emprendedor escribió en sus palabras. Es la materia
           prima con la que el equipo le asigna rubro al validar, así que
           viaja junto a la clasificación y no junto a los productos. */
        queVende: r.cla_que_vende || ''
      },
      /* Las pone el revisor, como se ponen los hashtags: lista libre, no
         un catálogo cerrado. */
      etiquetas: r.etiquetas || [],
      productos: {
        fotos: fotos,
        personaliza: !!r.personaliza,
        detallePersonaliza: r.personaliza_detalle || '',
        masVendidos: r.productos_top || []
      },
      formalizacion: {
        inicioActividades: !!r.for_inicio_actividades,
        boleta: !!r.for_boleta,
        patente: !!r.for_patente,
        resolucionSanitaria: !!r.for_resolucion_sanitaria,
        personalidadJuridica: !!r.for_personalidad_juridica
      },
      documentos: (r.documentos || []).map(function (f) {
        return { archivo: f, url: EU.api.archivo(r, f) };
      }),
      observaciones: r.observaciones || {},
      _registro: r
    };
  },

  /* Devuelve solo los campos que edita el EMPRENDEDOR. El estado, las
     observaciones y —desde el 30-sep— la clasificación y las etiquetas
     los maneja el equipo: mandarlos sería inútil, porque el hook de
     seguridad los repone desde el original. Por eso cla_rubro,
     cla_subrubros, cla_tipos y etiquetas NO están en esta lista. La
     clasificación se guarda por el otro camino, EU.admin.resolverFicha. */
  fichaHaciaBase: function (f) {
    return {
      representante_nombre: f.representante.nombre,
      representante_rut: f.representante.rut,
      representante_telefono: f.representante.telefono,
      representante_comuna: f.representante.comuna,
      contacto_preferido: f.representante.contactoPreferido,

      emp_nombre: f.emprendimiento.nombre,
      emp_comuna: f.emprendimiento.comuna,
      emp_ano_inicio: Number(f.emprendimiento.anoInicio) || null,
      emp_descripcion: f.emprendimiento.descripcion,
      emp_instagram: f.emprendimiento.instagram || '',
      emp_web: f.emprendimiento.web || '',

      cla_que_vende: f.clasificacion.queVende || '',

      productos_top: f.productos.masVendidos || [],
      personaliza: !!f.productos.personaliza,
      personaliza_detalle: f.productos.detallePersonaliza || '',

      for_inicio_actividades: !!f.formalizacion.inicioActividades,
      for_boleta: !!f.formalizacion.boleta,
      for_patente: !!f.formalizacion.patente,
      for_resolucion_sanitaria: !!f.formalizacion.resolucionSanitaria,
      for_personalidad_juridica: !!f.formalizacion.personalidadJuridica
    };
  },

  /* ---------- Postulaciones ---------- */

  postulacionDesdeBase: function (r) {
    return {
      id: r.id,
      oportunidad: r.oportunidad,
      emprendedor: r.ficha,
      fecha: r.fecha || (r.created || '').slice(0, 10),
      estado: r.estado,
      estadoAnterior: r.estado_anterior || '',
      respuestas: r.respuestas || {},
      historial: r.historial || [],
      _registro: r
    };
  }
};
