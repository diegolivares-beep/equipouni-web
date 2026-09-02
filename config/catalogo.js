/* ============================================================
   CATÁLOGO DE CATEGORÍAS: RUBRO > SUBRUBRO > TIPO DE PRODUCTO
   ------------------------------------------------------------
   PROPUESTA PROVISORIA, PENDIENTE DE VALIDACIÓN (T316).
   La especificación funcional deja el catálogo normalizado como
   "siguiente definición funcional". Mientras no esté validado, este
   archivo es una propuesta razonable para poder construir las pantallas
   que dependen de él, que son tres:
     1. La ficha del emprendedor (clasificación).
     2. El filtro del tablero de oportunidades.
     3. El perfil buscado al crear una oportunidad.

   REGLAS QUE VIENEN DE LA ESPECIFICACIÓN:
   - La opción "Otro" siempre deriva a revisión humana, nunca crea
     una categoría nueva sola.
   - Los criterios abiertos no generan clústeres automáticos.
   - El subrubro depende del rubro, y el tipo de producto depende del
     subrubro. Nunca se muestran todos juntos.

   El id es la llave estable. Nunca guardar la etiqueta en los datos.
   ============================================================ */

window.EU = window.EU || {};

EU.catalogo = {
  /* Valor reservado. Si el emprendedor lo elige, su ficha pasa a
     revisión humana en vez de clasificarse sola. */
  OTRO: 'otro',

  rubros: [
    {
      id: 'alimentos',
      nombre: 'Alimentos y bebidas',
      /* Advertencia que la ficha muestra al elegir este rubro. */
      avisa: 'Vender comida preparada exige resolución sanitaria vigente.',
      subrubros: [
        { id: 'pasteleria', nombre: 'Pastelería y repostería',
          tipos: ['Tortas', 'Galletas', 'Kuchen', 'Postres individuales', 'Sin azúcar o sin gluten'] },
        { id: 'conservas', nombre: 'Conservas y mermeladas',
          tipos: ['Mermeladas', 'Encurtidos', 'Salsas', 'Miel', 'Aceite de oliva'] },
        { id: 'comida-preparada', nombre: 'Comida preparada',
          tipos: ['Comida caliente', 'Sándwiches', 'Comida vegana', 'Repostería salada'] },
        { id: 'cafe-te', nombre: 'Café, té e infusiones',
          tipos: ['Café de grano', 'Café preparado', 'Hierbas e infusiones'] },
        { id: 'bebidas-alcoholicas', nombre: 'Cerveza, vino y destilados',
          avisa: 'La venta de alcohol requiere permiso municipal específico para el evento.',
          tipos: ['Cerveza artesanal', 'Vino', 'Pisco y destilados', 'Licores de fruta'] },
        { id: 'snacks', nombre: 'Snacks y frutos secos',
          tipos: ['Frutos secos', 'Deshidratados', 'Barras'] }
      ]
    },
    {
      id: 'artesania',
      nombre: 'Artesanía',
      subrubros: [
        { id: 'ceramica', nombre: 'Cerámica y greda',
          tipos: ['Vajilla', 'Macetas', 'Figuras', 'Piezas decorativas'] },
        { id: 'textil-artesanal', nombre: 'Textil artesanal',
          tipos: ['Telar', 'Tejido a palillo o crochet', 'Fieltro', 'Bordado'] },
        { id: 'joyeria', nombre: 'Joyería y orfebrería',
          tipos: ['Plata', 'Cobre', 'Lapislázuli y piedras', 'Bisutería'] },
        { id: 'cuero', nombre: 'Cuero y marroquinería',
          tipos: ['Billeteras', 'Cinturones', 'Bolsos', 'Calzado'] },
        { id: 'madera', nombre: 'Madera',
          tipos: ['Utensilios', 'Juguetes', 'Muebles pequeños', 'Tallado'] },
        { id: 'vidrio-metal', nombre: 'Vidrio y metal',
          tipos: ['Vitrofusión', 'Mosaico', 'Herrería decorativa'] }
      ]
    },
    {
      id: 'diseno-moda',
      nombre: 'Diseño y moda',
      subrubros: [
        { id: 'ropa', nombre: 'Ropa',
          tipos: ['Mujer', 'Hombre', 'Infantil', 'Sin género', 'Talla amplia'] },
        { id: 'accesorios-moda', nombre: 'Accesorios',
          tipos: ['Gorros y bufandas', 'Lentes', 'Cintillos', 'Pañuelos'] },
        { id: 'bolsos', nombre: 'Bolsos y mochilas',
          tipos: ['Bolsos de tela', 'Mochilas', 'Estuches'] },
        { id: 'calzado', nombre: 'Calzado',
          tipos: ['Zapatos', 'Pantuflas', 'Sandalias'] }
      ]
    },
    {
      id: 'cosmetica',
      nombre: 'Cosmética y cuidado personal',
      subrubros: [
        { id: 'cosmetica-natural', nombre: 'Cosmética natural',
          avisa: 'Los productos cosméticos pueden requerir registro sanitario del ISP.',
          tipos: ['Cremas', 'Aceites', 'Bálsamos labiales'] },
        { id: 'jabones', nombre: 'Jabones y baño',
          tipos: ['Jabón artesanal', 'Sales de baño', 'Exfoliantes'] },
        { id: 'capilar', nombre: 'Cuidado capilar',
          tipos: ['Champú sólido', 'Aceites capilares'] },
        { id: 'aromaterapia', nombre: 'Aromaterapia',
          tipos: ['Aceites esenciales', 'Difusores', 'Sahumerios'] }
      ]
    },
    {
      id: 'deco-hogar',
      nombre: 'Deco y hogar',
      subrubros: [
        { id: 'textil-hogar', nombre: 'Textil de hogar',
          tipos: ['Cojines', 'Mantas', 'Manteles', 'Cortinas'] },
        { id: 'velas', nombre: 'Velas y aromas de hogar',
          tipos: ['Velas de soya', 'Velas decorativas', 'Difusores'] },
        { id: 'plantas', nombre: 'Plantas y jardinería',
          tipos: ['Suculentas', 'Plantas de interior', 'Huerto', 'Composteras'] },
        { id: 'iluminacion-deco', nombre: 'Iluminación y objetos',
          tipos: ['Lámparas', 'Espejos', 'Portarretratos'] }
      ]
    },
    {
      id: 'papeleria-arte',
      nombre: 'Papelería, arte e ilustración',
      subrubros: [
        { id: 'ilustracion', nombre: 'Ilustración y láminas',
          tipos: ['Láminas', 'Stickers', 'Postales'] },
        { id: 'papeleria', nombre: 'Papelería',
          tipos: ['Libretas', 'Agendas', 'Tarjetas'] },
        { id: 'serigrafia', nombre: 'Serigrafía y estampado',
          tipos: ['Poleras', 'Bolsas', 'Afiches'] },
        { id: 'fotografia-arte', nombre: 'Fotografía y pintura',
          tipos: ['Fotografía impresa', 'Pintura', 'Grabado'] }
      ]
    },
    {
      id: 'mascotas',
      nombre: 'Mascotas',
      subrubros: [
        { id: 'alimento-mascotas', nombre: 'Alimento y snacks',
          tipos: ['Snacks naturales', 'Alimento preparado'] },
        { id: 'accesorios-mascotas', nombre: 'Accesorios',
          tipos: ['Camas', 'Collares y correas', 'Juguetes', 'Ropa'] }
      ]
    },
    {
      id: 'servicios',
      nombre: 'Servicios',
      /* Los servicios rara vez ocupan un stand de venta. Se mantienen
         porque la ficha los admite, pero muchas oportunidades los excluyen. */
      subrubros: [
        { id: 'talleres', nombre: 'Talleres y experiencias',
          tipos: ['Taller para niños', 'Taller para adultos', 'Demostración en vivo'] },
        { id: 'bienestar', nombre: 'Bienestar y terapias',
          tipos: ['Masaje', 'Terapias complementarias'] },
        { id: 'servicios-creativos', nombre: 'Servicios creativos',
          tipos: ['Diseño gráfico', 'Fotografía de eventos', 'Caricaturas en vivo'] }
      ]
    }
  ]
};

