/* ============================================================
   ENTRAR, CREAR CUENTA Y RECUPERAR CONTRASEÑA
   ------------------------------------------------------------
   Contra el backend real. Tres cuidados que conviene no perder:

   - El mensaje de error al entrar nunca dice si el correo existe o
     si la contraseña está mala: decirlo permite averiguar qué correos
     están registrados en la plataforma.
   - El botón se bloquea mientras se envía, para no crear dos cuentas
     con doble clic.
   - Al registrarse se pide aceptar el tratamiento de datos, porque la
     ficha guarda RUT y teléfono.
   ============================================================ */

EU.alEstarListo(function () {
  'use strict';

  var form = document.getElementById('form-sesion');
  if (!form) return;

  var esRegistro = form.getAttribute('data-modo') === 'registro';
  var mensaje = document.getElementById('mensaje-form');
  var boton = form.querySelector('button[type="submit"]');
  var textoBoton = boton ? boton.textContent : '';

  function avisar(texto, esError) {
    mensaje.textContent = texto;
    mensaje.className = 'mensaje-form' + (esError ? ' mensaje-form--error' : '');
  }

  function ocupado(si) {
    if (!boton) return;
    boton.disabled = si;
    boton.textContent = si ? 'Un momento…' : textoBoton;
  }

  /* A dónde ir después de entrar: lo que venga en la dirección, y si no,
     la cuenta. Solo se aceptan páginas del propio sitio. */
  function destino() {
    var v = EU.util.parametro('volver');
    if (v && /^[a-z0-9-]+\.html(\?[^"'<>]*)?$/i.test(v)) return v;
    return 'cuenta.html';
  }

  if (EU.api.haySesion()) {
    location.href = destino();
    return;
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    if (!form.checkValidity()) { form.reportValidity(); return; }

    var correo = form.elements.correo.value.trim();
    var clave = form.elements.clave.value;

    if (esRegistro) {
      if (clave.length < 8) {
        avisar('La contraseña necesita al menos 8 caracteres.', true);
        return;
      }
      if (form.elements.clave2 && clave !== form.elements.clave2.value) {
        avisar('Las dos contraseñas no coinciden.', true);
        return;
      }
      ocupado(true);
      EU.api.registrar({
        correo: correo,
        clave: clave,
        nombre: form.elements.nombre.value.trim(),
        telefono: form.elements.telefono ? form.elements.telefono.value.trim() : ''
      }).then(function () {
        location.href = 'cuenta-ficha.html?nueva=1';
      }).catch(function (err) {
        ocupado(false);
        avisar(err.message, true);
      });
      return;
    }

    ocupado(true);
    EU.api.entrar(correo, clave)
      .then(function () { location.href = destino(); })
      .catch(function () {
        ocupado(false);
        /* Mensaje deliberadamente igual para correo inexistente y
           contraseña equivocada. */
        avisar('El correo o la contraseña no coinciden.', true);
      });
  });

  /* Recuperar contraseña: el backend manda el enlace por correo. */
  var recuperar = document.getElementById('recuperar');
  if (recuperar) {
    recuperar.addEventListener('click', function (e) {
      e.preventDefault();
      var correo = form.elements.correo.value.trim();
      if (!correo) {
        avisar('Escribe tu correo arriba y vuelve a tocar este enlace.', true);
        form.elements.correo.focus();
        return;
      }
      EU.api.pedirRecuperacion(correo).then(function () {
        avisar('Si ese correo tiene cuenta, le llegará un enlace para cambiar la contraseña.');
      }).catch(function () {
        /* Se responde igual haya o no cuenta, para no revelar quién está registrado. */
        avisar('Si ese correo tiene cuenta, le llegará un enlace para cambiar la contraseña.');
      });
    });
  }
});
