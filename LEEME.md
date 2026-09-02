# EquipoUni, capa web

Maqueta del sitio de EquipoUni: una red que conecta emprendedores con oportunidades
para vender. Construida en HTML, CSS y JavaScript sin framework, para que sirva de
base sin importar en qué se termine programando el backend (Next.js, Laravel, Django
o lo que decida quien lo mantenga).

Se abre con doble clic en cualquier archivo `.html`. No necesita servidor ni instalar nada.

## Estructura

```
config/          Lo que se edita para cambiar el comportamiento del sitio
  marca.js         Nombre, bajada, contacto, textos institucionales
  territorio.js    Regiones y comunas
  catalogo.js      Rubros, subrubros, tipos de producto y tipos de oportunidad
  estados.js       Estados de ficha, oportunidad y postulación, con sus transiciones
data/            Contenido
  oportunidades.js Las oportunidades publicadas
assets/
  css/estilo.css   Toda la presentación. Los colores están arriba, en :root
  js/              Comportamiento de las páginas
  img/             Fotografías
control.html     Herramienta interna que revisa que todo sea coherente
```

## Las cinco cosas que hay que saber

**1. La configuración manda.** Ninguna página escribe a mano el nombre de una comuna,
un rubro o un estado. Todo sale de `config/`. Si algo hay que cambiar, se cambia ahí
y se propaga solo.

**2. Se guarda el código, no el nombre.** Una oportunidad guarda `comuna: '04101'`, no
`comuna: 'La Serena'`. Los nombres cambian de escritura, los códigos no. Los códigos de
comuna son los del Código Único Territorial de la Subdere, vigentes desde septiembre de 2018.

**3. Los datos de ejemplo tienen los nombres de campo definitivos.** Cuando exista base
de datos, sus columnas deberían llamarse igual que las claves de `data/oportunidades.js`.
Entonces conectar el sitio será cambiar de dónde vienen los datos, sin tocar las pantallas.

**4. Revisa `control.html` después de cada edición.** Detecta comunas que no existen,
rubros mal escritos, fechas incoherentes, cupos imposibles y preguntas mal formadas.
Sin esa página, un dato malo no da error: simplemente desaparece de un filtro y nadie
se entera.

**5. Estas tres reglas vienen de la especificación funcional y no se negocian.**
La plataforma ordena pero nunca selecciona sola. La opción "Otro" siempre deriva a
revisión humana. Cambiar un estado y enviar un correo son dos acciones separadas.

## Cómo se hacen los cambios más comunes

**Agregar una oportunidad.** Copiar un bloque de `data/oportunidades.js`, cambiarle el
`id` y los datos, y abrir `control.html` para confirmar que no quedó nada inconsistente.

**Cambiar el nombre de la marca.** Editar `nombre` en `config/marca.js`. Nada más.

**Pasar de una región a todo Chile.** Agregar las regiones a `config/territorio.js`
respetando la misma forma, y sumar sus códigos a `territorioActivo` en `config/marca.js`
(o dejar `territorioActivo` en `null` para habilitarlas todas). Los formularios detectan
solos que hay más de una región y agregan el selector de región antes del de comuna.
No hay que tocar ninguna página.

**Cambiar los colores.** Están en `assets/css/estilo.css`, en el bloque `:root` del
principio. No están en JavaScript a propósito: si estuvieran ahí, la página se pintaría
después de cargar y se vería un parpadeo al entrar.

**Conectar los formularios.** Cada formulario tiene una constante `ENDPOINT` vacía al
principio de su archivo en `assets/js/`. Al ponerle una URL, empieza a enviar.

## Estado por fases

- **Fase 0, fundación.** Lista. Configuración, datos de ejemplo, validador y control.
- **Fase 1, sitio público.** Lista. Inicio, oportunidades con filtros, detalle,
  para emprendedores, para productoras, nosotros, registro e inicio de sesión.
  La cabecera y el pie se generan desde assets/js/nucleo.js para no mantener
  ocho copias del mismo menú; el backend real los reemplaza por su plantilla.
- **Fase 2, área privada del emprendedor.** Lista. Resumen (cuenta.html), ficha
  única con secciones y estados (cuenta-ficha.html), mis postulaciones e historial,
  y el flujo de postulación (postular.html) con las cuatro validaciones de la
  especificación. Se navega con la cuenta de demostración de `emp-demo`.
- **Fase 3, panel administrativo.** Lista. Panel (admin.html), oportunidades con
  creación en cinco bloques y constructor de preguntas (admin-oportunidad.html),
  postulantes por clúster con acciones masivas (admin-postulantes.html),
  validaciones de ficha, emprendedores y comunicaciones por lote. Los cambios de
  estado funcionan en memoria y respetan las transiciones; se pierden al recargar.
- **Fase 4, conexión a datos reales.** Pendiente, es de quien tome el backend.
  El punto de conexión es `EU.repo` en assets/js/nucleo.js más las constantes
  `ENDPOINT` de los formularios; las pantallas no deberían tocarse.
- **Fase 5, correos y cierre de ciclo.** Las plantillas por estado ya existen en
  admin-comunicaciones.html; falta el envío real.

Mientras el sitio sea maqueta, el pie de página lleva una columna "Revisión de la
maqueta" con accesos directos al área privada, al panel y al control. Desaparece
al poner `esMaqueta` en `false`.

La lógica del clúster de coincidencia vive en assets/js/clusters.js y se calcula
siempre (nunca se guarda), con la razón en palabras junto a cada resultado.

## Pendientes que bloquean

- **Nombre definitivo de la marca.** Mientras tanto se usa "EquipoUni" desde
  `config/marca.js`.
- **Catálogo de rubro, subrubro y producto.** El de `config/catalogo.js` es una
  propuesta nuestra, no está validado por el proyecto. De él dependen la ficha del
  emprendedor, el filtro del tablero y el perfil buscado de cada oportunidad.

## Advertencias

Las oportunidades, las organizaciones y los datos de contacto son inventados. Las
fotografías son de Unsplash y hay que reemplazarlas por imágenes reales. Mientras
`esMaqueta` sea `true` en `config/marca.js`, todas las páginas muestran un aviso
diciéndolo y llevan `noindex` para que no las tome ningún buscador.
