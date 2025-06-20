# Simulador de Red IPv4 Interactivo

Este es un simulador web interactivo diseñado para ayudar a los estudiantes a practicar y comprender los conceptos de subredes IPv4.

## ¿Qué hace?

* **Generación de Requisitos:** La herramienta genera de forma aleatoria requisitos de cantidad de hosts para tres enlaces de red distintos (uno público y dos privados).
* **Configuración de Nodos:** Permite al estudiante configurar los parámetros de red (direcciones IP, máscaras de subred, prefijos CIDR, gateways, DNS) para diferentes nodos en un diagrama de red simulado (Router Proveedor, Router ISP, Router Hogar, Computador).
* **Envío de Respuestas:** Los datos de configuración ingresados por el estudiante, junto con los requisitos de hosts generados, se envían y almacenan automáticamente en una hoja de cálculo de Google Sheets para su revisión y evaluación.

## Uso

1.  Abre el archivo `index.html` en tu navegador web.
2.  Observa los requisitos de hosts generados para cada enlace.
3.  Haz clic en cada nodo del diagrama para abrir su ventana de configuración.
4.  Ingresa las direcciones IP, máscaras de red, prefijos y otros parámetros según los requisitos y tu diseño de subred.
5.  Una vez que hayas configurado todos los nodos, ingresa tu nombre y haz clic en el botón "Enviar Todo".
6.  Tus respuestas serán enviadas a la hoja de cálculo del instructor.

---

**Desarrollado con:** HTML, CSS, JavaScript (jQuery) y Google Apps Script.
