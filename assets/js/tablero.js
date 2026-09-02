/* ============================================================
   TABLERO DE OPORTUNIDADES
   ------------------------------------------------------------
   Sirve a dos páginas:
     index.html          lista corta de las que cierran primero
     oportunidades.html  listado completo con filtros

   Decide qué hacer según los contenedores que encuentre, así no hay
   que mantener dos archivos casi iguales.
   ============================================================ */

(function () {
  'use strict';

  /* ---------- Lista corta de la portada ---------- */

  var destacadas = document.getElementById('oportunidades-destacadas');
  if (destacadas) {
    EU.repo.entonces(EU.repo.oportunidades.listar({}), function (lista) {
      destacadas.innerHTML = lista.slice(0, 4).map(EU.ui.tarjetaOportunidad).join('');
    });
  }

  /* ---------- Listado completo con filtros ---------- */

  var listado = document.getElementById('oportunidades-listado');
  if (!listado) return;

  var form = document.getElementById('filtros');
  var resumen = document.getElementById('resumen-filtros');

  function opcion(sel, valor, texto) {
    var o = document.createElement('option');
    o.value = valor;
    o.textContent = texto;
    sel.appendChild(o);
  }

  /* Los selectores se llenan desde la configuración y desde los datos.
     Nunca se escriben a mano en el HTML: si mañana hay una comuna nueva
     o un rubro nuevo, aparecen solos. */
  function poblarFiltros() {
    var selTipo = form.elements.tipo;
    EU.catalogo.tiposOportunidad.forEach(function (t) {
      opcion(selTipo, t.id, t.nombre);
    });

    var selRubro = form.elements.rubro;
    EU.catalogo.rubros.forEach(function (r) {
      opcion(selRubro, r.id, r.nombre);
    });

    /* Solo se ofrecen comunas que hoy tienen alguna oportunidad. Un filtro
       que siempre devuelve cero resultados es una promesa incumplida. */
    var selComuna = form.elements.comuna;
    EU.repo.oportunidades.comunasConActividad().forEach(function (c) {
      opcion(selComuna, c.codigo, c.nombre);
    });

    var selMes = form.elements.mes;
    EU.repo.oportunidades.mesesConActividad().forEach(function (m) {
      opcion(selMes, m.valor, m.texto);
    });

    /* Cuando haya más de una región habilitada, el selector de región
       aparece solo. Ver config/territorio.js. */
    var campoRegion = document.getElementById('campo-region');
    if (campoRegion) {
      if (EU.territorio.esNacional()) {
        var selRegion = form.elements.region;
        EU.territorio.regionesActivas().forEach(function (r) {
          opcion(selRegion, r.codigo, r.nombreCorto);
        });
      } else {
        campoRegion.hidden = true;
      }
    }
  }

  /* Deja preseleccionado lo que venga por la dirección, para que un
     enlace como oportunidades.html?comuna=04101 funcione y se pueda
     compartir. */
  function leerDireccion() {
    ['tipo', 'rubro', 'comuna', 'region', 'mes'].forEach(function (nombre) {
      var valor = EU.util.parametro(nombre);
      var campo = form.elements[nombre];
      if (valor && campo) campo.value = valor;
    });
    if (EU.util.parametro('gratuitas') === '1' && form.elements.gratuitas) {
      form.elements.gratuitas.checked = true;
    }
  }

  function criterios() {
    return {
      tipo: form.elements.tipo.value,
      rubro: form.elements.rubro.value,
      comuna: form.elements.comuna.value,
      region: form.elements.region ? form.elements.region.value : '',
      mes: form.elements.mes.value,
      gratuitas: form.elements.gratuitas.checked,
      incluirCerradas: form.elements.cerradas.checked
    };
  }

  function aplicar() {
    EU.repo.entonces(EU.repo.oportunidades.listar(criterios()), function (lista) {
      if (!lista.length) {
        listado.innerHTML = '<li class="sin-resultados">' +
          '<h3>No hay oportunidades con esos filtros</h3>' +
          '<p>Prueba con otra comuna o con otro mes, o marca la casilla para ver ' +
          'también las que ya cerraron.</p></li>';
      } else {
        listado.innerHTML = lista.map(EU.ui.tarjetaOportunidad).join('');
      }
      resumen.textContent = lista.length === 1
        ? '1 oportunidad'
        : lista.length + ' oportunidades';
    });
  }

  poblarFiltros();
  leerDireccion();
  form.addEventListener('change', aplicar);
  form.addEventListener('submit', function (e) { e.preventDefault(); aplicar(); });
  aplicar();
})();
