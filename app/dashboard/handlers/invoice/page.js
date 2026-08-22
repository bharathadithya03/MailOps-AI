import HandlerPage from '@/components/dashboard/HandlerPage';

export default function InvoiceHandlerPage() {
  return (
    <HandlerPage
      handlerType="invoice"
      title="Invoice Handler"
      description="Processes incoming invoices, extracts key data, validates against vendor records, and queues for payment."
    />
  );
}
