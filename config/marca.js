/* ============================================================
   MARCA E IDENTIDAD DEL SITIO
   ------------------------------------------------------------
   Este archivo concentra todo lo que cambia cuando cambia la marca:
   nombre, bajada, contacto y textos institucionales.

   PROVISORIO: el nombre definitivo todavia no esta confirmado (T316).
   Cuando se confirme, se edita SOLO este archivo. Ninguna pagina
   escribe el nombre a mano.

   Los COLORES no viven aca: viven como variables CSS en
   assets/css/estilo.css, bajo :root. Ponerlos en JavaScript
   obligaria a pintar la pagina despues de cargar el script,
   lo que produce un parpadeo visible al entrar.
   ============================================================ */

window.EU = window.EU || {};

EU.marca = {
  /* Nombre que se muestra en el encabezado y en los titulos de pagina. */
  nombre: 'EquipoUni',

  /* Bajada corta bajo el logotipo. Maximo unas 5 palabras. */
  bajada: 'Mismas ideas. Más claridad. Un solo equipo.',

  /* Una linea que explica que es esto. Se usa en las metaetiquetas. */
  descripcion: 'Red que conecta emprendedores con oportunidades para vender, ' +
    'con postulacion en un solo lugar y seguimiento del estado de cada una.',

  /* Dos cosas distintas que antes vivían en una sola bandera, y por eso
     el sitio terminó diciendo cosas falsas sobre sí mismo.

     esMaqueta: si esto es una demostración para revisar. Con esto en
     true, el pie publica accesos al panel administrativo y el panel le
     avisa a quien administra que sus cambios no se guardan. Desde que
     el sitio quedó en producción escribiendo contra la base, las dos
     cosas son mentira: va en false.

     datosDeEjemplo: si las oportunidades publicadas todavía son
     inventadas. Es verdad hasta que se carguen las reales, y hay que
     decirlo, porque alguien podría postular a una feria que no existe. */
  esMaqueta: false,
  datosDeEjemplo: true,
  avisoEjemplo: 'Las oportunidades publicadas son de ejemplo mientras cargamos las reales. ' +
                'Las cuentas y las postulaciones sí funcionan y quedan guardadas.',

  contacto: {
    correo: 'contacto@equipouni.cl',
    whatsapp: '',
    instagram: 'equipouni.cl'
  },

  /* Los tres pilares de la marca (brief del cliente). Son los que dan
     origen a los tres nodos del logotipo. */
  pilares: [
    { titulo: 'Conecta', texto: 'Reúne en un solo lugar las oportunidades que hoy están dispersas.' },
    { titulo: 'Facilita', texto: 'Una ficha que se llena una vez y sirve para postular a todas.' },
    { titulo: 'Impulsa', texto: 'Más espacios para vender, con reglas claras desde el principio.' }
  ],

  /* Territorio que cubre hoy la operacion. Debe existir en
     config/territorio.js. Ver ese archivo para pasar a nivel nacional. */
  territorioActivo: ['04'],

  /* Textos institucionales de la pagina "Nosotros".
     Salen del Business Model Canvas del proyecto. */
  institucional: {
    queEs: 'EquipoUni conecta emprendedores con oportunidades para vender y ' +
      'facilita su participacion con una infraestructura, una marca y una ' +
      'administracion compartidas.',
    limites: [
      'El acceso a las oportunidades es gratuito para el emprendedor.',
      'La seleccion final la decide la productora o la institucion, no EquipoUni.',
      'EquipoUni coordina y comunica en remoto, sin presencia fisica en los eventos.',
      'Los fondos de terceros se mantienen separados de los ingresos propios.'
    ]
  }
};
