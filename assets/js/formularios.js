/* ============================================================
   FORMULARIOS DE CUENTA (registro e inicio de sesión)
   ------------------------------------------------------------
   En la maqueta no hay backend: los formularios validan y avisan.
   Cuando exista el sistema de cuentas, se conecta acá.

   Reglas del registro que vienen de la especificación:
   - Un correo corresponde a una cuenta de emprendedor.
   - La ficha se completa después de crear la cuenta, y se puede
     guardar incompleta y seguir en otro momento.
   ============================================================ */

(function () {
  'use strict';

  var ENDPOINT = '';

  var form = document.querySelector('form[data-form-cuenta]');
  if (!form) return;

  var mensaje = document.getElementById('mensaje-form');
  var esRegistro = form.getAttribute('data-form-cuenta') === 'registro';

  function avisar(texto, esError) {
    mensaje.textContent = texto;
    mensaje.className = 'mensaje-form' + (esError ? ' mensaje-form--error' : '');
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    avisar('', false);

    if (!form.checkValidity()) {
      form.reportValidity();
      var primero = form.querySelector(':invalid');
      if (primero) primero.focus();
      return;
    }

    if (esRegistro) {
      var clave = form.elements.clave.value;
      var repite = form.elements.repite.value;
      if (clave.length < 8) {
        avisar('La contraseña necesita al menos 8 caracteres.', true);
        form.elements.clave.focus();
        return;
      }
      if (clave !== repite) {
        avisar('Las contraseñas no coinciden.', true);
        form.elements.repite.focus();
        return;
      }
    }

    if (!ENDPOINT) {
      if (esRegistro) {
        avisar('Formulario válido. En la versión final, desde aquí pasarías a completar tu ficha.', false);
      } else {
        /* Sin sistema de cuentas, entrar lleva al área privada de
           demostración, para poder recorrer el flujo completo. */
        avisar('Entrando a la cuenta de demostración…', false);
        location.href = 'cuenta.html';
      }
      return;
    }

    /* Conexión real, cuando exista. */
    fetch(ENDPOINT, { method: 'POST', body: new FormData(form) })
      .then(function (r) {
        if (!r.ok) throw new Error(r.status);
        var volver = EU.util.parametro('volver');
        location.href = volver || 'index.html';
      })
      .catch(function () {
        avisar('No se pudo conectar. Intenta de nuevo en un momento.', true);
      });
  });
})();
