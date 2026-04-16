import { useContext, useState } from 'react';
import { useUser } from '@clerk/clerk-react';
import { doc, serverTimestamp, updateDoc } from 'firebase/firestore';
import { firebaseDb } from '../../config/FirebaseConfig';
import { openRazorpayCheckout } from '../lib/razorpay';
import { UserDetailContext } from '../../context/UserDetailContext';
import Header from '../components/ui/custom/Header';
import { Button } from '../components/ui/button';
import { Check, Crown, Gem, Sparkles, Zap } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

const PLANS = [
  {
    id: 'free',
    name: 'Free',
    price: 0,
    icon: Gem,
    iconColor: '#6B7280',
    gradient: 'from-gray-50 to-gray-100',
    border: 'border-gray-200',
    badge: null,
    features: [
      '5 free project credits',
      'AI outline generation',
      'Style picker (12 themes)',
      'Slide editor',
      'Export to .pptx',
    ],
    cta: 'Current Plan',
    disabled: true,
  },
  {
    id: 'pro',
    name: 'Pro',
    price: 499,
    icon: Zap,
    iconColor: '#7C3AED',
    gradient: 'from-violet-50 to-purple-100',
    border: 'border-violet-400',
    badge: 'Most Popular',
    features: [
      'Unlimited project credits',
      'AI outline generation',
      'All 12 design styles',
      'Full slide content generation',
      'Inline slide editor',
      'Export to .pptx',
      'Priority AI generation',
    ],
    cta: 'Get Pro',
    disabled: false,
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: 999,
    icon: Crown,
    iconColor: '#D4AF37',
    gradient: 'from-amber-50 to-yellow-100',
    border: 'border-amber-400',
    badge: 'Best Value',
    features: [
      'Everything in Pro',
      'Unlimited team projects',
      'ImageKit image integration',
      'Custom branding',
      'Priority support',
      'Early feature access',
      'API access (coming soon)',
    ],
    cta: 'Get Enterprise',
    disabled: false,
  },
];

