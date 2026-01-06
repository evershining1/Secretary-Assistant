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
        e.preventDefault();
        setIsProcessing(true);

        // Simulate network delay for "Stripe" processing
        setTimeout(async () => {
            try {
                // 1. Update User Tier in Supabase
                await updateProfile({ tier: 'premium' });

                // 2. Send Professional confirmation email via Resend
                await EmailService.sendUpgradeConfirmation(user.email, planName);

                setIsProcessing(false);
                setIsSuccess(true);

                // 3. Redirect to dashboard after a short delay
                setTimeout(() => navigate('/'), 3000);
            } catch (err) {
                console.error('Checkout failed:', err);
                useUIStore.getState().addNotification('Payment processing failed. Please try again.', 'error');
                setIsProcessing(false);
            }
        }, 2000);
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
                        Your transaction is secure and encrypted. We do not store your full card details.
                    </p>
                </div>
            </div>

            {/* Right Side: Payment Form */}
            <div className="bg-white dark:bg-slate-900 rounded-[40px] shadow-2xl border border-slate-200 dark:border-white/5 p-10 animate-in slide-in-from-right-4 duration-500">
                <h2 className="text-xl font-bold mb-8 dark:text-white">Select Payment Method</h2>

                <div className="grid grid-cols-2 gap-4 mb-8">
                    <button
                        onClick={() => setPaymentMethod('card')}
                        className={clsx(
                            "py-4 rounded-2xl border flex flex-col items-center gap-2 transition-all font-bold",
                            paymentMethod === 'card'
                                ? "bg-skin-accent/5 border-skin-accent text-skin-accent shadow-lg shadow-skin-accent/10"
                                : "border-slate-200 dark:border-white/5 text-slate-400 hover:bg-slate-50 dark:hover:bg-white/5"
                        )}
                    >
                        <CreditCard size={24} />
                        <span className="text-xs">Credit Card</span>
                    </button>
                    <button
                        onClick={() => setPaymentMethod('apple')}
                        className={clsx(
                            "py-4 rounded-2xl border flex flex-col items-center gap-2 transition-all font-bold",
                            paymentMethod === 'apple'
                                ? "bg-slate-900 dark:bg-slate-800 border-slate-900 text-white shadow-lg shadow-slate-900/40"
                                : "border-slate-200 dark:border-white/5 text-slate-400 hover:bg-slate-50 dark:hover:bg-white/5"
                        )}
                    >
                        <Apple size={24} />
                        <span className="text-xs">Apple Pay</span>
                    </button>
                </div>

                {paymentMethod === 'card' ? (
                    <form onSubmit={handlePayment} className="space-y-6">
                        <div>
                            <label className="block text-xs font-black uppercase text-slate-400 mb-2">Card Number</label>
                            <div className="relative">
                                <input
                                    required
                                    className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl py-4 px-4 text-sm focus:ring-2 focus:ring-skin-accent outline-none dark:text-white"
                                    placeholder="•••• •••• •••• ••••"
                                />
                                <CreditCard className="absolute right-4 top-4 text-slate-300" size={18} />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-black uppercase text-slate-400 mb-2">Expiry Date</label>
                                <input required className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl py-4 px-4 text-sm focus:ring-2 focus:ring-skin-accent outline-none dark:text-white" placeholder="MM / YY" />
                            </div>
                            <div>
                                <label className="block text-xs font-black uppercase text-slate-400 mb-2">CVC</label>
                                <div className="relative">
                                    <input required className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl py-4 px-4 text-sm focus:ring-2 focus:ring-skin-accent outline-none dark:text-white" placeholder="123" />
                                    <Lock className="absolute right-4 top-4 text-slate-300" size={18} />
                                </div>
                            </div>
                        </div>
                        <button
                            type="submit"
                            disabled={isProcessing}
                            className="w-full bg-skin-accent text-white py-5 rounded-[24px] font-black shadow-xl shadow-skin-accent/20 hover:scale-[1.01] active:scale-95 transition-all flex items-center justify-center gap-3"
                        >
                            {isProcessing ? (
                                <>
                                    <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                                    <span>Processing...</span>
                                </>
                            ) : (
                                <span>Pay ${price}.00</span>
                            )}
                        </button>
                    </form>
                ) : (
                    <div className="space-y-6">
                        <p className="text-center text-sm text-slate-400 mb-6">Confirm and pay with your Apple account.</p>
                        <button
                            onClick={handlePayment}
                            disabled={isProcessing}
                            className="w-full bg-black text-white py-5 rounded-[24px] font-bold flex items-center justify-center gap-2 hover:opacity-90 active:scale-95 transition-all shadow-xl shadow-black/20"
                        >
                            <Apple size={24} />
                            <span>{isProcessing ? 'Confirming...' : 'Pay with Apple Pay'}</span>
                        </button>
                    </div>
                )}

                <p className="mt-8 text-center text-[10px] text-slate-400 uppercase tracking-widest font-bold">
                    Powered by Stripe - Test Mode
                </p>
            </div>
        </div>
    );
}

export default CheckoutPage;
