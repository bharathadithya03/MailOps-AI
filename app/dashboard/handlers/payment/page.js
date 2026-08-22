import HandlerPage from '@/components/dashboard/HandlerPage';

export default function PaymentHandlerPage() {
  return (
    <HandlerPage
      handlerType="payment"
      title="Payment Handler"
      description="Handles payment confirmations, wire transfers, payment requests, and payment-related inquiries."
    />
  );
}
