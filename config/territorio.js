/* ============================================================
   TERRITORIO: REGIONES Y COMUNAS
   ------------------------------------------------------------
   Estructura de DOS NIVELES desde el primer dia, aunque hoy la
   operacion sea de una sola region.

   PARA PASAR A NIVEL NACIONAL:
   1. Agregar las regiones que falten a la lista de abajo.
   2. En config/marca.js, agregar sus codigos a territorioActivo,
      o dejar territorioActivo en null para habilitarlas todas.
   No hay que tocar ninguna pagina ni ningun formulario: los selectores
   de region y comuna se construyen leyendo este archivo.

   El codigo es la LLAVE ESTABLE, no el nombre. Se guarda el codigo en
   los datos, nunca el nombre, porque los nombres cambian de escritura
   ("Paihuano" y "Paiguano" conviven) y el codigo no.

   Fuente de los codigos: Codigo Unico Territorial (CUT), Subdere,
   vigente desde el 6 de septiembre de 2018. Verificados uno a uno.
   ============================================================ */

window.EU = window.EU || {};

EU.territorio = {
  regiones: [
    {
      codigo: '04',
      nombre: 'Región de Coquimbo',
      nombreCorto: 'Coquimbo',
      comunas: [
        /* Provincia de Elqui (041) */
        { codigo: '04101', nombre: 'La Serena',    provincia: 'Elqui' },
        { codigo: '04102', nombre: 'Coquimbo',     provincia: 'Elqui' },
        { codigo: '04103', nombre: 'Andacollo',    provincia: 'Elqui' },
        { codigo: '04104', nombre: 'La Higuera',   provincia: 'Elqui' },
        /* El CUT la escribe "Paiguano"; en uso corriente es "Paihuano". */
        { codigo: '04105', nombre: 'Paihuano',     provincia: 'Elqui' },
        { codigo: '04106', nombre: 'Vicuña',       provincia: 'Elqui' },

        /* Provincia de Choapa (042) */
        { codigo: '04201', nombre: 'Illapel',      provincia: 'Choapa' },
        { codigo: '04202', nombre: 'Canela',       provincia: 'Choapa' },
        { codigo: '04203', nombre: 'Los Vilos',    provincia: 'Choapa' },
        { codigo: '04204', nombre: 'Salamanca',    provincia: 'Choapa' },

        /* Provincia de Limarí (043) */
        { codigo: '04301', nombre: 'Ovalle',       provincia: 'Limarí' },
        { codigo: '04302', nombre: 'Combarbalá',   provincia: 'Limarí' },
        { codigo: '04303', nombre: 'Monte Patria', provincia: 'Limarí' },
        { codigo: '04304', nombre: 'Punitaqui',    provincia: 'Limarí' },
        { codigo: '04305', nombre: 'Río Hurtado',  provincia: 'Limarí' }
      ]
    }

    /* Al sumar una region nueva, respetar la misma forma:
       { codigo, nombre, nombreCorto, comunas: [{ codigo, nombre, provincia }] } */
  ]
};

/* ---------- Funciones de consulta ----------
   Las paginas usan estas funciones y nunca recorren el arreglo a mano.
   Asi, si manana el territorio viene de una API, se cambia solo aca. */

EU.territorio.regionesActivas = function () {
  var permitidas = EU.marca && EU.marca.territorioActivo;
  if (!permitidas) return EU.territorio.regiones;
  return EU.territorio.regiones.filter(function (r) {
    return permitidas.indexOf(r.codigo) !== -1;
  });
};

/* Todas las comunas habilitadas, ordenadas alfabeticamente.
   Sirve para el selector simple cuando hay una sola region. */
EU.territorio.comunasActivas = function () {
  var salida = [];
  EU.territorio.regionesActivas().forEach(function (r) {
    r.comunas.forEach(function (c) {
      salida.push({ codigo: c.codigo, nombre: c.nombre, region: r.codigo });
    });
  });
  return salida.sort(function (a, b) { return a.nombre.localeCompare(b.nombre, 'es'); });
};

EU.territorio.comuna = function (codigo) {
  var encontrada = null;
  EU.territorio.regiones.forEach(function (r) {
    r.comunas.forEach(function (c) { if (c.codigo === codigo) encontrada = c; });
  });
  return encontrada;
};

EU.territorio.nombreComuna = function (codigo) {
  var c = EU.territorio.comuna(codigo);
  return c ? c.nombre : '';
};

EU.territorio.region = function (codigo) {
  var encontrada = null;
  EU.territorio.regiones.forEach(function (r) { if (r.codigo === codigo) encontrada = r; });
  return encontrada;
};

/* Verdadero cuando hay mas de una region habilitada. Las paginas lo
   consultan para decidir si muestran un selector de region antes del
   de comuna. Hoy da falso; el dia que se sume otra region da verdadero
   y los formularios se adaptan solos. */
EU.territorio.esNacional = function () {
  return EU.territorio.regionesActivas().length > 1;
};