function PricingPage() {
  const { user } = useUser();
  const { userDetail, setUserDetail } = useContext(UserDetailContext);
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
  const [successPlan, setSuccessPlan] = useState<string | null>(null);
  const navigate = useNavigate();

  const isPremium = userDetail?.isPremium === true;

  const handleUpgrade = async (plan: typeof PLANS[0]) => {
    if (!user || plan.disabled || plan.price === 0) return;
    setLoadingPlan(plan.id);

    await openRazorpayCheckout({
      amountInr: plan.price,
      planName: plan.name,
      userName: user.fullName ?? 'User',
      userEmail: user.primaryEmailAddress?.emailAddress ?? '',
      onSuccess: async (paymentId) => {
        const email = user.primaryEmailAddress?.emailAddress ?? '';
        await updateDoc(doc(firebaseDb, 'users', email), {
          isPremium: true,
          credits: 9999,
          razorpayPaymentId: paymentId,
          premiumPlan: plan.name,
          premiumSince: serverTimestamp(),
        });
        setUserDetail((prev: any) => ({
          ...prev,
          isPremium: true,
          credits: 9999,
          premiumPlan: plan.name,
        }));
        setLoadingPlan(null);
        setSuccessPlan(plan.name);
        // Redirect to workspace after a short pause
        setTimeout(() => navigate('/workspace'), 2000);
      },
      onDismiss: () => setLoadingPlan(null),
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Hero */}
      <div className="text-center py-16 px-4">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
          <Sparkles className="w-4 h-4" />
          Simple, transparent pricing
        </div>
        <h1 className="text-5xl font-extrabold tracking-tight mb-4">
          Create stunning presentations
          <br />
          <span className="text-primary">powered by AI</span>
        </h1>
        <p className="text-xl text-muted-foreground max-w-xl mx-auto">
          Start free. Upgrade when you need more power.
          Cancel anytime.
        </p>

        {isPremium && (
          <div className="mt-6 inline-flex items-center gap-2 px-5 py-2 rounded-full bg-amber-100 text-amber-700 font-semibold text-sm">
            <Crown className="w-4 h-4" />
            You are on {userDetail?.premiumPlan ?? 'Premium'} — unlimited access
          </div>
        )}

        {successPlan && (
          <div className="mt-4 inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-green-100 text-green-800 font-semibold text-sm shadow animate-pulse">
            🎉 Welcome to <span className="font-bold">{successPlan}</span>! Redirecting to your workspace…
          </div>
        )}
      </div>

      {/* Plans */}
      <div className="max-w-5xl mx-auto px-6 pb-20 grid grid-cols-1 md:grid-cols-3 gap-6">
        {PLANS.map((plan) => {
          const Icon = plan.icon;
          const isCurrent = plan.id === 'free' && !isPremium;
          const isPlanActive = isPremium && (
            (plan.id === 'pro' && userDetail?.premiumPlan === 'Pro') ||
            (plan.id === 'enterprise' && userDetail?.premiumPlan === 'Enterprise')
          );

          return (
            <div
              key={plan.id}
              className={`relative rounded-3xl border-2 p-8 bg-gradient-to-b
                ${plan.gradient} ${plan.border}
                ${plan.badge ? 'shadow-xl scale-105' : 'shadow-md'}
                transition-all hover:shadow-xl`}
            >
              {/* Badge */}
              {plan.badge && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-primary text-primary-foreground text-xs font-bold uppercase tracking-wide shadow">
                  {plan.badge}
                </div>
              )}

              {/* Icon + Name */}
              <div className="flex items-center gap-3 mb-6">
                <div className="w-11 h-11 rounded-2xl flex items-center justify-center"
                  style={{ backgroundColor: plan.iconColor + '20' }}>
                  <Icon className="w-6 h-6" style={{ color: plan.iconColor }} />
                </div>
                <div>
                  <h2 className="text-xl font-bold">{plan.name}</h2>
                  {isCurrent || isPlanActive
                    ? <span className="text-xs text-primary font-semibold">Current Plan</span>
                    : null}
                </div>
              </div>

              {/* Price */}
              <div className="mb-6">
                {plan.price === 0 ? (
                  <span className="text-4xl font-extrabold">Free</span>
                ) : (
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-extrabold">₹{plan.price}</span>
                    <span className="text-muted-foreground text-sm">/month</span>
                  </div>
                )}
              </div>

              {/* Features */}
              <ul className="space-y-3 mb-8">
                {plan.features.map((feat) => (
                  <li key={feat} className="flex items-start gap-2 text-sm">
                    <Check className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                    {feat}
                  </li>
                ))}
              </ul>

              {/* CTA */}
              {isCurrent || isPlanActive ? (
                <Button variant="outline" className="w-full" disabled>
                  Current Plan
                </Button>
              ) : isPremium && plan.price > 0 ? (
                <Button variant="outline" className="w-full" disabled>
                  Already Premium
                </Button>
              ) : plan.price === 0 ? (
                <Link to="/workspace">
                  <Button variant="outline" className="w-full">Get Started Free</Button>
                </Link>
              ) : (
                <Button
                  className="w-full"
                  disabled={!!loadingPlan}
                  onClick={() => handleUpgrade(plan)}
                >
                  {loadingPlan === plan.id ? 'Opening checkout…' : plan.cta}
                </Button>
              )}
            </div>
          );
        })}
      </div>

      {/* Footer */}
      <div className="text-center pb-12 text-sm text-muted-foreground space-y-1">
        <p>
          Payments are{' '}
          <span className="font-semibold text-foreground">100% secured by Razorpay</span>.
          All transactions are encrypted.
        </p>
        <p>Cancel anytime. No hidden charges.</p>
      </div>
    </div>
  );
}

export default PricingPage;
