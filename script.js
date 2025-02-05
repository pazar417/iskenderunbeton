let orders = [];

document.getElementById('orderForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const donerType = document.querySelector('input[name="donerType"]:checked').value;
    const extraMeat = document.getElementById('extraMeat').checked;
    const noOnion = document.getElementById('noOnion').checked;
    const extraBread = document.getElementById('extraBread').checked;
    const lessBread = document.getElementById('lessBread').checked;
    const notes = document.getElementById('notes').value;

    // Create order object
    const order = {
        type: donerType,
        extraMeat,
        noOnion,
        extraBread,
        lessBread,
        notes
    };

    // Create order key for grouping similar orders
    const orderKey = JSON.stringify(order);

    // Add or update order count
    const existingOrderIndex = orders.findIndex(o => JSON.stringify(o.order) === orderKey);
    if (existingOrderIndex >= 0) {
        orders[existingOrderIndex].count++;
    } else {
        orders.push({
            order,
            count: 1
        });
    }

    // Update display
    updateOrdersList();
    
    // Reset form
    document.getElementById('orderForm').reset();
});

function updateOrdersList() {
    const ordersList = document.getElementById('ordersList');
    let html = '';
    let totalOrders = 0;

    orders.forEach(({order, count}) => {
        let specifications = [];
        if (order.extraMeat) specifications.push('Bol Etli');
        if (order.noOnion) specifications.push('Soğansız');
        if (order.extraBread) specifications.push('Bol Ekmekli');
        if (order.lessBread) specifications.push('Az Ekmekli');

        html += `
            <div class="order-item">
                <span class="order-count">${count}x</span>
                <strong>${order.type === 'et' ? 'Et Döner' : 'Tavuk Döner'}</strong>
                ${specifications.length > 0 ? ` (${specifications.join(', ')})` : ''}
                ${order.notes ? `<br><em>Not: ${order.notes}</em>` : ''}
            </div>
        `;
        
        totalOrders += count;
    });

    ordersList.innerHTML = html;
    document.getElementById('totalOrders').textContent = totalOrders;
}
