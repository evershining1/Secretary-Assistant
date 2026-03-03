import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { CreditCard, Apple, ArrowLeft, ShieldCheck, Lock, CheckCircle } from 'lucide-react';
import useStore from '../../store/useStore';
import { useUIStore } from '../../store/useUIStore';
import { EmailService } from '../../services/EmailService';
import clsx from 'clsx';

/**
 * CheckoutPage - Secure Payment Experience
 */
function CheckoutPage() {
    const location = useLocation();
    const navigate = useNavigate();
    const { user, updateProfile } = useStore();
    const planType = location.state?.plan || 'monthly';

    const [isProcessing, setIsProcessing] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState('card'); // 'card' | 'apple'

    const price = planType === 'monthly' ? 5 : 48;
    const planName = planType === 'monthly' ? 'Premium Monthly' : 'Premium Annual';

    const handlePayment = async (e) => {
        if (e) e.preventDefault();
        setIsProcessing(true);

        try {
            // Append the unique user ID so Stripe webhooks text us exactly who paid!
            const stripeLink = `https://buy.stripe.com/test_3cIdR9fOy1M37fhbcHeME00?client_reference_id=${user.id}`;
            window.location.href = stripeLink;
        } catch (err) {
            console.error('Checkout failed:', err);
            useUIStore.getState().addNotification('Payment initialization failed.', 'error');
            setIsProcessing(false);
        }
    };

    if (isSuccess) {
        return (
            <div className="min-h-[80vh] flex flex-col items-center justify-center text-center animate-in zoom-in-95 duration-500">
                <div className="w-24 h-24 bg-emerald-500 text-white rounded-full flex items-center justify-center mb-8 shadow-2xl shadow-emerald-500/40">
                    <CheckCircle size={48} strokeWidth={3} />
                </div>
                <h1 className="text-4xl font-black text-slate-900 dark:text-white mb-4">Payment Successful!</h1>
                <p className="text-xl text-slate-500 dark:text-slate-400 mb-8 max-w-md mx-auto">
                    Welcome to the Premium tier. Your unlimited sync and AI insights are now active.
                </p>
                <p className="text-sm text-slate-400">Redirecting to your dashboard...</p>
            </div>
        );
    }

    return (
        <div className="py-12 max-w-5xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
            {/* Left Side: Order Summary */}
            <div className="animate-in slide-in-from-left-4 duration-500">
                <button
                    onClick={() => navigate('/pricing')}
                    className="flex items-center gap-2 text-slate-400 hover:text-skin-accent transition-colors mb-8 font-bold text-sm"
                >
                    <ArrowLeft size={16} />
                    <span>Back to Plans</span>
                </button>

                <h1 className="text-3xl font-black text-slate-900 dark:text-white mb-8">Review Order</h1>

                <div className="bg-white dark:bg-slate-900/50 rounded-[32px] border border-slate-200 dark:border-white/5 p-8 shadow-sm">
                    <div className="flex justify-between items-center mb-6">
                        <div>
                            <h3 className="font-bold text-lg dark:text-white">{planName}</h3>
                            <p className="text-sm text-slate-400">Full access to Secretary Premium</p>
                        </div>
                        <span className="text-xl font-black dark:text-white">${price}.00</span>
                    </div>

                    <div className="border-t border-slate-100 dark:border-white/5 pt-6 space-y-4">
                        <div className="flex justify-between text-sm">
                            <span className="text-slate-500">Subtotal</span>
                            <span className="font-medium dark:text-white">${price}.00</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-slate-500">Tax</span>
                            <span className="font-medium dark:text-white">$0.00</span>
                        </div>
                        <div className="flex justify-between pt-4 border-t border-slate-100 dark:border-white/5 font-black text-xl">
                            <span className="dark:text-white">Total</span>
                            <span className="text-skin-accent">${price}.00</span>
                        </div>
                    </div>
                </div>

                <div className="mt-8 flex items-center gap-4 p-4 bg-emerald-50 dark:bg-emerald-500/10 rounded-2xl border border-emerald-100 dark:border-emerald-500/20">
                    <ShieldCheck className="text-emerald-600" size={24} />
                    <p className="text-xs text-emerald-800 dark:text-emerald-300 font-medium">
                        Your transaction is completely managed by Stripe, a secure payment provider.
                    </p>
                </div>
            </div>

            {/* Right Side: Payment Form */}
            <div className="bg-white dark:bg-slate-900 rounded-[40px] shadow-2xl border border-slate-200 dark:border-white/5 p-10 flex flex-col items-center justify-center text-center animate-in slide-in-from-right-4 duration-500">
                <div className="w-16 h-16 bg-skin-accent/10 text-skin-accent rounded-full flex items-center justify-center mb-6">
                    <Lock size={32} />
                </div>
                <h2 className="text-2xl font-bold mb-4 dark:text-white">Secure Payment Gateway</h2>
                <p className="text-slate-500 dark:text-slate-400 mb-8 max-w-sm">
                    You'll be redirected to our encrypted Stripe checkout page to complete your purchase securely. Supports Apple Pay, Google Pay, and all major credit cards.
                </p>

                <button
                    onClick={handlePayment}
                    disabled={isProcessing}
                    className="w-full bg-skin-accent text-white py-5 rounded-[24px] font-black shadow-xl shadow-skin-accent/20 hover:scale-[1.01] active:scale-95 transition-all flex items-center justify-center gap-3"
                >
                    {isProcessing ? (
                        <>
                            <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                            <span>Redirecting to Stripe...</span>
                        </>
                    ) : (
                        <span>Proceed to Checkout</span>
                    )}
                </button>

                <p className="mt-8 text-center text-[10px] text-slate-400 uppercase tracking-widest font-bold">
                    Powered by Stripe - Test Mode
                </p>
            </div>
        </div>
    );
}

export default CheckoutPage;
