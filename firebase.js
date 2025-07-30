// Versão corrigida do firebase.js
document.addEventListener('DOMContentLoaded', () => {
    const database = firebase.database();
    const markers = {};
    
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
            ">
                <div style="
                    width: 14px;
                    height: 14px;
                    background: white;
                    border-radius: 50%;
                    position: absolute;
                    top: 8px;
                    left: 8px;
                "></div>
            </div>`,
            iconSize: [30, 30]
        });
    }

    // Ouvinte do Firebase
    database.ref('workOrders').on('value', (snapshot) => {
        const data = snapshot.val() || {};
        
        // Limpar marcadores antigos
        Object.keys(markers).forEach(key => {
            map.removeLayer(markers[key]);
            delete markers[key];
        });
        
        // Adicionar novos marcadores
        Object.entries(data).forEach(([wo, order]) => {
            if (order.coords) {
                markers[wo] = L.marker(order.coords, {
                    icon: createCustomIcon(order.status === 'fechada' ? 'red' : 'blue')
                }).addTo(map).bindPopup(`
                    <b>${wo}</b><br>
                    ${order.pdo}<br>
                    Status: ${order.status}<br>
                    <a href="https://maps.google.com?q=${order.coords[0]},${order.coords[1]}" target="_blank">
                        Abrir no Google Maps
                    </a>
                `);
            }
        });
        
        console.log('Marcadores atualizados:', markers);
    });
});
