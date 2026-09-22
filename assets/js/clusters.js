/* ============================================================
   CLÚSTER DE COINCIDENCIA
   ------------------------------------------------------------
   Calcula en qué grupo cae una postulación respecto del perfil que
   busca la oportunidad. Reglas de la especificación:

   - Revisión: tiene "Otro", información pendiente o una condición
     que necesita análisis humano.
   - Directa: cumple condiciones y coincide con el rubro, subrubro o
     producto buscado.
   - Parcial: cumple lo básico, pero solo parte del perfil preferido.
   - Complementario: puede aportar variedad aunque no sea el foco.

   El clúster se CALCULA siempre, nunca se guarda en los datos: depende
   de la ficha y del perfil buscado, que son datos vivos. Y solo ordena:
   la selección es siempre de una persona.

   Cada resultado trae la razón en palabras, para que quien administra
   vea por qué alguien quedó donde quedó y pueda discrepar con criterio.
   ============================================================ */

window.EU = window.EU || {};

EU.clusters = {

  /* Devuelve { cluster, razon } para una postulación. */
  calcular: function (postulacion, oportunidad, ficha) {
    var C = EU.estados.cluster;

    if (!ficha) {
      return { cluster: C.REVISION, razon: 'La ficha del emprendimiento no está disponible.' };
    }

    /* 1. Cualquier cosa que pida ojos humanos va a revisión. */
    if (ficha.clasificacion.rubro === EU.catalogo.OTRO) {
      return { cluster: C.REVISION,
        razon: 'La clasificación quedó en "Otro": ' +
          (ficha.clasificacion.otroDetalle || 'sin detalle') + '.' };
    }
    if (ficha.estado !== EU.estados.ficha.VALIDADA) {
      return { cluster: C.REVISION,
        razon: 'La ficha está en estado "' +
          EU.estados.etiqueta('ficha', ficha.estado).toLowerCase() + '".' };
    }

    var rubrosBuscados = oportunidad.rubrosBuscados || [];
    var subrubrosBuscados = oportunidad.subrubrosBuscados || [];
    var rubro = ficha.clasificacion.rubro;
    var subrubros = EU.catalogo.subrubrosDe(ficha.clasificacion);

    /* Con varios subrubros basta que UNO calce con los priorizados:
       si el emprendimiento hace telar y fieltro y la feria busca telar,
       es coincidencia directa. */
    var calzan = subrubros.filter(function (s) {
      return subrubrosBuscados.indexOf(s) !== -1;
    });

    var nombreRubro = EU.catalogo.nombre(rubro);
    var nombresSub = EU.catalogo.nombresSubrubros(ficha.clasificacion);

    /* 2. Oportunidad abierta a todos los rubros: toda ficha validada calza. */
    if (!rubrosBuscados.length) {
      return { cluster: C.DIRECTA, razon: 'La oportunidad está abierta a todos los rubros.' };
    }

    /* 3. Alguno de sus subrubros está entre los priorizados. */
    if (calzan.length) {
      var nombresCalzan = calzan.map(function (s) { return EU.catalogo.nombre(s); });
      return { cluster: C.DIRECTA,
        razon: (nombresCalzan.length === 1 ? nombresCalzan[0] + ' está' : nombresCalzan.join(' y ') + ' están') +
               ' entre los subrubros priorizados.' };
    }

    /* 4. El rubro calza pero el subrubro no es de los priorizados. */
    if (rubrosBuscados.indexOf(rubro) !== -1) {
      if (!subrubrosBuscados.length) {
        return { cluster: C.DIRECTA,
          razon: nombreRubro + ' está entre los rubros buscados y la oportunidad no prioriza subrubros.' };
      }
      return { cluster: C.PARCIAL,
        razon: nombreRubro + ' está entre los rubros buscados, pero ' +
          (nombresSub.length ? nombresSub.join(' y ').toLowerCase() : 'su especialidad') +
          ' no ' + (nombresSub.length > 1 ? 'son' : 'es') + ' de los priorizados.' };
    }

    /* 5. Rubro fuera del perfil: aporta variedad. */
    return { cluster: C.COMPLEMENTARIO,
      razon: nombreRubro + ' no está entre los rubros buscados; puede aportar variedad.' };
  },

  /* Postulaciones de una oportunidad, cada una con su ficha y su clúster,
     ordenadas como pide la especificación: directa, parcial,
     complementario, revisión, y dentro de cada grupo por fecha. */
  deOportunidad: function (idOportunidad) {
    var o = EU.repo.oportunidades.obtener(idOportunidad);
    if (!o) return [];
    return EU.datos.postulacionesA(idOportunidad).map(function (p) {
      var ficha = EU.datos.emprendedor(p.emprendedor);
      var c = EU.clusters.calcular(p, o, ficha);
      return { postulacion: p, ficha: ficha, cluster: c.cluster, razon: c.razon };
    }).sort(function (a, b) {
      var oa = EU.estados.clusterInfo[a.cluster].orden;
      var ob = EU.estados.clusterInfo[b.cluster].orden;
      if (oa !== ob) return oa - ob;
      return String(a.postulacion.fecha).localeCompare(String(b.postulacion.fecha));
    });
  }
};
