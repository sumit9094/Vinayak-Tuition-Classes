import FeePayment from '@/models/FeePayment';

/**
 * Ensures a FeePayment document has a permanent, sequential receiptNumber (e.g. #0001, #0002).
 * If missing, assigns a unique sequential number based on payment creation order.
 */
export async function ensureReceiptNumber(payment: any): Promise<string> {
  if (payment.receiptNumber) {
    return payment.receiptNumber;
  }

  // Count existing payments recorded prior to or at the same time as this payment
  const paymentTime = payment.paidAt || payment.createdAt || new Date();
  const count = await FeePayment.countDocuments({
    $or: [
      { paidAt: { $lt: paymentTime } },
      {
        paidAt: paymentTime,
        _id: { $lte: payment._id }
      }
    ]
  });

  // Calculate formatted receipt number (e.g. #0001)
  let nextNum = count > 0 ? count : 1;
  let receiptNum = `#${nextNum.toString().padStart(4, '0')}`;

  // Handle potential collision edge cases by checking if receiptNum already exists
  let exists = await FeePayment.findOne({ receiptNumber: receiptNum });
  while (exists && exists._id.toString() !== payment._id.toString()) {
    nextNum += 1;
    receiptNum = `#${nextNum.toString().padStart(4, '0')}`;
    exists = await FeePayment.findOne({ receiptNumber: receiptNum });
  }

  // Persist to document in MongoDB
  try {
    await FeePayment.updateOne(
      { _id: payment._id },
      { $set: { receiptNumber: receiptNum } }
    );
  } catch (err) {
    console.error('Error saving receiptNumber:', err);
  }

  payment.receiptNumber = receiptNum;
  return receiptNum;
}