/* ---------- Tipos de oportunidad ----------
   No toda oportunidad es una feria. La especificación pide el tipo como
   dato visible en la tarjeta y como primer filtro del tablero. */

EU.catalogo.tiposOportunidad = [
  { id: 'feria',        nombre: 'Feria',                 descripcion: 'Feria abierta al público, de uno o varios días.' },
  { id: 'mercado',      nombre: 'Mercado de temporada',  descripcion: 'Mercado asociado a una fecha, como Fiestas Patrias o Navidad.' },
  { id: 'expo',         nombre: 'Expo o encuentro',      descripcion: 'Evento con programa, charlas o rueda de negocios.' },
  { id: 'pop-up',       nombre: 'Pop-up',                descripcion: 'Espacio temporal dentro de una tienda, mall u oficina.' },
  { id: 'corporativo',  nombre: 'Evento corporativo',    descripcion: 'Actividad cerrada de una empresa o institución.' },
  { id: 'punto-venta',  nombre: 'Punto de venta',        descripcion: 'Espacio de venta por temporada larga o permanente.' },
  { id: 'convocatoria', nombre: 'Convocatoria pública',  descripcion: 'Fondo, programa o postulación de una institución.' }
];

EU.catalogo.tipoOportunidad = function (id) {
  var t = null;
  EU.catalogo.tiposOportunidad.forEach(function (x) { if (x.id === id) t = x; });
  return t;
};

