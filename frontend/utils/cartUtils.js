// Utilidades para gestionar el carrito de compras por usuario

/**
 * Decodifica un token JWT manualmente (sin dependencias externas)
 * @param {string} token - El token JWT
 * @returns {object|null} El payload decodificado o null si hay error
 */
function decodeJWT(token) {
    try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(
            atob(base64)
                .split('')
                .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
                .join('')
        );
        return JSON.parse(jsonPayload);
    } catch (error) {
        console.error('Error decodificando JWT:', error);
        return null;
    }
}

/**
 * Obtiene el DNI del usuario actual desde el token JWT
 * @returns {string|null} DNI del usuario o null si no hay sesión
 */
function getUserDNI() {
    try {
        const token = sessionStorage.getItem('token');
        if (!token) return null;
        
        const decoded = decodeJWT(token);
        return decoded?.dni || null;
    } catch (error) {
        console.error('Error obteniendo DNI del token:', error);
        return null;
    }
}

/**
 * Obtiene la clave del carrito para el usuario actual
 * @returns {string} Clave única del carrito (cart_DNI o cart_guest)
 */
function getCartKey() {
    const dni = getUserDNI();
    return dni ? `cart_${dni}` : 'cart_guest';
}

/**
 * Obtiene el carrito del usuario actual
 * @returns {Array} Array de items del carrito
 */
export function getCart() {
    const key = getCartKey();
    const cart = localStorage.getItem(key);
    return cart ? JSON.parse(cart) : [];
}

/**
 * Guarda el carrito del usuario actual
 * @param {Array} cart - Array de items del carrito
 */
export function saveCart(cart) {
    const key = getCartKey();
    localStorage.setItem(key, JSON.stringify(cart));
}

/**
 * Limpia el carrito del usuario actual
 */
export function clearCart() {
    const key = getCartKey();
    localStorage.removeItem(key);
}

/**
 * Limpia todos los carritos (útil al cerrar sesión)
 */
export function clearAllCarts() {
    // Limpiar carrito del usuario actual
    clearCart();
    // También limpiar el carrito guest por si acaso
    localStorage.removeItem('cart_guest');
    // Limpiar el carrito antiguo sin prefijo (migración)
    localStorage.removeItem('cart');
}

/**
 * Migra el carrito antiguo (sin usuario) al carrito del usuario actual
 * Útil cuando un usuario inicia sesión después de añadir productos como invitado
 */
export function migrateOldCart() {
    const oldCart = localStorage.getItem('cart');
    if (oldCart) {
        const dni = getUserDNI();
        if (dni) {
            // Si hay usuario logueado, migrar el carrito
            const key = `cart_${dni}`;
            const existingCart = localStorage.getItem(key);
            
            if (!existingCart) {
                // Si no tiene carrito, usar el antiguo
                localStorage.setItem(key, oldCart);
            } else {
                // Si ya tiene carrito, combinar ambos
                const oldItems = JSON.parse(oldCart);
                const existingItems = JSON.parse(existingCart);
                
                // Combinar items sin duplicar
                const combined = [...existingItems];
                oldItems.forEach(oldItem => {
                    const exists = combined.find(i => i.id === oldItem.id);
                    if (!exists) {
                        combined.push(oldItem);
                    }
                });
                
                localStorage.setItem(key, JSON.stringify(combined));
            }
        }
        // Limpiar el carrito antiguo
        localStorage.removeItem('cart');
    }
}

/**
 * Obtiene el contador de items en el carrito
 * @returns {number} Número total de items
 */
export function getCartCount() {
    const cart = getCart();
    return cart.reduce((total, item) => total + (item.cantidad || 1), 0);
}
