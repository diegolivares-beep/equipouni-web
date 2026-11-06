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

  /* VER LA CONTRASEÑA (pedido del cliente el 2-nov). Un botón con texto
     y no un ícono: se entiende sin adivinar y lo lee un lector de
     pantalla. Cambiar el tipo del campo no cambia su valor, así que el
     envío sigue leyendo lo mismo. */
  Array.prototype.forEach.call(form.querySelectorAll('input[type="password"]'), function (campo) {
    var envoltura = document.createElement('span');
    envoltura.className = 'clave-ver';
    campo.parentNode.insertBefore(envoltura, campo);
    envoltura.appendChild(campo);
    var b = document.createElement('button');
    b.type = 'button';
    b.className = 'clave-ver__boton';
    b.textContent = 'Mostrar';
    b.setAttribute('aria-pressed', 'false');
    b.setAttribute('aria-label', 'Mostrar la contraseña');
    b.addEventListener('click', function () {
      var ver = campo.type === 'password';
      campo.type = ver ? 'text' : 'password';
      b.textContent = ver ? 'Ocultar' : 'Mostrar';
      b.setAttribute('aria-pressed', String(ver));
      b.setAttribute('aria-label', ver ? 'Ocultar la contraseña' : 'Mostrar la contraseña');
    });
    envoltura.appendChild(b);
  });

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
      /* El teléfono es opcional acá, pero si viene, en cualquier formato y
         con 9 dígitos: el mismo criterio que la ficha. */
      var telefono = form.elements.telefono ? form.elements.telefono.value.trim() : '';
      if (telefono) {
        var tel = EU.util.telefono(telefono);
        if (!tel.ok) { avisar(tel.error, true); form.elements.telefono.focus(); return; }
        telefono = tel.valor;
      }
      ocupado(true);
      EU.api.registrar({
        correo: correo,
        clave: clave,
        nombre: form.elements.nombre.value.trim(),
        telefono: telefono
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