EU.catalogo.nombreTipo = function (id) {
  var t = EU.catalogo.tipoOportunidad(id);
  return t ? t.nombre : id;
};

/* ---------- Funciones de consulta ---------- */

EU.catalogo.rubro = function (id) {
  var r = null;
  EU.catalogo.rubros.forEach(function (x) { if (x.id === id) r = x; });
  return r;
};

EU.catalogo.subrubros = function (idRubro) {
  var r = EU.catalogo.rubro(idRubro);
  return r ? r.subrubros : [];
};

EU.catalogo.subrubro = function (id) {
  var s = null;
  EU.catalogo.rubros.forEach(function (r) {
    r.subrubros.forEach(function (x) { if (x.id === id) s = x; });
  });
  return s;
};

EU.catalogo.tipos = function (idSubrubro) {
  var s = EU.catalogo.subrubro(idSubrubro);
  return s && s.tipos ? s.tipos : [];
};

/* Etiqueta legible de cualquier id de rubro o subrubro. Si el id no
   existe devuelve el id crudo, para que un dato malo se vea en pantalla
   en vez de desaparecer en silencio. */
EU.catalogo.nombre = function (id) {
  if (id === EU.catalogo.OTRO) return 'Otro (requiere revisión)';
  var r = EU.catalogo.rubro(id);
  if (r) return r.nombre;
  var s = EU.catalogo.subrubro(id);
  if (s) return s.nombre;
  return id;
};

/* Avisos legales o de requisitos asociados a una categoría.
   Se muestran en la ficha y en el detalle de la oportunidad. */
EU.catalogo.avisos = function (ids) {
  var salida = [];
  (ids || []).forEach(function (id) {
    var r = EU.catalogo.rubro(id);
    if (r && r.avisa && salida.indexOf(r.avisa) === -1) salida.push(r.avisa);
    var s = EU.catalogo.subrubro(id);
    if (s && s.avisa && salida.indexOf(s.avisa) === -1) salida.push(s.avisa);
  });
  return salida;
};

/* Lista plana de rubros para poblar un selector. */
EU.catalogo.paraSelector = function () {
  return EU.catalogo.rubros.map(function (r) {
    return { valor: r.id, texto: r.nombre };
  });
};
