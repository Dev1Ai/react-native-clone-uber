// TODO: Replace with real Stripe Connect integration
export async function createServicePayment(jobId: string, amount: number) {
  console.log('💳 Mock payment for job', jobId, 'amount', amount);
  return { status: 'success', id: 'mock_txn_123' };
}
