/* ============================================================
   CATÁLOGO DE CATEGORÍAS: RUBRO > SUBRUBRO > TIPO DE PRODUCTO
   ------------------------------------------------------------
   Los 12 RUBROS son los que definió el cliente (brief del 2026-09-10)
   y no se cambian sin avisarle. Los SUBRUBROS y los tipos de producto
   son propuesta de Estudio Faro: están para que él los corrija.

   REGLAS QUE VIENEN DE LA ESPECIFICACIÓN:
   - Cada emprendedor elige un rubro principal y uno o varios subrubros.
   - "Otros productos o servicios" siempre deriva a revisión humana,
     nunca crea una categoría nueva sola.
   - El subrubro depende del rubro, y el tipo de producto depende del
     subrubro. Nunca se muestran todos juntos.

   El id es la llave estable. Nunca guardar la etiqueta en los datos.
   ============================================================ */

window.EU = window.EU || {};

EU.catalogo = {
  /* Valor reservado: el rubro 12 del cliente. Si el emprendedor lo elige,
     su ficha pasa a revisión humana en vez de clasificarse sola. */
  OTRO: 'otro',

  rubros: [
    {
      id: 'tejido-confeccion',
      nombre: 'Tejido y confección',
      subrubros: [
        { id: 'telar-tejido', nombre: 'Telar y tejido a mano',
          tipos: ['Telar', 'Tejido a palillo', 'Crochet', 'Macramé'] },
        { id: 'ropa', nombre: 'Ropa',
          tipos: ['Mujer', 'Hombre', 'Infantil', 'Sin género', 'Talla amplia'] },
        { id: 'ropa-infantil', nombre: 'Ropa de bebé y niños',
          tipos: ['Ajuar', 'Mudas', 'Gorros y zapatitos'] },
        { id: 'bordado', nombre: 'Bordado y aplicaciones',
          tipos: ['Bordado a mano', 'Bordado a máquina', 'Parches'] },
        { id: 'fieltro', nombre: 'Fieltro y lana',
          tipos: ['Fieltro', 'Lana afieltrada', 'Muñequería'] }
      ]
    },
    {
      id: 'artesania',
      nombre: 'Artesanía y manualidades',
      subrubros: [
        { id: 'ceramica', nombre: 'Cerámica y greda',
          tipos: ['Vajilla', 'Macetas', 'Figuras', 'Piezas decorativas'] },
        { id: 'madera', nombre: 'Madera',
          tipos: ['Utensilios', 'Juguetes', 'Muebles pequeños', 'Tallado'] },
        { id: 'cuero', nombre: 'Cuero y marroquinería',
          tipos: ['Billeteras', 'Cinturones', 'Calzado', 'Cuadernos'] },
        { id: 'vidrio', nombre: 'Vidrio y mosaico',
          tipos: ['Vitrofusión', 'Mosaico', 'Vitral'] },
        { id: 'metal', nombre: 'Metal y alambre',
          tipos: ['Herrería decorativa', 'Alambrismo'] },
        { id: 'reciclado', nombre: 'Reciclado y restauración',
          tipos: ['Objetos reciclados', 'Muebles restaurados'] }
      ]
    },
    {
      id: 'accesorios-joyeria',
      nombre: 'Accesorios, joyería y bisutería',
      subrubros: [
        { id: 'joyeria-metal', nombre: 'Joyería en metal',
          tipos: ['Plata', 'Cobre', 'Bronce', 'Acero'] },
        { id: 'piedras', nombre: 'Piedras y minerales',
          tipos: ['Lapislázuli', 'Piedras semipreciosas', 'Cuarzos'] },
        { id: 'bisuteria', nombre: 'Bisutería',
          tipos: ['Aros', 'Collares', 'Pulseras', 'Anillos'] },
        { id: 'accesorios-vestir', nombre: 'Accesorios de vestir',
          tipos: ['Gorros y bufandas', 'Cintillos', 'Pañuelos', 'Lentes'] },
        { id: 'bolsos', nombre: 'Bolsos y mochilas',
          tipos: ['Bolsos de tela', 'Mochilas', 'Estuches', 'Monederos'] }
      ]
    },
    {
      id: 'deco-hogar',
      nombre: 'Decoración y productos para el hogar',
      subrubros: [
        { id: 'textil-hogar', nombre: 'Textil de hogar',
          tipos: ['Cojines', 'Mantas', 'Manteles', 'Cortinas'] },
        { id: 'velas-aromas', nombre: 'Velas y aromas de hogar',
          tipos: ['Velas de soya', 'Velas decorativas', 'Difusores', 'Sahumerios'] },
        { id: 'iluminacion-objetos', nombre: 'Iluminación y objetos',
          tipos: ['Lámparas', 'Espejos', 'Portarretratos'] },
        { id: 'organizacion', nombre: 'Organización y almacenaje',
          tipos: ['Canastos', 'Cajas', 'Percheros'] },
        { id: 'vajilla-cocina', nombre: 'Vajilla y cocina',
          tipos: ['Vajilla', 'Utensilios', 'Individuales'] }
      ]
    },
    {
      id: 'papeleria-diseno',
      nombre: 'Papelería, ilustración y diseño',
      subrubros: [
        { id: 'papeleria', nombre: 'Papelería',
          tipos: ['Libretas', 'Agendas', 'Tarjetas', 'Planificadores'] },
        { id: 'ilustracion', nombre: 'Ilustración y láminas',
          tipos: ['Láminas', 'Stickers', 'Postales'] },
        { id: 'serigrafia', nombre: 'Serigrafía y estampado',
          tipos: ['Poleras', 'Bolsas', 'Afiches'] },
        { id: 'diseno-personalizado', nombre: 'Diseño personalizado',
          tipos: ['Invitaciones', 'Etiquetas', 'Identidad de marca'] }
      ]
    },
    {
      id: 'belleza-cuidado',
      nombre: 'Belleza y cuidado personal',
      subrubros: [
        { id: 'cosmetica-natural', nombre: 'Cosmética natural',
          avisa: 'Los productos cosméticos pueden requerir registro sanitario del ISP.',
          tipos: ['Cremas', 'Aceites', 'Bálsamos labiales', 'Serums'] },
        { id: 'jabones-bano', nombre: 'Jabones y baño',
          tipos: ['Jabón artesanal', 'Sales de baño', 'Exfoliantes', 'Bombas de baño'] },
        { id: 'capilar', nombre: 'Cuidado capilar',
          tipos: ['Champú sólido', 'Aceites capilares', 'Acondicionadores'] },
        { id: 'maquillaje', nombre: 'Maquillaje',
          tipos: ['Labiales', 'Sombras', 'Brochas'] },
        { id: 'perfumeria', nombre: 'Perfumería y aromaterapia',
          tipos: ['Perfumes', 'Aceites esenciales', 'Sahumerios'] }
      ]
    },
    {
      id: 'alimentos-bebidas',
      nombre: 'Alimentos y bebidas',
      avisa: 'Vender comida preparada exige resolución sanitaria vigente.',
      subrubros: [
        { id: 'pasteleria', nombre: 'Pastelería y repostería',
          tipos: ['Tortas', 'Galletas', 'Kuchen', 'Postres individuales', 'Sin azúcar o sin gluten'] },
        { id: 'panaderia', nombre: 'Panadería',
          tipos: ['Pan artesanal', 'Masa madre', 'Pan sin gluten'] },
        { id: 'conservas', nombre: 'Conservas, mermeladas y miel',
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
      id: 'plantas-naturales',
      nombre: 'Plantas y productos naturales',
      subrubros: [
        { id: 'plantas', nombre: 'Plantas',
          tipos: ['Suculentas', 'Plantas de interior', 'Cactus', 'Plantines'] },
        { id: 'huerto', nombre: 'Huerto y jardinería',
          tipos: ['Semillas', 'Composteras', 'Herramientas', 'Sustratos'] },
        { id: 'hierbas', nombre: 'Hierbas y productos naturales',
          avisa: 'Los productos con uso medicinal declarado requieren autorización del ISP.',
          tipos: ['Hierbas secas', 'Tinturas', 'Ungüentos'] },
        { id: 'flores', nombre: 'Flores y arreglos',
          tipos: ['Flores frescas', 'Flores secas', 'Coronas', 'Ramos'] }
      ]
    },
    {
      id: 'mascotas',
      nombre: 'Productos para mascotas',
      subrubros: [
        { id: 'alimento-mascotas', nombre: 'Alimento y snacks',
          tipos: ['Snacks naturales', 'Alimento preparado', 'Galletas'] },
        { id: 'accesorios-mascotas', nombre: 'Accesorios',
          tipos: ['Camas', 'Collares y correas', 'Juguetes', 'Ropa'] },
        { id: 'cuidado-mascotas', nombre: 'Cuidado e higiene',
          tipos: ['Shampoo', 'Cepillos', 'Colonias'] }
      ]
    },
    {
      id: 'arte-fotografia',
      nombre: 'Arte y fotografía',
      subrubros: [
        { id: 'pintura', nombre: 'Pintura y dibujo',
          tipos: ['Óleo', 'Acuarela', 'Acrílico', 'Dibujo'] },
        { id: 'fotografia', nombre: 'Fotografía',
          tipos: ['Fotografía impresa', 'Fotolibros', 'Postales'] },
        { id: 'escultura', nombre: 'Escultura y objeto',
          tipos: ['Escultura', 'Objeto de autor'] },
        { id: 'grabado', nombre: 'Grabado y técnicas mixtas',
          tipos: ['Grabado', 'Linograbado', 'Collage'] }
      ]
    },
    {
      id: 'servicios-eventos',
      nombre: 'Servicios para eventos',
      /* Los servicios rara vez ocupan un stand de venta. Se mantienen
         porque la ficha los admite, pero muchas oportunidades los excluyen. */
      subrubros: [
        { id: 'talleres', nombre: 'Talleres y experiencias',
          tipos: ['Taller para niños', 'Taller para adultos', 'Demostración en vivo'] },
        { id: 'fotografia-eventos', nombre: 'Fotografía de eventos',
          tipos: ['Cobertura', 'Fotos instantáneas'] },
        { id: 'animacion', nombre: 'Animación y música',
          tipos: ['Música en vivo', 'Animación infantil', 'Caricaturas en vivo'] },
        { id: 'bienestar', nombre: 'Bienestar y terapias',
          tipos: ['Masaje', 'Terapias complementarias'] },
        { id: 'produccion', nombre: 'Producción y montaje',
          tipos: ['Arriendo de mobiliario', 'Decoración de eventos'] }
      ]
    },
    {
      /* Rubro 12 del cliente. Sin subrubros a propósito: al elegirlo, la
         ficha pide el detalle en texto y pasa a revisión de una persona. */
      id: 'otro',
      nombre: 'Otros productos o servicios',
      avisa: 'Al elegir este rubro, una persona del equipo revisa tu caso para clasificarlo.',
      subrubros: []
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
