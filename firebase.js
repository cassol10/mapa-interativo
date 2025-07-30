// firebase.js - Arquivo de integração com o Firebase Realtime Database

// 1. Referência ao banco de dados
const database = firebase.database();

// 2. Objeto para armazenar os estados atuais
const workOrdersData = {};

// 3. Função para atualizar o status no Firebase
function updateStatus(wo, status) {
    database.ref('workOrders/' + wo).update({
        status: status,
        lastUpdated: firebase.database.ServerValue.TIMESTAMP
    }).then(() => {
        console.log(`Status ${wo} atualizado para: ${status}`);
    }).catch((error) => {
        console.error("Erro ao atualizar:", error);
    });
}

// 4. Função para criar conteúdo do popup com Google Maps
function createPopupContent(wo, pdo, status, coords) {
    return `
        <div class="custom-popup">
            <strong>WO:</strong> ${wo}<br>
            <strong>PDO:</strong> ${pdo}<br>
            <strong>Status:</strong> <span class="status-badge">${status}</span><br>
            <a href="https://www.google.com/maps?q=${coords.lat},${coords.lng}" 
               target="_blank" class="gmaps-link">
               📍 Abrir no Google Maps
            </a>
            <div class="checkbox-group">
                <strong>Alterar Status:</strong>
                <div class="checkbox-line">
                    <input type="radio" id="aberta-${wo}" name="status-${wo}" 
                           ${status === 'aberta' ? 'checked' : ''}
                           onchange="updateStatus('${wo}', 'aberta')">
                    <label for="aberta-${wo}">Aberta</label>
                </div>
                <div class="checkbox-line">
                    <input type="radio" id="fechada-${wo}" name="status-${wo}" 
                           ${status === 'fechada' ? 'checked' : ''}
                           onchange="updateStatus('${wo}', 'fechada')">
                    <label for="fechada-${wo}">Fechada</label>
                </div>
            </div>
        </div>
    `;
}

// 5. Listener para atualizações em tempo real
database.ref('workOrders').on('value', (snapshot) => {
    const data = snapshot.val() || {};
    
    // Atualiza o objeto local
    Object.assign(workOrdersData, data);
    
    // Atualiza todos os marcadores
    for (const wo in markers) {
        if (data[wo]) {
            const isClosed = data[wo].status === "fechada";
            
            // Atualiza o ícone
            markers[wo].setIcon(createCustomIcon(isClosed));
            
            // Atualiza o popup
            const coords = markers[wo].getLatLng();
            markers[wo].bindPopup(
                createPopupContent(
                    wo,
                    data[wo].pdo || 'PDO não informado',
                    data[wo].status,
                    coords
                )
            );
            
            // Atualiza a listagem lateral
            if (workOrderItems[wo]) {
                updateWorkOrderItem(wo, data[wo].status);
            }
        }
    }
});

// 6. Inicialização dos dados
function initializeData() {
    database.ref('workOrders').once('value').then((snapshot) => {
        if (!snapshot.exists()) {
            // Cria estrutura inicial se o banco estiver vazio
            const initialData = {};
            dataPoints.forEach(point => {
                initialData[point.wo] = {
                    pdo: point.pdo,
                    status: 'aberta',
                    coords: point.coords
                };
            });
            database.ref('workOrders').set(initialData);
        }
    });
}

// 7. Inicializa quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', initializeData);
