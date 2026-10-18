with open('admin/styles.css', 'r', encoding='utf-8') as f:
    css = f.read()

pos_light_css = """
/* Interactive POS Order Builder Modal Styling (LIGHT CREATIVE THEME) */
.pos-order-modal {
    width: 1180px !important;
    max-width: 95vw !important;
    max-height: 92vh !important;
    background-color: #FFFFFF !important;
    border: 1px solid #E2E8F0 !important;
    border-radius: 22px !important;
    box-shadow: 0 25px 70px rgba(0, 0, 0, 0.12), 0 0 40px rgba(16, 185, 129, 0.12) !important;
    overflow: hidden;
    padding: 24px 28px;
    display: flex;
    flex-direction: column;
    transform: scale(0.9) translateY(24px);
    transition: transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.35s ease;
    color: #0F172A !important;
}

.modal-overlay.active .pos-order-modal {
    transform: scale(1) translateY(0) !important;
}

.pos-modal-layout {
    display: grid;
    grid-template-columns: 1.4fr 1fr;
    gap: 24px;
    margin-top: 14px;
    max-height: calc(88vh - 70px);
}

.pos-picker-pane {
    background: #F8FAFC !important;
    border: 1px solid #E2E8F0 !important;
    border-radius: var(--radius-md);
    padding: 18px;
    display: flex;
    flex-direction: column;
    overflow-y: auto;
    scrollbar-width: thin;
}

.pos-cart-pane {
    background: #FFFFFF !important;
    border: 1.5px solid #E2E8F0 !important;
    border-radius: var(--radius-md);
    padding: 18px;
    display: flex;
    flex-direction: column;
    overflow-y: auto;
    scrollbar-width: thin;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.04);
}

.pos-section-label {
    font-size: 12px;
    font-weight: 700;
    color: #475569 !important;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    margin-bottom: 10px;
    display: flex;
    align-items: center;
    gap: 6px;
}

.pos-cat-pills-bar {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    padding-bottom: 6px;
}

.pos-cat-pill {
    background: #FFFFFF !important;
    border: 1.5px solid #CBD5E1 !important;
    color: #475569 !important;
    font-size: 12px;
    font-weight: 700;
    padding: 8px 16px;
    border-radius: var(--radius-full);
    cursor: pointer;
    white-space: nowrap;
    transition: all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
    box-shadow: 0 2px 6px rgba(0,0,0,0.02);
}

.pos-cat-pill:hover,
.pos-cat-pill.active {
    background: linear-gradient(135deg, #10B981 0%, #059669 100%) !important;
    color: #FFFFFF !important;
    border-color: #10B981 !important;
    transform: scale(1.06);
    box-shadow: 0 4px 14px rgba(16, 185, 129, 0.35) !important;
}

.pos-dishes-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 12px;
    margin-top: 8px;
}

.pos-dish-card {
    background: #FFFFFF !important;
    border: 1.5px solid #E2E8F0 !important;
    border-radius: var(--radius-md);
    padding: 10px;
    display: flex;
    align-items: center;
    gap: 10px;
    cursor: pointer;
    transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
    box-shadow: 0 2px 8px rgba(0,0,0,0.03);
    animation: posDishCardPop 0.35s cubic-bezier(0.16, 1, 0.3, 1) ease-out forwards;
}

.pos-dish-card:hover {
    border-color: #10B981 !important;
    transform: translateY(-3px) scale(1.02);
    box-shadow: 0 8px 24px rgba(16, 185, 129, 0.22) !important;
    background: #F0FDF4 !important;
}

.pos-dish-card:active {
    transform: scale(0.96);
}

.pos-dish-thumb {
    width: 44px;
    height: 44px;
    border-radius: var(--radius-sm);
    object-fit: cover;
    flex-shrink: 0;
}

.pos-dish-info {
    display: flex;
    flex-direction: column;
    flex: 1;
    min-width: 0;
}

.pos-dish-name {
    font-size: 12px;
    font-weight: 700;
    color: #0F172A !important;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.pos-dish-price {
    font-size: 13px;
    font-weight: 800;
    color: #059669 !important;
}

.pos-add-icon {
    width: 28px;
    height: 28px;
    background: #E6F4EA !important;
    color: #059669 !important;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 12px;
    flex-shrink: 0;
}

.pos-form-row {
    display: flex;
    gap: 10px;
    margin-bottom: 8px;
}

.pos-form-row .form-group-dark {
    flex: 1;
    margin-bottom: 0;
}

.pos-form-row .form-group-dark label {
    font-size: 10px;
    margin-bottom: 4px;
    color: #475569 !important;
}

.pos-form-row .form-group-dark input,
.pos-form-row .form-group-dark select {
    padding: 8px 10px;
    font-size: 12px;
    background: #F8FAFC !important;
    border: 1.5px solid #CBD5E1 !important;
    color: #0F172A !important;
    border-radius: 8px !important;
}

.pos-cart-items-list {
    min-height: 140px;
    max-height: 180px;
    overflow-y: auto;
    background: #F8FAFC !important;
    border: 1px solid #E2E8F0 !important;
    border-radius: var(--radius-sm);
    padding: 8px;
    display: flex;
    flex-direction: column;
    gap: 6px;
    margin-bottom: 12px;
}

.pos-cart-empty {
    text-align: center;
    color: #64748B !important;
    font-size: 12px;
    padding: 40px 10px;
}

.pos-cart-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    background: #FFFFFF !important;
    border: 1px solid #E2E8F0 !important;
    padding: 6px 10px;
    border-radius: 6px;
    font-size: 12px;
    box-shadow: 0 2px 4px rgba(0,0,0,0.02);
}

.pos-cart-item-name {
    font-weight: 600;
    color: #0F172A !important;
    flex: 1;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    padding-right: 8px;
}

.pos-qty-controls {
    display: flex;
    align-items: center;
    gap: 6px;
}

.pos-qty-btn {
    width: 22px;
    height: 22px;
    background: #F1F5F9 !important;
    border: 1px solid #CBD5E1 !important;
    color: #0F172A !important;
    border-radius: 4px;
    cursor: pointer;
    font-size: 11px;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s ease;
}

.pos-qty-btn:hover {
    background: #10B981 !important;
    color: #FFFFFF !important;
    border-color: #10B981 !important;
}

.pos-cart-item-price {
    font-weight: 800;
    color: #059669 !important;
    min-width: 55px;
    text-align: right;
}

.pos-remove-btn {
    background: none;
    border: none;
    color: #EF4444 !important;
    cursor: pointer;
    font-size: 12px;
    margin-left: 6px;
}

.pos-total-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    font-size: 14px;
    font-weight: 700;
    color: #0F172A !important;
    border-top: 2px dashed #E2E8F0 !important;
    padding-top: 10px;
    margin-bottom: 14px;
}

.pos-total-row strong {
    font-size: 20px;
    color: #059669 !important;
}

.pos-cart-actions {
    display: flex;
    gap: 10px;
}

.pos-cart-actions button {
    flex: 1;
    padding: 10px 16px;
    border-radius: 10px;
    font-weight: 700;
    font-size: 13px;
    transition: all 0.25s ease;
}

.btn-cancel-pos {
    background: #F1F5F9 !important;
    color: #475569 !important;
    border: 1.5px solid #CBD5E1 !important;
}

.btn-cancel-pos:hover {
    background: #E2E8F0 !important;
    color: #0F172A !important;
}

.btn-confirm-pos {
    background: linear-gradient(135deg, #10B981 0%, #059669 100%) !important;
    color: #FFFFFF !important;
    border: none !important;
    box-shadow: 0 4px 14px rgba(16, 185, 129, 0.35) !important;
}

.btn-confirm-pos:hover {
    background: linear-gradient(135deg, #059669 0%, #047857 100%) !important;
    transform: translateY(-2px) !important;
    box-shadow: 0 6px 20px rgba(16, 185, 129, 0.45) !important;
}
"""

css += pos_light_css

with open('admin/styles.css', 'w', encoding='utf-8') as f:
    f.write(css)

print("POS Modal Light Theme added successfully!")
