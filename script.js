$(document).ready(function() {
    // ... (todas tus constantes y definiciones de inputs existentes) ...

    const userNameInput = $('#userName');
    const nodes = $('.node');
    const configModal = $('#configModal');
    const closeModalBtn = $('#closeModalBtn');
    const modalNodeName = $('#modalNodeName');
    const saveConfigBtn = $('#saveConfigBtn');
    const submitAllBtn = $('#submitAllBtn');

    // Inputs del configurador cliente
    const clientAddressInput = $('#clientAddress');
    const clientNetmaskInput = $('#clientNetmask');
    const clientPrefixInput = $('#clientPrefix');
    const clientGatewayInput = $('#clientGateway');
    const clientDnsInput = $('#clientDns');

    // Inputs del configurador servidor
    const serverNetworkInput = $('#serverNetwork');
    const serverAddressInput = $('#serverAddress');
    const serverNetmaskInput = $('#serverNetmask');
    const serverPrefixInput = $('#serverPrefix');

    let currentNodeId = '';

    const nodeConfigurations = {
        routerProveedor: {},
        routerIsp: {},
        routerHogar: {},
        computador: {}
    };

    const linkHostRequirements = {};

    // ¡IMPORTANTE! Reemplaza esta URL con la URL de TU aplicación web de Google Apps Script
    const GOOGLE_APPS_SCRIPT_WEB_APP_URL = "mi url apps scrip";


    function generateRandomHosts() {
        const commonPrefixLengths = [24, 25, 26, 27, 28, 29, 30];
        const randomPrefixIndex = Math.floor(Math.random() * commonPrefixLengths.length);
        const prefix = commonPrefixLengths[randomPrefixIndex];
        const hosts = Math.pow(2, (32 - prefix)) - 2;
        return { hosts: hosts, prefix: prefix };
    }

    function initializeInstructions() {
        const link1 = generateRandomHosts();
        const link2 = generateRandomHosts();
        const link3 = generateRandomHosts();

        $('#hostsLink1').text(link1.hosts);
        $('#hostsLink2').text(link2.hosts);
        $('#hostsLink3').text(link3.hosts);

        linkHostRequirements.link1 = link1;
        linkHostRequirements.link2 = link2;
        linkHostRequirements.link3 = link3;

        console.log("Requisitos de hosts generados:", linkHostRequirements);
    }

    function adjustLayout() {
        if (window.innerWidth <= 768) {
            console.log("Modo móvil detectado.");
        } else {
            console.log("Modo PC detectado.");
        }
    }

    adjustLayout();
    $(window).on('resize', adjustLayout);
    initializeInstructions();

    function clearModalInputs() {
        clientAddressInput.val('');
        clientNetmaskInput.val('');
        clientPrefixInput.val('');
        clientGatewayInput.val('');
        clientDnsInput.val('');
        serverNetworkInput.val('');
        serverAddressInput.val('');
        serverNetmaskInput.val('');
        serverPrefixInput.val('');
    }

    function loadConfigIntoModal(nodeId) {
        const config = nodeConfigurations[nodeId];
        if (config) {
            // Usar '|| "0"' para asegurar que si el valor es null, undefined o vacío, se muestre "0"
            clientAddressInput.val(config.clientAddress || '0');
            clientNetmaskInput.val(config.clientNetmask || '0');
            clientPrefixInput.val(config.clientPrefix || '0');
            clientGatewayInput.val(config.clientGateway || '0');
            clientDnsInput.val(config.clientDns || '0');
            serverNetworkInput.val(config.serverNetwork || '0');
            serverAddressInput.val(config.serverAddress || '0');
            serverNetmaskInput.val(config.serverNetmask || '0');
            serverPrefixInput.val(config.serverPrefix || '0');
        } else {
            // Si no hay configuración previa, también inicializar con "0"
            clearModalInputs();
            clientAddressInput.val('0');
            clientNetmaskInput.val('0');
            clientPrefixInput.val('0');
            clientGatewayInput.val('0');
            clientDnsInput.val('0');
            serverNetworkInput.val('0');
            serverAddressInput.val('0');
            serverNetmaskInput.val('0');
            serverPrefixInput.val('0');
        }
    }

    function updateNodeDisplay(nodeId, clientIp, serverIp) {
        const nodeDiv = $('#' + nodeId);
        let configDisplay = nodeDiv.find('.node-config-display');

        if (configDisplay.length === 0) {
            configDisplay = $('<div class="node-config-display"></div>');
            nodeDiv.append(configDisplay);
        }

        configDisplay.empty();

        // Mostrar "0" si no hay IP, para mantener consistencia
        const displayClientIp = clientIp || '0';
        const displayServerIp = serverIp || '0';

        configDisplay.append(`<p>Client: ${displayClientIp}</p>`);
        configDisplay.append(`<p>Server: ${displayServerIp}</p>`);

        // Si realmente ambos son "0", podrías optar por no mostrar el div, o mantenerlo
        // if (displayClientIp === '0' && displayServerIp === '0') {
        //     configDisplay.remove();
        // }
    }

    nodes.on('click', function() {
        currentNodeId = $(this).attr('id');
        const nodeName = $(this).find('span').text();
        modalNodeName.text(nodeName);
        loadConfigIntoModal(currentNodeId);
        configModal.css('display', 'flex');
    });

    closeModalBtn.on('click', function() {
        configModal.css('display', 'none');
        clearModalInputs(); // Aquí limpiaremos a vacío antes de rellenar con "0" en loadConfigIntoModal
    });

    $(window).on('click', function(event) {
        if ($(event.target).is(configModal)) {
            configModal.css('display', 'none');
            clearModalInputs(); // Aquí limpiaremos a vacío antes de rellenar con "0" en loadConfigIntoModal
        }
    });

    saveConfigBtn.on('click', function() {
        const userName = userNameInput.val();
        const nodeName = modalNodeName.text();

        // Al guardar, asegúrate de que los valores sean "0" si están vacíos
        const clientAddress = clientAddressInput.val() || '0';
        const clientPrefix = clientPrefixInput.val() || '0';
        const clientNetmask = clientNetmaskInput.val() || '0';
        const clientGateway = clientGatewayInput.val() || '0';
        const clientDns = clientDnsInput.val() || '0';

        const serverNetwork = serverNetworkInput.val() || '0';
        const serverAddress = serverAddressInput.val() || '0';
        const serverPrefix = serverPrefixInput.val() || '0';
        const serverNetmask = serverNetmaskInput.val() || '0';

        nodeConfigurations[currentNodeId] = {
            clientAddress: clientAddress,
            clientPrefix: clientPrefix,
            clientNetmask: clientNetmask,
            clientGateway: clientGateway,
            clientDns: clientDns,
            serverNetwork: serverNetwork,
            serverAddress: serverAddress,
            serverPrefix: serverPrefix,
            serverNetmask: serverNetmask
        };

        const clientIpDisplay = (clientAddress !== '0' && clientPrefix !== '0') ? `${clientAddress}/${clientPrefix}` : '0';
        const serverIpDisplay = (serverAddress !== '0' && serverPrefix !== '0') ? `${serverAddress}/${serverPrefix}` : '0';

        updateNodeDisplay(currentNodeId, clientIpDisplay, serverIpDisplay);

        console.log(`--- Configuración GUARDADA para ${nodeName} (por ${userName}) ---`);
        console.log('Requisitos de Hosts:', linkHostRequirements);
        console.log('Configuración de Nodos Actual:', nodeConfigurations);
        console.log('Configurador Cliente para este nodo:');
        console.log(`  Address (Host): ${clientAddress}`);
        console.log(`  Netmask: ${clientNetmask}`);
        console.log(`  Prefijo (Cliente): ${clientPrefix}`);
        console.log(`  Gateway: ${clientGateway}`);
        console.log(`  DNS: ${clientDns}`);
        console.log('Configurador Servidor para este nodo:');
        console.log(`  Network: ${serverNetwork}`);
        console.log(`  Address: ${serverAddress}`);
        console.log(`  Netmask: ${serverNetmask}`);
        console.log(`  Prefijo (Servidor): ${serverPrefix}`);


        alert('¡Configuración guardada y actualizada en el diagrama!');
        configModal.css('display', 'none');
        // No llamamos clearModalInputs aquí para que loadConfigIntoModal ponga los "0" si el usuario no los llenó antes
    });

    // Evento para el botón "Enviar Todo"
    submitAllBtn.on('click', function() {
        const userName = userNameInput.val() || 'ANONIMO'; // Si no ingresa nombre, que sea ANÓNIMO

        if (userName === 'ANONIMO') { // Si el nombre del usuario es el default
            alert('Por favor, ingresa tu nombre (o se enviará como ANÓNIMO).');
            // return; // Podrías quitar el 'return' si quieres que igual envíe con "ANONIMO"
        }

        // 1. Construir la cadena de 'configuracion'
        let configString = "";

        // a. Requisitos de hosts
        configString += `ReqL1:${linkHostRequirements.link1.hosts}/${linkHostRequirements.link1.prefix},`;
        configString += `ReqL2:${linkHostRequirements.link2.hosts}/${linkHostRequirements.link2.prefix},`;
        configString += `ReqL3:${linkHostRequirements.link3.hosts}/${linkHostRequirements.link3.prefix}|`;

        // b. Configuraciones de cada nodo (asegurando que todos los campos estén presentes)
        const nodeOrder = ['routerProveedor', 'routerIsp', 'routerHogar', 'computador']; // Definir un orden fijo

        nodeOrder.forEach(nodeId => {
            const config = nodeConfigurations[nodeId] || {}; // Asegura que 'config' no sea undefined
            
            // Reemplazar valores vacíos por '0' para todos los campos al momento de concatenar
            const clientAddress = config.clientAddress || '0';
            const clientPrefix = config.clientPrefix || '0';
            const clientNetmask = config.clientNetmask || '0';
            const clientGateway = config.clientGateway || '0';
            const clientDns = config.clientDns || '0';

            const serverNetwork = config.serverNetwork || '0';
            const serverAddress = config.serverAddress || '0';
            const serverPrefix = config.serverPrefix || '0';
            const serverNetmask = config.serverNetmask || '0';

            configString += `${nodeId}:C-IP:${clientAddress}/${clientPrefix},C-NM:${clientNetmask},C-GW:${clientGateway},C-DNS:${clientDns};`;
            configString += `S-NW:${serverNetwork},S-IP:${serverAddress}/${serverPrefix},S-NM:${serverNetmask}|`;
        });
        
        // Eliminar el último "|"
        if (configString.endsWith("|")) {
            configString = configString.slice(0, -1);
        }

        console.log("Cadena de configuración a enviar:", configString);

        // 2. Preparar los datos como URLSearchParams
        const formData = new FormData();
        formData.append("nombre", userName);
        formData.append("desarrollo", configString);

        const datos = new URLSearchParams(formData);

        // 3. Enviar los datos usando fetch
        fetch(GOOGLE_APPS_SCRIPT_WEB_APP_URL, {
            method: "POST",
            body: datos
        })
        .then(res => res.text())
        .then(msg => {
            console.log("Respuesta de Apps Script:", msg);
            alert(`¡Configuración enviada! Respuesta del servidor: ${msg}`);
            // location.reload(); // Considera si quieres recargar la página después de enviar
        })
        .catch(error => {
            console.error('Error al enviar los datos:', error);
            alert('Hubo un error al enviar la configuración. Revisa la consola para más detalles.');
        });
    });
});
