// Referência ao banco de dados
const database = firebase.database();

// Função para atualizar status no Firebase
function updateStatus(wo, status) {
    database.ref('workOrders/' + wo).update({
        status: status,
        lastUpdated: firebase.database.ServerValue.TIMESTAMP
    });
}

// Monitora mudanças em tempo real
database.ref('workOrders').on('value', (snapshot) => {
    const data = snapshot.val();
    if (data) {
        for (const wo in data) {
            if (markers[wo]) {
                const isClosed = data[wo].status === "fechada";
                // Atualiza o pin
                markers[wo].setIcon(createCustomIcon(isClosed));
                // Atualiza a lista
                updateWorkOrderItem(wo, data[wo].status);
                
                // Atualiza o popup com link do Google Maps
                const coords = markers[wo].getLatLng();
                const popupContent = `
                    <strong>WO:</strong> ${wo}<br>
                    <strong>Status:</strong> ${data[wo].status}<br>
                    <a href="https://www.google.com/maps?q=${coords.lat},${coords.lng}" 
                       target="_blank" style="color: #3388ff; text-decoration: none;">
                       📍 Abrir no Google Maps
                    </a>
                `;
                markers[wo].bindPopup(popupContent);
            }
        }
    }
});
