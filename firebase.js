// Firebase Realtime Database Listener
document.addEventListener('DOMContentLoaded', () => {
    const database = firebase.database();
    
    // Carregar dados iniciais se o banco estiver vazio
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

    database.ref('workOrders').once('value').then((snapshot) => {
        if (!snapshot.exists()) {
            database.ref('workOrders').set(initialData)
                .then(() => console.log('Dados iniciais carregados'))
                .catch(error => console.error('Erro ao carregar dados:', error));
        }
    });
});

// Função global para atualizar status
function updateOrderStatus(wo, status) {
    const database = firebase.database();
    database.ref('workOrders/' + wo).update({
        status: status,
        lastUpdated: firebase.database.ServerValue.TIMESTAMP
    });
}

// Função global para excluir ordem
function deleteOrder(wo) {
    if (confirm(`Tem certeza que deseja excluir a ordem ${wo}?`)) {
        const database = firebase.database();
        database.ref('workOrders/' + wo).remove()
            .catch(error => console.error('Erro ao excluir:', error));
    }
}
