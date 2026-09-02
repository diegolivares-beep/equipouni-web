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
  bajada: 'Red de emprendedores',

  /* Una linea que explica que es esto. Se usa en las metaetiquetas. */
  descripcion: 'Red que conecta emprendedores con oportunidades para vender, ' +
    'con postulacion en un solo lugar y seguimiento del estado de cada una.',

  /* Marca como no definitiva. Mientras sea true, el sitio muestra el
     aviso de maqueta. Al publicar de verdad se pone en false. */
  esMaqueta: true,

  contacto: {
    correo: 'contacto@ejemplo.cl',
    whatsapp: '',
    instagram: ''
  },

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
