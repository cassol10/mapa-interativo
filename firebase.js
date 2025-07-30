// firebase.js - Versão com dados iniciais
document.addEventListener('DOMContentLoaded', () => {
    const database = firebase.database();
    const markers = {};
    
    // Dados iniciais
    const initialData = {
        "WO 16903160": {
            pdo: "PDO-92-LOU-0161.33",
            desc: "Normal",
            coords: [38.817256, -9.165423],
            status: "aberta"
        },
        "WO 16910762": {
            pdo: "PDO-92-LOU-0010.13",
            desc: "Normal",
            coords: [38.837121, -9.156680],
            status: "aberta"
        },
        "WO 16922859": {
            pdo: "PDO-92-LOU-1259.2",
            desc: "Normal",
            coords: [38.822771, -9.144502],
            status: "aberta"
        }
    };

    // Função para criar ícones
    function createCustomIcon(color) {
        return L.divIcon({
            className: 'custom-icon',
            html: `<div style="
                width: 30px;
                height: 30px;
                background: ${color};
                border-radius: 50% 50% 50% 0;
                transform: rotate(-45deg);
                position: relative;
                box-shadow: 0 2px 4px rgba(0,0,0,0.2);
            ">
                <div style="
                    width: 14px;
                    height: 14px;
                    background: rgba(255,255,255,0.8);
                    border-radius: 50%;
                    position: absolute;
                    top: 8px;
                    left: 8px;
                "></div>
            </div>`,
            iconSize: [30, 30],
            iconAnchor: [15, 30]
        });
    }

    // Verificar e carregar dados iniciais
    database.ref('workOrders').once('value').then((snapshot) => {
        if (!snapshot.exists()) {
            database.ref('workOrders').set(initialData)
                .then(() => console.log('Dados iniciais carregados'))
                .catch(error => console.error('Erro ao carregar dados:', error));
        }
    });

    // Ouvinte para atualizações em tempo real
    database.ref('workOrders').on('value', (snapshot) => {
        const data = snapshot.val() || {};
        
        // Atualizar marcadores
        Object.entries(data).forEach(([wo, order]) => {
            if (order.coords && order.coords.length === 2) {
                if (!markers[wo]) {
                    // Criar novo marcador
                    markers[wo] = L.marker(order.coords, {
                        icon: createCustomIcon(order.status === 'fechada' ? '#e74c3c' : '#3498db')
                    }).addTo(map);
                    
                    // Criar popup
                    updatePopup(wo, order);
                } else {
                    // Atualizar marcador existente
                    markers[wo].setLatLng(order.coords);
                    markers[wo].setIcon(createCustomIcon(order.status === 'fechada' ? '#e74c3c' : '#3498db'));
                    updatePopup(wo, order);
                }
            }
        });
    });

    // Função para atualizar popup
    function updatePopup(wo, order) {
        const popupContent = `
            <div style="min-width: 200px;">
                <div style="font-weight: bold; margin-bottom: 5px;">${wo}</div>
                <div style="margin-bottom: 3px;">${order.pdo}</div>
                <div style="margin-bottom: 3px;">${order.desc || ''}</div>
                <div style="display: inline-block; padding: 2px 8px; background: ${order.status === 'fechada' ? '#e74c3c' : '#3498db'}; 
                    color: white; border-radius: 3px; margin: 5px 0; font-size: 0.9em;">
                    ${order.status === 'fechada' ? 'Fechada' : 'Aberta'}
                </div>
                <div>
                    <a href="https://www.google.com/maps?q=${order.coords[0]},${order.coords[1]}" 
                       target="_blank" style="color: #3498db; text-decoration: none;">
                       <i class="fas fa-map-marker-alt"></i> Abrir no Google Maps
                    </a>
                </div>
                <div style="margin-top: 8px;">
                    <button onclick="updateOrderStatus('${wo}', 'aberta')" 
                            style="${order.status === 'aberta' ? 'background:#3498db;color:white;' : ''}
                                   padding: 3px 8px; border: none; border-radius: 3px; margin-right: 5px; font-size: 0.8em;">
                        Aberta
                    </button>
                    <button onclick="updateOrderStatus('${wo}', 'fechada')" 
                            style="${order.status === 'fechada' ? 'background:#e74c3c;color:white;' : ''}
                                   padding: 3px 8px; border: none; border-radius: 3px; font-size: 0.8em;">
                        Fechada
                    </button>
                </div>
            </div>
        `;
        
        markers[wo].bindPopup(popupContent);
    }
});

// Função global para atualizar status
function updateOrderStatus(wo, status) {
    const database = firebase.database();
    database.ref('workOrders/' + wo).update({
        status: status,
        lastUpdated: firebase.database.ServerValue.TIMESTAMP
    });
}
