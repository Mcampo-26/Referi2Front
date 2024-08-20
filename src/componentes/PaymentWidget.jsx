import React, { useEffect, useRef } from 'react';
import usePaymentStore from '../store/usePaymentStore';

const PaymentWidget = () => {
  const { paymentInitPoint } = usePaymentStore();
  const widgetContainer = useRef(null);

  useEffect(() => {
    if (paymentInitPoint && widgetContainer.current) {
      // Cargar el código HTML del widget
      widgetContainer.current.innerHTML = `
        <script src="https://www.mercadopago.com.ar/v2/security.js"></script>
        <div id="wallet_container" data-preference-id="${paymentInitPoint}"></div>
        <script>
          window.onload = function() {
            var mp = new MercadoPago('YOUR_PUBLIC_KEY'); // Reemplaza con tu clave pública
            mp.bricks().create('wallet', 'wallet_container');
          }
        </script>
      `;
    }
  }, [paymentInitPoint]);

  return <div ref={widgetContainer}></div>;
};

export default PaymentWidget;
