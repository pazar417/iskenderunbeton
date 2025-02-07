let orders = [];

// Event listener for everything extra checkbox
document.getElementById('everythingExtra').addEventListener('change', function(e) {
    const otherOptions = document.getElementById('otherOptions');
    otherOptions.classList.toggle('hidden', this.checked);
    
    // Reset other options when "Herşeyi Bol" is checked
    if (this.checked) {
        const checkboxes = otherOptions.querySelectorAll('input[type="checkbox"]');
        checkboxes.forEach(checkbox => checkbox.checked = false);
    }
});

document.getElementById('orderForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const donerType = document.querySelector('input[name="donerType"]:checked').value;
    const everythingExtra = document.getElementById('everythingExtra').checked;
    const noOnion = document.getElementById('noOnion').checked;
    const breadAmount = document.querySelector('input[name="breadAmount"]:checked').value;
    const extraSauce = document.getElementById('extraSauce').checked;
    const halfPortion = document.getElementById('halfPortion').checked;
    const notes = document.getElementById('notes').value;

    // Create order object
    const order = {
        type: donerType,
        everythingExtra,
        noOnion,
        breadAmount,
        extraSauce,
        halfPortion,
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

    updateOrdersList();
    document.getElementById('orderForm').reset();
    document.getElementById('everythingExtra').checked = true;
    document.getElementById('otherOptions').classList.add('hidden');
});

function updateOrdersList() {
    const ordersList = document.getElementById('ordersList');
    let html = '';
    
    // Sayaçları fonksiyonun başında sıfırlayalım
    let totalOrders = 0;
    let chickenCount = 0;
    let meatCount = 0;

    // Önce tüm siparişleri sayalım
    orders.forEach(({order, count}, index) => {
        if (order.type === 'tavuk') {
            chickenCount += count;
        } else if (order.type === 'et') {
            meatCount += count;
        }
        totalOrders += count;

        let specifications = [];
        if (order.everythingExtra) specifications.push('Herşeyi Bol');
        if (order.noOnion) specifications.push('Soğansız');
        if (order.breadAmount === 'less') specifications.push('Az Ekmekli');
        if (order.breadAmount === 'extra') specifications.push('Bol Ekmekli');
        if (order.extraSauce) specifications.push('Bol Soslu');
        if (order.halfPortion) specifications.push('Yarım Döner');

        html += `
            <div class="order-item">
                <div class="order-content">
                    <span class="order-count">${count}x</span>
                    <strong>${order.type === 'et' ? 'Et Döner' : 'Tavuk Döner'}</strong>
                    ${specifications.length > 0 ? ` (${specifications.join(', ')})` : ''}
                    ${order.notes ? `<br><em>Not: ${order.notes}</em>` : ''}
                </div>
                <div class="order-controls">
                    <input type="number" class="edit-quantity" value="${count}" min="1" max="99"
                        onchange="updateOrderQuantity(${index}, this.value)">
                    <button onclick="deleteOrder(${index})" class="delete-btn">Sil</button>
                </div>
            </div>
        `;
    });

    // Siparişleri ve özeti güncelleyelim
    ordersList.innerHTML = html;
    
    // Özet bölümünü güncelleyelim
    const orderSummary = `
        <div class="order-type-summary">
            <div class="order-type-count">Tavuk Döner: <span>${chickenCount}</span></div>
            <div class="order-type-count">Et Döner: <span>${meatCount}</span></div>
            <div class="order-type-count total">Toplam: <span>${totalOrders}</span></div>
        </div>
    `;
    document.querySelector('.orders-summary').innerHTML = orderSummary;
}

// WhatsApp paylaşım fonksiyonu
function createOrderSummaryText() {
    // Toplam sayıları hesapla
    let chickenCount = 0;
    let meatCount = 0;
    orders.forEach(({order, count}) => {
        if (order.type === 'tavuk') chickenCount += count;
        else if (order.type === 'et') meatCount += count;
    });
    
    let text = `SIPARIS LISTESI (Toplam: ${chickenCount + meatCount} | Tavuk: ${chickenCount} | Et: ${meatCount})\n\n`;
    
    // Detaylı sipariş listesi
    orders.forEach(({order, count}) => {
        text += `${count} ${order.type === 'et' ? 'Et' : 'Tavuk'}`;
        
        let specs = [];
        if (order.everythingExtra) specs.push('Hepsi Bol');
        if (order.noOnion) specs.push('Sogansiz');
        if (order.breadAmount === 'less') specs.push('Az Ekmek');
        if (order.breadAmount === 'extra') specs.push('Bol Ekmek');
        if (order.extraSauce) specs.push('Bol Sos');
        if (order.halfPortion) specs.push('Yarim');
        
        // Özellikler ve notları birleştir
        let allSpecs = [...specs];
        if (order.notes) allSpecs.push(order.notes);
        
        // Eğer özellik veya not varsa parantez içinde göster
        if (allSpecs.length > 0) {
            text += ` (${allSpecs.join(', ')})`;
        }
        
        text += '\n';
    });

    return text;
}

// WhatsApp paylaşım butonu için event listener
document.getElementById('shareWhatsApp').addEventListener('click', function() {
    const text = createOrderSummaryText();
    const encodedText = encodeURIComponent(text);
    const whatsappUrl = `https://wa.me/?text=${encodedText}`;
    window.open(whatsappUrl, '_blank');
});

function deleteOrder(index) {
    if (confirm('Bu siparişi silmek istediğinizden emin misiniz?')) {
        orders.splice(index, 1);
        updateOrdersList();
    }
}

function updateOrderQuantity(index, newQuantity) {
    newQuantity = parseInt(newQuantity);
    if (newQuantity < 1) newQuantity = 1;
    if (newQuantity > 99) newQuantity = 99;
    
    orders[index].count = newQuantity;
    updateOrdersList();
}
