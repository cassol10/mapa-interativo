// Função para atualizar status no Firebase
function updateStatus(wo, status) {
    database.ref('workOrders/' + wo).update({
        status: status,
        lastUpdated: firebase.database.ServerValue.TIMESTAMP
    });
}

// Monitorar mudanças em tempo real
database.ref('workOrders').on('value', (snapshot) => {
    const data = snapshot.val() || {};
    
    // Atualizar marcadores existentes
    for (const wo in markers) {
        if (data[wo]) {
            updateMarker(wo, data[wo]);
        } else {
            // Remover marcador se não existir mais no Firebase
            map.removeLayer(markers[wo]);
            delete markers[wo];
            
            // Remover da lista
            if (workOrderItems[wo]) {
                workOrderItems[wo].remove();
                delete workOrderItems[wo];
            }
        }
    }
    
    // Adicionar novos marcadores
    for (const wo in data) {
        if (!markers[wo] && data[wo].coords) {
            addMarker(wo, data[wo]);
        }
    }
});

// Adicionar novo marcador
function addMarker(wo, data) {
    const isClosed = data.status === 'fechada';
    
    // Criar marcador
    markers[wo] = L.marker(data.coords, {
        icon: createCustomIcon(isClosed)
    }).addTo(map);
    
    // Criar popup
    updatePopup(wo, data);
    
    // Criar item na lista
    createListItem(wo, data);
}

// Atualizar marcador existente
function updateMarker(wo, data) {
    const isClosed = data.status === 'fechada';
    
    // Atualizar ícone
    markers[wo].setIcon(createCustomIcon(isClosed));
    
    // Atualizar popup
    updatePopup(wo, data);
    
    // Atualizar lista
    updateListItem(wo, data);
}

// Atualizar popup do marcador
function updatePopup(wo, data) {
    const coords = markers[wo].getLatLng();
    const popupContent = `
        <div class="popup-header">
            <div class="popup-title">${wo}</div>
        </div>
        <div class="popup-content">
            <p><strong>PDO:</strong> ${data.pdo || ''}</p>
            <p><strong>Status:</strong> ${data.status === 'fechada' ? 'Fechada' : 'Aberta'}</p>
            <a href="https://www.google.com/maps?q=${coords.lat},${coords.lng}" 
               target="_blank" class="gmaps-link">
               Abrir no Google Maps
            </a>
        </div>
        <div class="popup-actions">
            <button onclick="updateStatus('${wo}', 'aberta')" 
                    style="${data.status === 'aberta' ? 'background:#3498db' : ''}">
                Aberta
            </button>
            <button onclick="updateStatus('${wo}', 'fechada')" 
                    style="${data.status === 'fechada' ? 'background:#e74c3c' : ''}">
                Fechada
            </button>
        </div>
    `;
    
    markers[wo].bindPopup(popupContent);
}

// Criar item na lista
function createListItem(wo, data) {
    const item = document.createElement('div');
    item.className = `work-order-item ${data.status === 'fechada' ? 'fechada' : ''}`;
    item.innerHTML = `
        <div class="wo-header">
            <span class="wo-number">${wo}</span>
            <span class="wo-status" style="background: ${data.status === 'fechada' ? '#e74c3c' : '#3498db'}">
                ${data.status === 'fechada' ? 'Fechada' : 'Aberta'}
            </span>
        </div>
        <div class="wo-pdo">${data.pdo || ''}</div>
    `;
    
    item.addEventListener('click', () => {
        map.setView(data.coords, 16);
        markers[wo].openPopup();
    });
    
    document.getElementById('work-orders-list').appendChild(item);
    workOrderItems[wo] = item;
}

// Atualizar item na lista
function updateListItem(wo, data) {
    if (workOrderItems[wo]) {
        const statusEl = workOrderItems[wo].querySelector('.wo-status');
        statusEl.textContent = data.status === 'fechada' ? 'Fechada' : 'Aberta';
        statusEl.style.backgroundColor = data.status === 'fechada' ? '#e74c3c' : '#3498db';
        
        if (data.status === 'fechada') {
            workOrderItems[wo].classList.add('fechada');
        } else {
            workOrderItems[wo].classList.remove('fechada');
        }
    }
}
