import "./LegalPage.css";

export default function PrivacidadPage() {
  return (
    <div className="container legal-page">
      <h1>Aviso de privacidad</h1>

      <h2>Datos que recopilamos</h2>
      <p>
        Al realizar un pedido recopilamos tu nombre, teléfono, correo electrónico y dirección de entrega,
        únicamente para procesar tu compra y coordinar la entrega vía WhatsApp.
      </p>

      <h2>Programa de fidelidad</h2>
      <p>
        Si participas en nuestro programa de fidelidad, guardamos tu nombre, teléfono y número de compras
        para llevar el registro de tus recompensas.
      </p>

      <h2>Uso de la información</h2>
      <ul>
        <li>Procesar y confirmar tus pedidos.</li>
        <li>Contactarte por WhatsApp sobre el estado de tu compra.</li>
        <li>Llevar el registro de tu tarjeta de fidelidad.</li>
      </ul>

      <h2>Contacto</h2>
      <p>
        Si tienes dudas sobre el manejo de tus datos personales, escríbenos por WhatsApp y con gusto te
        atenderemos.
      </p>
    </div>
  );
}
