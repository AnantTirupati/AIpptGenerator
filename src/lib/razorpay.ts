// Razorpay checkout utility — browser-side, secure production checkout

export const loadRazorpayScript = (): Promise<boolean> => {
  return new Promise((resolve) => {
    if ((window as any).Razorpay) {
      resolve(true);
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

export interface RazorpayCheckoutOptions {
  amountInr: number;
  planName: string;
  userName: string;
  userEmail: string;
  onSuccess: (paymentId: string) => void;
  onDismiss?: () => void;
}

export const openRazorpayCheckout = async (opts: RazorpayCheckoutOptions) => {
  const loaded = await loadRazorpayScript();
  if (!loaded) {
    alert('Razorpay SDK failed to load. Please check your connection.');
    return;
  }

  const key = import.meta.env.VITE_RAZORPAY_KEY_ID;

  const options = {
    key,
    amount: opts.amountInr * 100, // paise
    currency: 'INR',
    name: 'AI PPT Maker',
    description: `${opts.planName} — Monthly Subscription`,
    image: '/logo.png',
    handler: (response: { razorpay_payment_id: string }) => {
      opts.onSuccess(response.razorpay_payment_id);
    },
    prefill: {
      name: opts.userName,
      email: opts.userEmail,
    },
    notes: { plan: opts.planName },
    theme: { color: '#7C3AED' },
    modal: {
      ondismiss: () => opts.onDismiss?.(),
    },
  };

  const rzp = new (window as any).Razorpay(options);
  rzp.open();
};
