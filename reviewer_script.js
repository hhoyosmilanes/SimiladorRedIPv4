$(document).ready(function() {
    // --- REFERENCIAS A ELEMENTOS DEL DOM ---
    const configInput = $('#configInput');
    const reviewBtn = $('#reviewBtn');
    const resultsOutput = $('#resultsOutput');
    const parsedDataOutput = $('#parsedDataOutput'); // Este selector está bien ahora

    // --- CARGA LA CADENA DE EJEMPLO POR DEFECTO AL INICIO ---
    const exampleString = "ReqL1:6/29,ReqL2:126/25,ReqL3:62/26|routerProveedor:C-IP:0/0,C-NM:0,C-GW:0,C-DNS:0;S-NW:191.108.146.80,S-IP:191.108.146.81/29,S-NM:255.255.255.248|routerIsp:C-IP:191.108.146.82/29,C-NM:255.255.255.248,C-GW:191.108.146.81,C-DNS:8.8.4.4;S-NW:10.10.10.0,S-IP:10.10.10.1/25,S-NM:255.255.255.128|routerHogar:C-IP:10.10.10.62/25,C-NM:255.255.255.128,C-GW:10.10.10.1,C-DNS:208.67.222.222;S-NW:192.168.100.0,S-IP:192.168.100.1/26,S-NM:255.255.255.192|computador:C-IP:192.168.100.62/26,C-NM:255.255.255.192,C-GW:192.168.100.1,C-DNS:8.8.4.4;S-NW:0,S-IP:0/0,S-NM:0";
    configInput.val(exampleString);

    // --- EVENT LISTENER DEL BOTÓN ---
    reviewBtn.on('click', function() {
        const inputString = configInput.val(); // Captura la cadena del textarea

        // Usa tu nueva función para parsear la cadena
        let parsedData = parseNetworkConfig(inputString);
        let resultadoHTML = validarEnlaces(parsedData);
        
        // Muestra los "Detalles Parseados" en el DOM
        parsedDataOutput.text(JSON.stringify(parsedData, null, 2));

        // Aquí es donde en el futuro pondremos la lógica de revisión, usando 'parsedData'
        resultsOutput.html(resultadoHTML);
    });

    // --- TU FUNCIÓN PARA CONVERTIR CADENA EN OBJETO JAVASCRIPT (PARSEAR) ---
    function parseNetworkConfig(input) {
        const result = { requerimientos: {}, };

        const [requerimientosPart, ...deviceParts] = input.split('|');

        // Parsear requerimientos
        requerimientosPart.split(',').forEach(req => {
            const [key, value] = req.split(':');
            result.requerimientos[key] = value; // Ej: { "ReqL1": "6/29" }
        });

        // Parsear dispositivos
        deviceParts.forEach(part => {
            const splitIndex = part.indexOf(':');
            if (splitIndex === -1) return; 

            const deviceName = part.slice(0, splitIndex);
            const data = part.slice(splitIndex + 1);

            const [clienteStr, servidorStr] = data.split(';');

            const cliente = {};
            const servidor = {};

            if (clienteStr) {
                clienteStr.split(',').forEach(item => {
                    const [key, value] = item.split(':');
                    // Almacena las propiedades sin "C-" o "S-"
                    cliente[key.replace('C-', '').toLowerCase()] = value; // Ej: { "ip": "0/0", "nm": "0" }
                });
            }

            if (servidorStr) {
                servidorStr.split(',').forEach(item => {
                    const [key, value] = item.split(':');
                    servidor[key.replace('S-', '').toLowerCase()] = value; // Ej: { "nw": "191.108.146.80", "ip": "191.108.146.81/29" }
                });
            }

            result[deviceName] = { cliente, servidor };
        });

        return result;
    }


    // --- FUNCIONES VALIDACION ---

    function validarEnlaces(parsedData) {
  function isPrivate(ip) {
    const parts = ip.split('.').map(Number);
    return (
      (parts[0] === 10) ||
      (parts[0] === 172 && parts[1] >= 16 && parts[1] <= 31) ||
      (parts[0] === 192 && parts[1] === 168)
    );
  }

  function ipToInt(ip) {
    return ip.split('.').reduce((acc, oct) => (acc << 8) + parseInt(oct, 10), 0);
  }

  function maskFromPrefix(prefix) {
    return ((0xFFFFFFFF << (32 - prefix)) >>> 0);
  }

  /*function validateMask(maskStr, prefix) {
    const maskInt = ipToInt(maskStr);
    return maskInt === maskFromPrefix(parseInt(prefix));
  }*/

  function validateMask(maskStr, prefix) {
  // Convierte la máscara en decimal a binario (ej: 255.255.255.128 => 11111111111111111111111110000000)
  const maskParts = maskStr.split('.').map(Number);
  const binary = maskParts.map(part => part.toString(2).padStart(8, '0')).join('');
  const ones = binary.indexOf('0'); // índice del primer 0 = cantidad de unos = prefijo esperado

  // Verifica que después del primer 0 no haya más unos (máscara válida)
  const isContiguous = !binary.slice(ones).includes('1');
  return ones === parseInt(prefix) && isContiguous;
}


  function inSameSubnet(ip1, ip2, mask) {
    return (ipToInt(ip1) & ipToInt(mask)) === (ipToInt(ip2) & ipToInt(mask));
  }

  function parseIP(ipWithPrefix) {
    const [ip, prefix] = ipWithPrefix.split('/');
    return { ip, prefix: parseInt(prefix) };
  }

  const nodos = ['routerProveedor', 'routerIsp', 'routerHogar', 'computador'];
  const requerimientos = [parsedData.requerimientos.ReqL1, parsedData.requerimientos.ReqL2, parsedData.requerimientos.ReqL3];

  let html = `<h2>Resultado de Validación de Enlaces</h2><ul>`;

  for (let i = 0; i < nodos.length - 1; i++) {
    const nodoA = parsedData[nodos[i]];
    const nodoB = parsedData[nodos[i + 1]];
    const enlaceNombre = `${nodos[i]} ➝ ${nodos[i + 1]}`;
    const requerimiento = requerimientos[i];
    const [ipEsperadas, prefijoEsperado] = requerimiento.split('/').map(x => x.trim());

    const servidor = parseIP(nodoA.servidor.ip);
    const cliente = parseIP(nodoB.cliente.ip);
    const mascaraServidor = nodoA.servidor.nm;
    const mascaraCliente = nodoB.cliente.nm;

    html += `<li><strong>Enlace ${enlaceNombre}</strong><ul>`;

    // IP privada/pública (solo info)
    html += `<li>IP Servidor (${servidor.ip}): ${isPrivate(servidor.ip) ? "Privada" : "Pública"}</li>`;
    html += `<li>IP Cliente (${cliente.ip}): ${isPrivate(cliente.ip) ? "Privada" : "Pública"}</li>`;

    // Misma subred
    const mismaSubred = inSameSubnet(servidor.ip, cliente.ip, mascaraServidor);
    html += `<li class="result-item ${mismaSubred ? "correct" : "incorrect"}">Ambas IPs ${mismaSubred ? "están" : "NO están"} en la misma subred</li>`;

    // Prefijo vs requerimiento
    const prefijoServidorValido = servidor.prefix === parseInt(prefijoEsperado);
    const prefijoClienteValido = cliente.prefix === parseInt(prefijoEsperado);
    html += `<li class="result-item ${prefijoServidorValido ? "correct" : "incorrect"}">Prefijo Servidor ${servidor.prefix} ${prefijoServidorValido ? "coincide" : "NO coincide"} con requerimiento ${prefijoEsperado}</li>`;
    html += `<li class="result-item ${prefijoClienteValido ? "correct" : "incorrect"}">Prefijo Cliente ${cliente.prefix} ${prefijoClienteValido ? "coincide" : "NO coincide"} con requerimiento ${prefijoEsperado}</li>`;

    // Máscara vs prefijo
    const mascaraServidorOk = validateMask(mascaraServidor, servidor.prefix);
    const mascaraClienteOk = validateMask(mascaraCliente, cliente.prefix);
    html += `<li class="result-item ${mascaraServidorOk ? "correct" : "incorrect"}">Máscara Servidor (${mascaraServidor}) ${mascaraServidorOk ? "coincide" : "NO coincide"} con prefijo ${servidor.prefix}</li>`;
    html += `<li class="result-item ${mascaraClienteOk ? "correct" : "incorrect"}">Máscara Cliente (${mascaraCliente}) ${mascaraClienteOk ? "coincide" : "NO coincide"} con prefijo ${cliente.prefix}</li>`;

    html += `</ul></li>`;
  }

  html += `</ul>`;
  return html;
}




});